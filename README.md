# ActionFlow AI – Intelligent Inbox & Task Management

ActionFlow AI is an AI-powered productivity platform that transforms incoming emails and messages into organized, actionable tasks using Google Gemini and MySQL.

## Tech Stack
* **Frontend**: React (Vite) + Tailwind CSS v4 + Lucide Icons
* **Backend**: Python 3.11 + FastAPI + Uvicorn
* **Database & ORM**: MySQL 8.x + SQLAlchemy + Alembic
* **AI Model**: Google Gemini API (`gemini-3.5-flash-lite`)

---

## Getting Started

### 1. Prerequisites
* Python 3.11+
* Node.js 18+ and npm
* MySQL server (Local or Cloud instance such as Aiven)

### 2. Backend Setup
1. Enter the backend folder and activate virtual environment:
   ```bash
   cd backend
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Linux/macOS:
   source venv/bin/activate