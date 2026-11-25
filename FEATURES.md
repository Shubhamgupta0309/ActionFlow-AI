# ActionFlow AI – Feature Documentation (FEATURES.md)

This document provides a comprehensive technical overview of **ActionFlow AI**, detailing all implemented features, architecture modules, API endpoints, AI processing workflows, database schemas, third-party integrations, and feature completion status as required by the Traction Shastra assignment brief.

---

## 1. Executive Summary & Implemented Features

ActionFlow AI is an intelligent inbox and task management application that transforms raw, unstructured business messages and emails into structured, actionable tasks.

### Core Implemented Features:
1. **Mandatory JSON File Import & Validation**:
   - Supports uploading JSON files via a drag-and-drop modal UI or direct REST endpoint.
   - Validates JSON format and fields using Pydantic schemas (message ID, sender name/email, ISO 8601 timestamps, recipient, subject, content).
   - Ingests data directly into MySQL with automatic idempotency (skips duplicate message IDs without crashing).
2. **AI-Powered Inbox Analysis**:
   - **Concise Summaries**: Generates 1-2 sentence executive overviews.
   - **Category & Intent Classification**: Accurately categorizes messages into *Request, Complaint, Meeting, Notification, Bug, General*, or *Inquiry*.
   - **Priority Detection**: Analyzes sentiment, urgency, and deadline constraints to assign *High, Medium*, or *Low* priority.
   - **Response Detection & Suggested Reply**: Determines if the message requires a response (`response_required: true/false`) and drafts a context-aware, professional response.
   - **1-Click Copy**: Instant clipboard copying of AI suggested replies for rapid communication.
3. **Intelligent Task Generation with Strict Anti-Hallucination**:
   - Automatically extracts tasks from messages containing actionable instructions.
   - Assigns task titles, descriptions, priorities, and default `Pending` status.
   - **Zero Hallucination Guardrail**: Detects purely informational messages (holiday calendars, company announcements, newsletters, system alerts, receipts) and creates **0 tasks** instead of inventing artificial work.
   - **Accurate Due Date Extraction**: Only extracts due dates when explicitly specified in the message text (e.g., "before Thursday", "by Monday morning"); never invents arbitrary deadlines.
4. **Interactive Dashboard & Real-Time Task Management**:
   - **5 Live KPI Metric Cards**: Displays real-time counts for Total Messages, Analyzed Messages, Pending Tasks, In Progress Tasks, and High-Priority Alerts.
   - **Full-Text Search & Multi-Filters**: Allows instant search across task titles, descriptions, and source message subjects, combined with priority and status filters.
   - **Inline Status Toggle**: Quick one-click status transitions (`Pending` ➔ `In Progress` ➔ `Completed`).
   - **Drag-and-Drop Kanban Board**: Visual 3-column workflow allowing intuitive drag-and-drop task re-ordering and status updates.
   - **Dual-View Switcher**: Seamless toggle between Kanban board and structured list view.
5. **Bonus Features Implemented**:
   - **Gmail OAuth2 & Live Inbox Sync**: Google OAuth authorization with PKCE security to authenticate users and fetch unread emails via the Gmail API directly into MySQL.
   - **CSV Export**: Instant download of all filtered tasks with titles, descriptions, priorities, statuses, due dates, and source message subjects into a standard `.csv` spreadsheet.

---

## 2. Description of Features & How They Work

### A. Message Import Pipeline
* **Upload Modal UI**: The frontend provides a drag-and-drop interface (`UploadModal.jsx`) accepting `.json` files.
* **Multipart Streaming**: Files are sent to `/api/messages/upload` as `multipart/form-data`.
* **Validation & Storage**: The backend parses the JSON, validates each record against `MessageImportPayload`, checks MySQL for existing IDs to avoid duplicates, and commits new records.

### B. AI Analysis Workflow
* **On-Demand or Batch**: Users can analyze an individual message via the "Analyze with AI" button or click "Analyze All with AI" to process all pending messages in a paced queue (preventing free-tier rate limits).
* **Gemini Client Execution**: Calls Google Gemini (`gemini-3.5-flash-lite`) using strict Pydantic JSON schemas (`response_schema=AIAnalysisResult`).
* **Relational Storage**: The message row in `messages` is updated with summary, category, priority, response flag, and suggested reply. Any extracted tasks are instantiated in the `tasks` table with a foreign key pointing back to `messages.id`.

### C. Task Management & Kanban Board
* Tasks are retrieved via `/api/tasks` with optional query parameters (`search`, `status`, `priority`).
* The Kanban board groups tasks into `Pending`, `In Progress`, and `Completed` columns.
* Drag-and-drop is powered by HTML5 Drag API (`onDragStart`, `onDragOver`, `onDrop`), immediately triggering a `PATCH /api/tasks/{id}` request to persist the new status in MySQL.

### D. Gmail OAuth2 Integration
* The user clicks "Connect Gmail" on the frontend.
* The frontend requests `/api/gmail/auth-url`, which initializes a Google `Flow` using PKCE (`code_verifier` cached in memory mapped to `state`).
* The user authenticates with Google and grants read-only access.
* Google redirects to `/api/gmail/callback`, which verifies the code, exchanges it for access tokens, fetches recent inbox messages via the Gmail REST API, normalizes the headers into `Message` models, and saves them to MySQL.

---

## 3. Application Modules & Their Functionality

### Backend (`/backend/app`)
* **`main.py`**: Initializes the FastAPI application, mounts CORS middleware, creates database tables, and registers route blueprints.
* **`database.py`**: Configures the SQLAlchemy database engine with SSL connection pooling and provides the `get_db` session dependency.
* **`models/`**:
  * `messages.py`: SQLAlchemy ORM model for the `messages` table.
  * `task.py`: SQLAlchemy ORM model for the `tasks` table, establishing foreign key relationships and cascade deletion.
* **`schemas/`**:
  * `messages.py`: Pydantic validation schemas for raw input payloads and API responses.
  * `task.py`: Pydantic validation schemas for task updates and responses.
  * `ai.py`: Structured output schemas (`AIAnalysisResult`, `ExtractedTask`) enforced during Gemini inference.
* **`services/ai_service.py`**: Encapsulates prompt engineering, Gemini API communication, schema validation, and database transaction handling.
* **`routers/`**:
  * `messages.py`: Endpoints for JSON uploads, raw imports, message listings, and AI analysis triggers.
  * `tasks.py`: Endpoints for querying, filtering, searching, updating, and deleting tasks.
  * `dashboard.py`: Aggregates real-time statistics and category distributions.
  * `gmail.py`: Manages the Google OAuth2 lifecycle and Gmail API inbox synchronization.

### Frontend (`/frontend/src`)
* **`App.jsx`**: Main application state controller managing active tabs (*Tasks Management* vs *Inbox & AI Insights*), search queries, filter state, and modal visibility.
* **`components/StatsCards.jsx`**: Renders 5 KPI metric cards with gradient icons, tooltips, and real-time counter values.
* **`components/TaskSection.jsx`**: Renders the task dashboard with view switcher (Kanban / List), status/priority filters, search input, CSV export button, and task cards.
* **`components/MessageSection.jsx`**: Reactive two-column email viewer displaying message list on the left and full message content + AI insights drawer on the right.
* **`components/UploadModal.jsx`**: Modal dialog with file dropzone, format instructions, and upload progress feedback.
* **`services/api.js`**: Axios HTTP client configured with dynamic base URL normalization for local development and cloud production.

---

## 4. APIs & Endpoints Reference

| Method | Route | Description | Request Payload / Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Health check | None |
| `POST` | `/api/messages/upload` | Multipart file upload for `sample_messages.json` | `file: UploadFile` |
| `POST` | `/api/messages/import` | Direct JSON payload import | `MessageImportPayload` |
| `GET` | `/api/messages/` | Retrieve all stored messages | None |
| `POST` | `/api/messages/{id}/analyze` | Trigger AI analysis for a single message | `id: str` (path parameter) |
| `POST` | `/api/messages/analyze-all` | Batch analyze all unanalyzed messages | None |
| `GET` | `/api/tasks/` | Query tasks with search & filters | `status`, `priority`, `search` |
| `PATCH` | `/api/tasks/{id}` | Update task status or details | `{"status": "..."}` |
| `DELETE` | `/api/tasks/{id}` | Delete a task | `id: int` (path parameter) |
| `GET` | `/api/dashboard/stats` | Retrieve 5 live KPI metric cards | None |
| `GET` | `/api/gmail/auth-url` | Generate Google OAuth2 authorization URL | None |
| `GET` | `/api/gmail/callback` | OAuth2 callback, fetches tokens & syncs emails | `code`, `state` (query params) |

---

## 5. AI Features, Prompts & Processing Workflows

### AI Model
* **Model**: Google Gemini `gemini-3.5-flash-lite` (via the official `google-genai` SDK).
* **Sampling Settings**: `temperature=0.2` (low temperature selected to prioritize determinism, schema adherence, and factual extraction over creative drift).
* **Structured Output Enforcement**: Uses Gemini's native `response_schema=AIAnalysisResult` and `response_mime_type="application/json"` to ensure 100% parseable JSON conforming to Pydantic definitions.

### System Prompt & Anti-Hallucination Guardrails
```text
You are an intelligent executive assistant for ActionFlow AI.
Analyze the following incoming {message.type} and extract insights and actionable tasks.

--- MESSAGE DETAILS ---
Message ID: {message.id}
Sender: {message.sender_name} <{message.sender_email}>
Recipient: {message.recipient}
Subject: {message.subject or 'No Subject'}
Sent Date: {message.date.isoformat() if message.date else 'Unknown'}
Content:
"""{message.content}"""
-----------------------

CRITICAL RULES:
1. SUMMARY: 1-2 concise sentences capturing the core message.
2. CATEGORY: Classify into Request, Complaint, Meeting, Notification, General, Bug, or Inquiry.
3. PRIORITY: High (critical bugs, outages, urgent legal/client requests), Medium (normal requests, meetings), Low (announcements, receipts).
4. RESPONSE REQUIRED: True if the sender is waiting for a reply or deliverable; False for informational notices.
5. SUGGESTED REPLY: If response_required is True, write a helpful, professional reply draft. If False, leave as null.
6. TASKS:
   - ONLY extract tasks if the message contains explicit actionable work.
   - DO NOT create tasks for general announcements, holiday calendars, newsletters, automated alerts, or receipts.
   - DO NOT invent or assume due dates. Only extract a due_date if an explicit date or day (e.g. "before Thursday", "by Monday") is mentioned in the text.
```

### Verification Against Prompt Edge Cases:
* **Actionable Request (`MSG001` - Payment Gateway Integration)**:
  - Extracted 2 distinct actionable tasks: "Complete payment gateway integration" and "Share staging URL".
  - Identified `due_date`: Thursday.
  - Marked `response_required: true` and drafted a professional confirmation email.
* **Informational Notice (`MSG003` - Holiday Notice)**:
  - Extracted **0 tasks** (successfully adhered to anti-hallucination guardrail).
  - Marked `response_required: false` with `suggested_reply: null`.

---

## 6. Database Tables & Architecture

The database is built on **MySQL 8.x** (hosted on Aiven Cloud with SSL encryption).

### Table: `messages`
Stores incoming messages and emails along with their AI-generated insights.
| Column | Type | Constraints | Purpose |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(50)` | PRIMARY KEY, INDEX | Unique message identifier (e.g. `MSG001` or Gmail message ID) |
| `type` | `VARCHAR(20)` | NOT NULL | Type of message (`email` or `message`) |
| `sender_name` | `VARCHAR(100)` | NOT NULL | Name of the sender |
| `sender_email` | `VARCHAR(150)` | NOT NULL | Email address of the sender |
| `recipient` | `VARCHAR(150)` | NOT NULL | Recipient email address |
| `subject` | `VARCHAR(255)` | NULLABLE | Email or message subject line |
| `date` | `DATETIME` | NOT NULL | Timestamp when message was sent |
| `content` | `TEXT` | NOT NULL | Raw body content of the message |
| `is_analyzed` | `TINYINT(1)` | DEFAULT 0 | Flag indicating whether AI analysis has run |
| `summary` | `TEXT` | NULLABLE | 1-2 sentence AI summary |
| `category` | `VARCHAR(50)` | NULLABLE | Classified category (Request, Bug, Meeting, etc.) |
| `priority` | `VARCHAR(20)` | NULLABLE | Detected business priority (High, Medium, Low) |
| `response_required`| `TINYINT(1)` | NULLABLE | Whether sender requires a reply |
| `suggested_reply` | `TEXT` | NULLABLE | Drafted professional response |
| `created_at` | `DATETIME` | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

### Table: `tasks`
Stores actionable tasks extracted by AI from parent messages.
| Column | Type | Constraints | Purpose |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | PRIMARY KEY, AUTO_INCREMENT | Unique task ID |
| `message_id` | `VARCHAR(50)` | FOREIGN KEY (CASCADE), INDEX | References parent `messages.id` |
| `title` | `VARCHAR(255)` | NOT NULL | Short, actionable task title |
| `description` | `TEXT` | NULLABLE | Detailed description of the work needed |
| `priority` | `VARCHAR(20)` | NOT NULL | Task urgency (High, Medium, Low) |
| `due_date` | `DATETIME` | NULLABLE | Explicit due date (if mentioned in message) |
| `status` | `VARCHAR(20)` | DEFAULT 'Pending' | Workflow state (`Pending`, `In Progress`, `Completed`) |
| `created_at` | `DATETIME` | DEFAULT CURRENT_TIMESTAMP | Task creation timestamp |
| `updated_at` | `DATETIME` | AUTO ON UPDATE | Task last updated timestamp |

---

## 7. Third-Party Integrations & Libraries

### Backend Libraries:
* **FastAPI (`>=0.110.0`)**: Modern, high-performance web framework for Python.
* **Uvicorn (`>=0.28.0`)**: Lightning-fast ASGI web server.
* **Pydantic v2 (`>=2.6.0`)**: Data validation and structured schema enforcement.
* **SQLAlchemy (`>=2.0.0`)**: Python SQL toolkit and Object-Relational Mapper (ORM).
* **PyMySQL (`>=1.1.0`) & Cryptography (`>=42.0.0`)**: Pure-Python MySQL driver with SSL support.
* **Alembic (`>=1.13.0`)**: Lightweight, robust database migration tool.
* **google-genai (`>=0.1.1`)**: Official Google Gemini SDK for LLM completions.
* **google-auth & google-auth-oauthlib (`>=1.2.0`)**: Google OAuth2 authentication flow with PKCE verifiers.
* **google-api-python-client (`>=2.120.0`)**: Client library to interact with Google Gmail API.

### Frontend Libraries:
* **React 19 & Vite**: Next-generation web UI library and build tool.
* **Tailwind CSS v4**: Utility-first CSS framework for modern design.
* **Lucide React**: Clean, accessible vector icons for the user interface.
* **Axios**: Promise-based HTTP client for browser API calls.

---

## 8. Feature Completion Matrix

| Feature Name | Category | Status | Notes |
| :--- | :--- | :--- | :--- |
| **JSON File Import** | Core | **Completed (100%)** | Drag-and-drop modal UI + REST API with Pydantic validation |
| **MySQL Database Integration** | Core | **Completed (100%)** | Cloud MySQL on Aiven with foreign keys, indexes, and Alembic migrations |
| **Realistic Sample Dataset** | Core | **Completed (100%)** | `sample_messages.json` containing 25 diverse realistic business messages |
| **AI Message Summarization** | Core | **Completed (100%)** | Concise 1-2 sentence summaries generated via Gemini |
| **AI Intent & Category Detection** | Core | **Completed (100%)** | Categorizes into Request, Bug, Meeting, Complaint, Inquiry, Notification |
| **AI Priority Detection** | Core | **Completed (100%)** | High, Medium, Low priority detection based on business context |
| **Response Detection & Reply Draft**| Core | **Completed (100%)** | Determines reply necessity and generates contextual reply drafts |
| **Intelligent Task Extraction** | Core | **Completed (100%)** | Automated task generation with titles, descriptions, and priorities |
| **Anti-Hallucination Guardrails** | Core | **Completed (100%)** | 0 tasks created for newsletters/holidays; no invented deadlines |
| **Live KPI Dashboard** | Core | **Completed (100%)** | 5 real-time metric cards updating dynamically |
| **Search & Filtering** | Core | **Completed (100%)** | Text search across title/body/parent subject + status/priority filters |
| **Inline Task Status Updating** | Core | **Completed (100%)** | One-click status cycling (`Pending` ➔ `In Progress` ➔ `Completed`) |
| **Gmail OAuth2 Integration** | Bonus | **Completed (100%)** | PKCE OAuth flow + Gmail API live email synchronization |
| **Drag-and-Drop Kanban Board** | Bonus | **Completed (100%)** | 3-column visual board with HTML5 drag-and-drop status persistence |
| **CSV Task Export** | Bonus | **Completed (100%)** | Client-side export of filtered tasks to spreadsheet format |
| **1-Click Copy Suggested Reply** | Bonus | **Completed (100%)** | Instant clipboard copy with visual feedback |
| **Partially Completed Features** | - | **None** | All core and chosen bonus features fully operational |
| **Not Implemented Features** | - | **None** | All scope items successfully delivered within deadline |
