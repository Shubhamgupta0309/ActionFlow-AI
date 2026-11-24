from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(String(50), primary_key=True, index=True) # e.g. "MSG001"
    type = Column(String(20), nullable=False)              # "email" or "message"
    sender_name = Column(String(100), nullable=False)
    sender_email = Column(String(150), nullable=False)
    recipient = Column(String(150), nullable=False)
    subject = Column(String(255), nullable=True)
    date = Column(DateTime, nullable=False)
    content = Column(Text, nullable=False)

    # AI Analysis Fields (populated in Phase 3)
    is_analyzed = Column(Boolean, default=False, nullable=False)
    summary = Column(Text, nullable=True)
    category = Column(String(50), nullable=True)           # e.g., Request, Complaint, Meeting
    priority = Column(String(20), nullable=True)           # High, Medium, Low
    response_required = Column(Boolean, nullable=True)
    suggested_reply = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # One-to-many relationship: A message can produce multiple tasks
    tasks = relationship("Task", back_populates="message", cascade="all, delete-orphan")