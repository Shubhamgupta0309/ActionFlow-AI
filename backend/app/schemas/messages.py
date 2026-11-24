from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

class SenderSchema(BaseModel):
    name: str
    email: EmailStr

class RawMessageInput(BaseModel):
    id: str = Field(..., example="MSG001")
    type: str = Field(..., example="email") # "email" or "message"
    sender: SenderSchema
    recipient: str
    subject: Optional[str] = None
    date: datetime
    content: str
    attachments: Optional[List[dict]] = []

class MessageImportPayload(BaseModel):
    messages: List[RawMessageInput]