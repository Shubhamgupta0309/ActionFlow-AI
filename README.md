# ActionFlow AI – Intelligent Inbox & Task Management

> **Traction Shastra Technical Assignment**  
> AI-powered full-stack application that transforms incoming emails and messages into organized, actionable tasks with automated summarization, intent classification, priority detection, suggested replies, and zero-hallucination task extraction.

---

## 📌 Submission Quick Links
* **🎥 Screen Recording (Demo Video)**: [Google Drive Walkthrough](https://drive.google.com/drive/folders/1fS4qpwNnLhuTY9QJ8xvzdjMGv5taZVOh?usp=sharing)
* **🌐 Live Deployed Backend API (Render)**: [https://actionflow-ai-backend.onrender.com](https://actionflow-ai-backend.onrender.com)
* **📑 Interactive Swagger API Documentation**: [https://actionflow-ai-backend.onrender.com/docs](https://actionflow-ai-backend.onrender.com/docs)
* **📂 GitHub Repository**: [https://github.com/Shubhamgupta0309/ActionFlow-AI](https://github.com/Shubhamgupta0309/ActionFlow-AI)
* **📄 Detailed Feature Document**: [FEATURES.md](FEATURES.md)
* **🗄️ MySQL DDL Schema Export**: [schema.sql](schema.sql)
* **📊 Mandatory Sample Dataset (25 Messages)**: [sample_messages.json](sample_messages.json)

---

## 🌟 Key Capabilities
1. **Mandatory JSON File Import & Validation**: High-performance drag-and-drop file uploader parsing ISO 8601 dates, nested sender objects, with Pydantic schema validation and idempotent duplicate rejection.
2. **AI Intelligence Engine (Google Gemini `gemini-3.5-flash-lite`)**:
   - Structured JSON output conforming to strict Pydantic schemas.
   - 1-2 sentence executive summarization and intent classification (*Request, Complaint, Meeting, Notification, Bug, General*).
   - Priority detection (*High, Medium, Low*) based on business urgency.
   - Reply necessity detection with context-aware auto-drafted professional replies.
   - **Anti-Hallucination Guardrails**: Strictly prevents creating tasks from newsletters or holiday announcements and never invents unstated deadlines.
3. **Task Management & Drag-and-Drop Kanban Board**:
   - Interactive 3-column workflow (*Pending, In Progress, Completed*) with native HTML5 drag-and-drop.
   - Dual-view toggle: Kanban Board or tabular List view.
   - Real-time text search and priority/status filtering.
4. **Live Executive Dashboard**: Real-time KPI metrics displaying total messages, analyzed messages, pending tasks, in-progress tasks, completed tasks, and high-priority alerts.
5. **Bonus: Google OAuth2 & Gmail API Sync**: Official Google OAuth authorization flow with PKCE code verifier security to fetch live unread emails and ingest them into MySQL.
6. **Bonus: CSV Export**: One-click spreadsheet export for filtered tasks including source message references and timestamps.

---

## 🏗️ Architecture & Tech Stack

```mermaid
flowchart LR
    A["Frontend\n(React 19 + Vite +\nTailwind CSS v4)"] <-->|REST API + JSON| B["Backend\n(FastAPI + Uvicorn +\nPydantic v2)"]
    B <-->|SQLAlchemy ORM +\nPymysql (SSL)| C[("Cloud Database\n(MySQL 8.x on Aiven)")]
    B <-->|Structured JSON Prompts| D["AI Engine\n(Google Gemini\n3.5-flash-lite)"]
    B <-->|OAuth2 / REST API| E["Google Gmail API\n(Live Inbox Sync)"]
```

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide Icons, Axios |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, Pydantic v2, Python-Multipart |
| **Database & ORM** | MySQL 8.x (Aiven Cloud), SQLAlchemy 2.x, PyMySQL with SSL, Alembic |
| **AI / LLM** | Google Gemini API (`gemini-3.5-flash-lite`), Structured JSON Outputs |
| **Authentication & External APIs** | Google OAuth2 with PKCE (`google-auth`, `google-api-python-client`) |
| **Hosting & Cloud** | Backend on Render, Database on Aiven Cloud MySQL |

---

## 🚀 Local Installation & Setup Guide

### 1. Prerequisites
* Python 3.11+
* Node.js 18+ and npm
* MySQL Server 8.x (Local instance or Cloud instance like Aiven)
* Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/))

---

### 2. Backend Setup
1. Clone the repository and enter the backend directory:
   ```bash
   git clone https://github.com/Shubhamgupta0309/ActionFlow-AI.git
   cd "ActionFlow AI/backend"
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell):
   python -m venv venv
   .\venv\Scripts\activate

   # Linux/macOS:
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Create a `.env` file inside `backend/` (refer to `.env.example`):
   ```ini
   DATABASE_URL=mysql+pymysql://<db_user>:<db_password>@<db_host>:<db_port>/actionflow_db
   GEMINI_API_KEY=your_gemini_api_key_here

   # Optional (for Gmail Integration):
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:8000/api/gmail/callback
   FRONTEND_URL=http://localhost:5173
   ```

5. Run database migrations or initialize tables:
   ```bash
   # Run Alembic migrations:
   alembic upgrade head
   ```
   *(Or import `schema.sql` directly into your MySQL database)*.

6. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   The API will be available at `http://localhost:8000` and Swagger docs at `http://localhost:8000/docs`.

---

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd "ActionFlow AI/frontend"
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Configure frontend environment (optional for local dev, defaults to `http://localhost:8000/api`):
   Create a `.env` file inside `frontend/`:
   ```ini
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API service health check |
| `POST` | `/api/messages/upload` | Multipart file upload for `sample_messages.json` |
| `POST` | `/api/messages/import` | Direct JSON payload import with Pydantic validation |
| `GET` | `/api/messages/` | Retrieve all stored messages with AI metadata |
| `POST` | `/api/messages/{id}/analyze` | Trigger AI analysis on a single message |
| `POST` | `/api/messages/analyze-all` | Batch analyze all unanalyzed messages |
| `GET` | `/api/tasks/` | List tasks with filters (`status`, `priority`, `search`) |
| `PATCH` | `/api/tasks/{id}` | Update task status (`Pending`, `In Progress`, `Completed`) |
| `DELETE` | `/api/tasks/{id}` | Remove a task |
| `GET` | `/api/dashboard/stats` | Retrieve 5 live KPI metric cards and category breakdown |
| `GET` | `/api/gmail/auth-url` | Generate Google OAuth2 authorization link (PKCE flow) |
| `GET` | `/api/gmail/callback` | OAuth2 callback, fetches tokens and synchronizes Gmail inbox |

---

## 📁 Repository Structure
```text
ActionFlow AI/
├── backend/
│   ├── alembic/                 # Database migration scripts
│   ├── app/
│   │   ├── models/              # SQLAlchemy models (Message, Task)
│   │   ├── routers/             # API routes (messages, tasks, dashboard, gmail)
│   │   ├── schemas/             # Pydantic validation schemas
│   │   ├── services/            # AI analysis engine (Gemini)
│   │   ├── database.py          # MySQL database connection & session
│   │   └── main.py              # FastAPI app initialization & CORS
│   ├── .env.example             # Backend environment template
│   ├── alembic.ini              # Alembic migration configuration
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/          # React components (Stats, Tasks, Messages, Upload)
│   │   ├── services/            # Axios API service client
│   │   ├── App.jsx              # Main UI state and tab views
│   │   └── index.css            # Tailwind CSS v4 styling
│   ├── package.json             # Frontend dependencies
│   └── vite.config.js           # Vite configuration
├── .env.example                 # Root environment template
├── .gitignore                   # Excludes node_modules, venv, .env
├── FEATURES.md                  # Comprehensive feature documentation
├── README.md                    # Project overview and setup guide
├── sample_messages.json         # 25 realistic sample messages
└── schema.sql                   # MySQL DDL schema export
```

---

## 🔒 Security Best Practices
* **No hardcoded secrets**: All API keys, credentials, and connection strings are managed via `.env`.
* **Database SSL Encryption**: Enforced `ssl_mode=REQUIRED` for cloud database connections.
* **PKCE OAuth2 Security**: Protection against authorization code interception in Gmail OAuth integration.
* **Input Validation**: Strict typing and boundary constraints enforced by Pydantic.
