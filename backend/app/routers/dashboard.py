from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.messages import Message
from app.models.task import Task

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_messages = db.query(func.count(Message.id)).scalar() or 0
    analyzed_messages = db.query(func.count(Message.id)).filter(Message.is_analyzed == True).scalar() or 0
    
    total_tasks = db.query(func.count(Task.id)).scalar() or 0
    pending_tasks = db.query(func.count(Task.id)).filter(Task.status == "Pending").scalar() or 0
    in_progress_tasks = db.query(func.count(Task.id)).filter(Task.status == "In Progress").scalar() or 0
    completed_tasks = db.query(func.count(Task.id)).filter(Task.status == "Completed").scalar() or 0
    high_priority_tasks = db.query(func.count(Task.id)).filter(Task.priority == "High").scalar() or 0

    # Group messages by category
    categories_query = db.query(Message.category, func.count(Message.id)).filter(Message.category != None).group_by(Message.category).all()
    categories_breakdown = {cat: count for cat, count in categories_query}

    return {
        "messages": {
            "total": total_messages,
            "analyzed": analyzed_messages,
            "pending_analysis": total_messages - analyzed_messages
        },
        "tasks": {
            "total": total_tasks,
            "pending": pending_tasks,
            "in_progress": in_progress_tasks,
            "completed": completed_tasks,
            "high_priority": high_priority_tasks
        },
        "category_breakdown": categories_breakdown
    }