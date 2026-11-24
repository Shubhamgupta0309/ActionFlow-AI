from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import get_db
from app.models.task import Task
from app.models.messages import Message
from app.schemas.task import TaskUpdateSchema, TaskResponseSchema

router = APIRouter()

@router.get("/")
def get_tasks(
    status: Optional[str] = Query(None, description="Filter by status: Pending, In Progress, Completed"),
    priority: Optional[str] = Query(None, description="Filter by priority: High, Medium, Low"),
    search: Optional[str] = Query(None, description="Search keyword in title or description"),
    db: Session = Depends(get_db)
):
    query = db.query(Task).join(Message, Task.message_id == Message.id)

    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Task.title.ilike(search_filter),
                Task.description.ilike(search_filter),
                Message.subject.ilike(search_filter)
            )
        )

    tasks = query.order_by(Task.created_at.desc()).all()

    # Enrich with parent message details
    results = []
    for t in tasks:
        results.append({
            "id": t.id,
            "message_id": t.message_id,
            "title": t.title,
            "description": t.description,
            "priority": t.priority,
            "due_date": t.due_date,
            "status": t.status,
            "created_at": t.created_at,
            "updated_at": t.updated_at,
            "sender_name": t.message.sender_name if t.message else None,
            "subject": t.message.subject if t.message else None,
        })

    return {
        "total": len(results),
        "tasks": results
    }


@router.patch("/{task_id}")
def update_task(task_id: int, payload: TaskUpdateSchema, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if payload.title is not None:
        task.title = payload.title
    if payload.description is not None:
        task.description = payload.description
    if payload.priority is not None:
        if payload.priority not in ["High", "Medium", "Low"]:
            raise HTTPException(status_code=400, detail="Priority must be High, Medium, or Low")
        task.priority = payload.priority
    if payload.status is not None:
        if payload.status not in ["Pending", "In Progress", "Completed"]:
            raise HTTPException(status_code=400, detail="Status must be Pending, In Progress, or Completed")
        task.status = payload.status
    if payload.due_date is not None:
        task.due_date = payload.due_date

    db.commit()
    db.refresh(task)
    return {
        "status": "success",
        "task": {
            "id": task.id,
            "title": task.title,
            "priority": task.priority,
            "status": task.status,
            "due_date": task.due_date,
            "updated_at": task.updated_at
        }
    }


@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"status": "success", "message": f"Task {task_id} deleted"}