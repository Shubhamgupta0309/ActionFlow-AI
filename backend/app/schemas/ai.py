from typing import List, Optional
from pydantic import BaseModel, Field

class ExtractedTaskSchema(BaseModel):
    title: str = Field(description="Clear, actionable task title")
    description: Optional[str] = Field(None, description="Detailed explanation of what needs to be done")
    priority: str = Field(description="Priority of the task: High, Medium, or Low")
    due_date: Optional[str] = Field(
        None, 
        description="Explicit due date mentioned in text in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS), or null if not explicitly stated. NEVER invent a date."
    )

class AIAnalysisResult(BaseModel):
    summary: str = Field(description="1-2 sentence concise summary of the message")
    category: str = Field(description="Primary category: Request, Complaint, Meeting, Notification, General, Bug, Inquiry")
    priority: str = Field(description="Message priority: High, Medium, or Low")
    response_required: bool = Field(description="True if sender expects a reply/action, False otherwise")
    suggested_reply: Optional[str] = Field(
        None, 
        description="A professional, courteous reply addressing the message content if response_required is True, otherwise null"
    )
    tasks: List[ExtractedTaskSchema] = Field(
        default=[], 
        description="List of actionable tasks. MUST BE EMPTY for newsletters, notifications, receipts, or messages requiring no action."
    )