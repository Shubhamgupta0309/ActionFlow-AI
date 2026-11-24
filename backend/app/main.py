from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="ActionFlow AI API",
    description="Intelligent Inbox & Task Management API",
    version="1.0.0"
)

# Enable CORS so your React frontend (port 5173) can communicate with FastAPI (port 8000)
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