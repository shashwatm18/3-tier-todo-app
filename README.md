# 3-Tier Todo Application

A clean, beginner-friendly **3-tier Todo web application** built to run completely locally on your machine without Docker or containerization.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                       Tier 1: Frontend                  │
│               React + Vite + Tailwind CSS               │
│                  (http://localhost:3000)                │
└────────────────────────────┬────────────────────────────┘
                             │  REST / JSON (HTTP)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                       Tier 2: Backend                   │
│                 Python 3 + FastAPI + Uvicorn            │
│                  (http://localhost:8000)                │
└────────────────────────────┬────────────────────────────┘
                             │  SQLAlchemy ORM
                             ▼
┌─────────────────────────────────────────────────────────┐
│                      Tier 3: Database                   │
│                    PostgreSQL (todos table)             │
│                  (localhost:5432 / todo_db)             │
└─────────────────────────────────────────────────────────┘
```

---

## Project Structure

```text
todo-app/
├── frontend/                     # React + Vite client application
│   ├── src/
│   │   ├── components/           # UI components (TodoItem, AddTodoForm, etc.)
│   │   ├── services/             # REST API client service
│   │   ├── App.tsx               # Main application component
│   │   ├── main.tsx              # React entry point
│   │   └── types.ts              # TypeScript interfaces
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
├── backend/                      # Python FastAPI REST API server
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py               # FastAPI entry point, CORS, and lifespan
│   │   ├── database.py           # SQLAlchemy engine, session maker, get_db
│   │   ├── models.py             # SQLAlchemy ORM model for 'todos' table
│   │   ├── schemas.py            # Pydantic request & response validation schemas
│   │   ├── crud.py               # Database CRUD logic
│   │   └── routes/
│   │       ├── __init__.py
│   │       └── todos.py          # REST endpoints (/todos)
│   ├── seed.py                   # Standalone database seeding script
│   ├── requirements.txt          # Python dependencies
│   └── .env.example              # Example database configuration
└── README.md                     # Step-by-step setup and run guide
```

---

## Prerequisites

Before starting, ensure you have the following installed on your machine:

1. **Python 3.10+** — Check with `python3 --version`
2. **Node.js 18+ and npm** — Check with `node -v` and `npm -v`
3. **PostgreSQL 14+** — Check with `psql --version`

---

## Step-by-Step Setup Guide

### 1. Creating the PostgreSQL Database

Ensure your local PostgreSQL service is running:

- **macOS (Homebrew):**
  ```bash
  brew services start postgresql@14  # or postgresql
  ```
- **Linux (Ubuntu/Debian):**
  ```bash
  sudo systemctl start postgresql
  ```
- **Windows:**
  Open `services.msc` and verify the **postgresql-x64** service is running.

Create a database named `todo_db`:

```bash
# Option A: Using createdb command
createdb todo_db

# Option B: Using psql CLI
psql -U postgres -c "CREATE DATABASE todo_db;"
```

---

### 2. Installing Backend Dependencies

Navigate to the `backend` directory, create a Python virtual environment, and install the required packages:

```bash
# Navigate into backend directory
cd backend

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
# On macOS / Linux:
source venv/bin/activate
# On Windows (Command Prompt):
# venv\Scripts\activate.bat
# On Windows (PowerShell):
# venv\Scripts\Activate.ps1

# Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

---

### 3. Configuring the Backend `.env` File

Copy `.env.example` to `.env` in the `backend/` folder:

```bash
cp .env.example .env
```

Open `.env` in your editor and update the credentials to match your local PostgreSQL setup:

```env
# Format: postgresql://<username>:<password>@<host>:<port>/<database_name>
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/todo_db

# Allowed frontend origins for CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173

SERVER_HOST=0.0.0.0
SERVER_PORT=8000
```

> **Note:** If your PostgreSQL username or password differs (for example, password `mysecretpassword`), update the URL accordingly.

---

### 4. Running the Seed Script (`seed.py`)

Run the database seed script to verify your connection, automatically create the `todos` table, and insert 12 realistic dummy tasks:

```bash
python seed.py
```

Expected output:

```text
=================================================================
3-TIER TODO APPLICATION - DATABASE SEED SCRIPT
=================================================================
[*] Target Database: postgresql://postgres:*****@localhost:5432/todo_db
[*] Ensuring database tables exist...
[+] Table 'todos' verified / created successfully.

-----------------------------------------------------------------
DATABASE SEED COMPLETED SUCCESSFULLY!
[*] New records inserted : 12
[*] Existing skipped     : 0
[*] Total todos in DB    : 12
-----------------------------------------------------------------
```

> **Note:** `seed.py` is safe to run multiple times. It checks for existing entries by title and avoids creating duplicate tasks.

---

### 5. Starting the FastAPI Backend

From the `backend` directory (with your virtual environment activated), start Uvicorn:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend is now live at:
- **API Root / Health Check:** [http://localhost:8000/](http://localhost:8000/)
- **Interactive Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Documentation:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### 6. Installing Frontend Dependencies & Starting the UI

Open a **new terminal window** and navigate to the `frontend` folder (or project root):

```bash
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend will start on [http://localhost:3000](http://localhost:3000).

---

### 7. Accessing the Application

1. Open your browser and go to: **[http://localhost:3000](http://localhost:3000)**
2. You will see the **3-Tier Todo App** interface with:
   - **Live Backend Status Badge:** Shows `Connected to FastAPI (<latency>ms)` when your backend is running.
   - **Task Management:**
     - **Add Todo:** Type a title (and optional notes/description) and press Enter or click "Add Todo".
     - **Toggle Complete:** Click the checkmark box on any task to mark it completed (`PUT /todos/{id}`).
     - **Edit Todo:** Click the pencil icon to edit title or description inline.
     - **Delete Todo:** Click the trash icon to delete a task (`DELETE /todos/{id}`).
     - **Filter & Search:** Filter by All, Active, or Completed; search tasks in real-time.
   - **Setup Guide Modal:** Click "Architecture & Setup" in the top header at any time for quick reference.

---

### 8. Testing the REST API

You can test all REST endpoints directly using `curl` or the interactive Swagger UI at [http://localhost:8000/docs](http://localhost:8000/docs).

#### 1. List all todos
```bash
curl -X GET http://localhost:8000/todos
```

#### 2. Create a new todo
```bash
curl -X POST http://localhost:8000/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs, and sourdough bread"}'
```

#### 3. Update a todo (mark as completed or change title)
```bash
curl -X PUT http://localhost:8000/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

#### 4. Delete a todo
```bash
curl -X DELETE http://localhost:8000/todos/1
```

#### 5. Filter todos by completion
```bash
curl -X GET "http://localhost:8000/todos?completed=true"
```

#### 6. Search todos by keyword
```bash
curl -X GET "http://localhost:8000/todos?search=database"
```

---

## Database Schema Reference

The `todos` table in PostgreSQL is defined as:

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY`, `AUTO_INCREMENT` | Unique identifier |
| `title` | `VARCHAR(255)` | `NOT NULL`, `INDEX` | Title of the task |
| `description` | `TEXT` | `NULLABLE` | Detailed notes |
| `completed` | `BOOLEAN` | `NOT NULL`, `DEFAULT FALSE` | Status flag |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `NOT NULL`, `DEFAULT NOW()` | Creation timestamp |

---

## Troubleshooting

### 1. `psycopg2.OperationalError: could not connect to server`
- Ensure PostgreSQL is started: `sudo systemctl status postgresql` or `brew services list`.
- Verify port `5432` is listening: `nc -zv localhost 5432` or `lsof -i :5432`.
- Check password and username in `backend/.env`.

### 2. `database "todo_db" does not exist`
- Run `createdb todo_db` in your terminal or create it via `psql -U postgres -c "CREATE DATABASE todo_db;"`.

### 3. CORS issues in the browser console
- Verify that `CORS_ORIGINS` in `backend/.env` includes `http://localhost:3000` and `http://localhost:5173`.
- Restart the FastAPI server after modifying `.env`.

### 4. Running the Frontend from root vs frontend folder
- You can run `npm run dev` directly from the project root or from the `frontend/` directory. Both are fully configured.
