import os
from datetime import datetime
from dotenv import load_dotenv
from google import genai
from google.genai import types
from sqlalchemy.orm import Session

from app.models.messages import Message
from app.models.task import Task
from app.schemas.ai import AIAnalysisResult

load_dotenv()

# Initialize Gemini Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def analyze_message_content(message: Message) -> AIAnalysisResult:
    prompt = f"""
    You are an intelligent executive assistant for ActionFlow AI.
    Analyze the following incoming {message.type} and extract insights and actionable tasks.

    --- MESSAGE DETAILS ---
    Message ID: {message.id}
    Sender: {message.sender_name} <{message.sender_email}>
    Recipient: {message.recipient}
    Subject: {message.subject or 'No Subject'}
    Sent Date: {message.date.isoformat() if message.date else 'Unknown'}
    Content:
    \"\"\"{message.content}\"\"\"
    -----------------------

    CRITICAL RULES:
    1. SUMMARY: 1-2 concise sentences capturing the core message.
    2. CATEGORY: Classify into Request, Complaint, Meeting, Notification, General, Bug, or Inquiry.
    3. PRIORITY: High (critical bugs, outages, urgent legal/client requests), Medium (normal requests, meetings), Low (announcements, receipts).
    4. RESPONSE REQUIRED: True if the sender is waiting for a reply or deliverable; False for informational notices.
    5. SUGGESTED REPLY: If response_required is True, write a helpful, professional reply draft. If False, leave as null.
    6. TASKS:
       - ONLY extract tasks if the message contains explicit actionable work.
       - DO NOT create tasks for general announcements, holiday calendars, newsletters, automated alerts, or receipts.
       - DO NOT invent or assume due dates. Only extract a due_date if an explicit date or day (e.g. "before Thursday", "by Monday") is mentioned in the text.
    """

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=AIAnalysisResult,
            temperature=0.2, # Low temperature for reliable extraction
        ),
    )

    return AIAnalysisResult.model_validate_json(response.text)


def analyze_and_store_message(message_id: str, db: Session):
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        return None

    # Run AI Analysis
    analysis = analyze_message_content(message)

    # Update Message in MySQL
    message.is_analyzed = True
    message.summary = analysis.summary
    message.category = analysis.category
    message.priority = analysis.priority
    message.response_required = analysis.response_required
    message.suggested_reply = analysis.suggested_reply

    # Remove any old tasks for this message (if re-analyzing)
    db.query(Task).filter(Task.message_id == message.id).delete()

    # Create Extracted Tasks
    created_tasks = []
    for t in analysis.tasks:
        parsed_due_date = None
        if t.due_date:
            try:
                # Handle ISO date string
                parsed_due_date = datetime.fromisoformat(t.due_date.replace("Z", "+00:00"))
            except Exception:
                parsed_due_date = None

        new_task = Task(
            message_id=message.id,
            title=t.title,
            description=t.description,
            priority=t.priority,
            due_date=parsed_due_date,
            status="Pending"
        )
        db.add(new_task)
        created_tasks.append(new_task)

    db.commit()
    db.refresh(message)
    return {
        "message": message,
        "analysis": analysis,
        "tasks_created": len(created_tasks)
    }