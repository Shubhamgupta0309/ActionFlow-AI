import json
import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.messages import Message
from app.schemas.messages import MessageImportPayload, RawMessageInput
from app.services.ai_service import analyze_and_store_message

router = APIRouter()

def process_and_save_messages(messages_data: List[RawMessageInput], db: Session):
    imported_count = 0
    skipped_count = 0

    for msg in messages_data:
        # Check if message ID already exists (idempotency)
        existing_msg = db.query(Message).filter(Message.id == msg.id).first()
        if existing_msg:
            skipped_count += 1
            continue

        new_message = Message(
            id=msg.id,
            type=msg.type,
            sender_name=msg.sender.name,
            sender_email=msg.sender.email,
            recipient=msg.recipient,
            subject=msg.subject,
            date=msg.date,
            content=msg.content,
            is_analyzed=False
        )
        db.add(new_message)
        imported_count += 1

    db.commit()
    return {
        "status": "success",
        "total_received": len(messages_data),
        "imported": imported_count,
        "duplicates_skipped": skipped_count
    }

# 1. Endpoint for direct JSON payload import
@router.post("/import")
def import_messages_json(payload: MessageImportPayload, db: Session = Depends(get_db)):
    return process_and_save_messages(payload.messages, db)

# 2. Endpoint for JSON file upload (.json file picker / drag-and-drop)
@router.post("/upload")
async def upload_messages_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".json"):
        raise HTTPException(status_code=400, detail="Only .json files are supported")

    content = await file.read()
    try:
        data = json.loads(content)
        validated_payload = MessageImportPayload(**data)
        return process_and_save_messages(validated_payload.messages, db)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Invalid JSON format: {str(e)}")

# 3. Endpoint to list all messages with optional filters
@router.get("/")
def get_messages(
    category: Optional[str] = None,
    priority: Optional[str] = None,
    is_analyzed: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Message)

    if category:
        query = query.filter(Message.category == category)
    if priority:
        query = query.filter(Message.priority == priority)
    if is_analyzed is not None:
        query = query.filter(Message.is_analyzed == is_analyzed)

    messages = query.order_by(Message.date.desc()).all()
    return {
        "total": len(messages),
        "messages": messages
    }

# Analyze a single message
@router.post("/{message_id}/analyze")
def analyze_single_message(message_id: str, db: Session = Depends(get_db)):
    result = analyze_and_store_message(message_id, db)
    if not result:
        raise HTTPException(status_code=404, detail="Message not found")
    return {
        "status": "success",
        "message_id": message_id,
        "summary": result["message"].summary,
        "category": result["message"].category,
        "priority": result["message"].priority,
        "response_required": result["message"].response_required,
        "suggested_reply": result["message"].suggested_reply,
        "tasks_created": result["tasks_created"]
    }

# Batch analyze all unanalyzed messages
@router.post("/analyze-all")
def analyze_all_messages(db: Session = Depends(get_db)):
    unanalyzed = db.query(Message).filter(Message.is_analyzed == False).all()
    results = []
    for msg in unanalyzed:
        try:
            res = analyze_and_store_message(msg.id, db)
            if res:
                results.append({"id": msg.id, "status": "analyzed", "tasks": res["tasks_created"]})
        except Exception as e:
            results.append({"id": msg.id, "status": "failed", "error": str(e)})

    return {
        "total_processed": len(results),
        "results": results
    }

@router.post("/analyze-all")
def analyze_all_messages(db: Session = Depends(get_db)):
    unanalyzed = db.query(Message).filter(Message.is_analyzed == False).all()
    results = []
    for msg in unanalyzed:
        try:
            res = analyze_and_store_message(msg.id, db)
            if res:
                results.append({"id": msg.id, "status": "analyzed", "tasks": res["tasks_created"]})
            time.sleep(2.5)  # Respect Gemini Free Tier (15 requests/minute)
        except Exception as e:
            results.append({"id": msg.id, "status": "failed", "error": str(e)})

    return {
        "total_processed": len(results),
        "results": results
    }