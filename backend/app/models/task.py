from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    message_id = Column(String(50), ForeignKey("messages.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String(20), nullable=False)          # High, Medium, Low
    due_date = Column(DateTime, nullable=True)             # Explicit date only, never hallucinated
    status = Column(String(20), default="Pending", nullable=False) # Pending, In Progress, Completed

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship back to parent message
    message = relationship("Message", back_populates="tasks")