import os
import base64
from datetime import datetime
from email.utils import parseaddr, parsedate_to_datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

from app.database import get_db
from app.models.messages import Message

router = APIRouter()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

# Cache code verifiers in memory keyed by OAuth state
OAUTH_VERIFIERS = {}

def get_google_flow(state=None):
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/gmail/callback")

    if not client_id or not client_secret:
        raise HTTPException(status_code=500, detail="Google OAuth credentials are not configured in .env")

    client_config = {
        "web": {
            "client_id": client_id,
            "client_secret": client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [redirect_uri]
        }
    }

    flow = Flow.from_client_config(
        client_config,
        scopes=SCOPES,
        redirect_uri=redirect_uri,
        state=state
    )
    return flow


# 1. Generate Google Authorization URL
@router.get("/auth-url")
def get_gmail_auth_url():
    flow = get_google_flow()
    auth_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'
    )
    # Store the PKCE code_verifier generated for this state
    if flow.code_verifier:
        OAUTH_VERIFIERS[state] = flow.code_verifier

    return {"auth_url": auth_url}


# 2. Google OAuth Callback (receives auth code, imports emails, redirects to UI)
@router.get("/callback")
def gmail_oauth_callback(
    code: str = Query(...),
    state: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

    try:
        flow = get_google_flow(state=state)
        # Retrieve the matching code_verifier
        verifier = OAUTH_VERIFIERS.pop(state, None)
        flow.fetch_token(code=code, code_verifier=verifier)
        credentials = flow.credentials

        # Build Gmail API client
        service = build('gmail', 'v1', credentials=credentials)

        # Fetch user's latest 10 inbox messages
        results = service.users().messages().list(
            userId='me', 
            maxResults=10, 
            labelIds=['INBOX']
        ).execute()
        messages_meta = results.get('messages', [])

        imported_count = 0

        for m in messages_meta:
            msg_id = m['id']
            custom_id = f"GMAIL_{msg_id}"

            # Skip if already imported into MySQL
            if db.query(Message).filter(Message.id == custom_id).first():
                continue

            # Fetch full message details
            msg_data = service.users().messages().get(userId='me', id=msg_id, format='full').execute()
            payload = msg_data.get('payload', {})
            headers = payload.get('headers', [])

            subject = "(No Subject)"
            from_header = "Unknown"
            date_header = None

            for h in headers:
                name = h.get('name', '').lower()
                if name == 'subject':
                    subject = h.get('value', '(No Subject)')
                elif name == 'from':
                    from_header = h.get('value', 'Unknown')
                elif name == 'date':
                    date_header = h.get('value')

            sender_name, sender_email = parseaddr(from_header)
            if not sender_name:
                sender_name = sender_email or "Unknown"

            # Parse email date (MySQL requires naive datetime without timezone)
            parsed_date = datetime.utcnow()
            if date_header:
                try:
                    dt = parsedate_to_datetime(date_header)
                    if dt.tzinfo:
                        dt = dt.astimezone().replace(tzinfo=None)
                    parsed_date = dt
                except Exception:
                    parsed_date = datetime.utcnow()

            # Extract email body snippet
            snippet = msg_data.get('snippet', '')

            # Create new Message record in MySQL
            new_msg = Message(
                id=custom_id,
                type="email",
                sender_name=sender_name[:100],
                sender_email=sender_email[:150] or "unknown@gmail.com",
                recipient="me",
                subject=subject[:255],
                date=parsed_date,
                content=snippet or subject,
                is_analyzed=False
            )
            db.add(new_msg)
            imported_count += 1

        db.commit()

        # Redirect user back to the React frontend dashboard
        return RedirectResponse(url=f"{FRONTEND_URL}/?gmail_imported={imported_count}")

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"status": "error", "detail": str(e)}