from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class TaskUpdateSchema(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None  # High, Medium, Low
    status: Optional[str] = None    # Pending, In Progress, Completed
    due_date: Optional[datetime] = None

class TaskResponseSchema(BaseModel):
    id: int
    message_id: str
    title: str
    description: Optional[str] = None
    priority: str
    due_date: Optional[datetime] = None
    status: str
    created_at: datetime
    updated_at: datetime

    # Parent message context for the UI
    sender_name: Optional[str] = None
    subject: Optional[str] = None

    class Config:
        from_attributes = True