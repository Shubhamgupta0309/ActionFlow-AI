from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
import app.models.messages
import app.models.task
from app.routers import messages, tasks, dashboard

# Create tables in MySQL
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ActionFlow AI API",
    description="Intelligent Inbox & Task Management API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "ActionFlow AI API",
        "version": "1.0.0"
    }


app.include_router(messages.router, prefix="/api/messages", tags=["Messages"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
