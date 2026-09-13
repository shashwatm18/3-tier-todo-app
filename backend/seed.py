#!/usr/bin/env python3
"""Database seed script for the 3-Tier Todo Application.

Connects to the local PostgreSQL database using environment variables,
ensures the 'todos' table exists, and populates 12 initial todos.
Safe to execute multiple times (idempotent; will not create duplicate entries).
"""

import os
import sys
from datetime import datetime, timezone

from dotenv import load_dotenv

# Ensure the backend directory is in the Python module search path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

# Load environment configuration
load_dotenv(os.path.join(CURRENT_DIR, ".env"))

try:
    from sqlalchemy.exc import OperationalError, SQLAlchemyError

    from app.database import DATABASE_URL, Base, SessionLocal, engine
    from app.models import Todo
except ImportError as e:
    print(f"\n[ERROR] Missing required Python dependencies: {e}")
    print("Please install requirements first: pip install -r requirements.txt\n")
    sys.exit(1)

# Curated list of 12 realistic seed todos
SEED_TODOS = [
    {
        "title": "Set up local PostgreSQL database",
        "description": "Install PostgreSQL locally and create the database named 'todo_db' using psql or createdb.",
        "completed": True,
    },
    {
        "title": "Configure environment variables (.env)",
        "description": "Copy .env.example to .env and verify database connection credentials and port settings.",
        "completed": True,
    },
    {
        "title": "Run seed script to populate sample tasks",
        "description": "Execute python seed.py to create tables and insert initial dummy items.",
        "completed": True,
    },
    {
        "title": "Start FastAPI backend server",
        "description": "Run uvicorn app.main:app --reload --port 8000 to launch the REST API server locally.",
        "completed": False,
    },
    {
        "title": "Explore interactive Swagger API documentation",
        "description": "Navigate to http://localhost:8000/docs in your browser to test endpoints interactively.",
        "completed": False,
    },
    {
        "title": "Launch React + Vite frontend client",
        "description": "Run npm run dev to start the React UI on http://localhost:3000.",
        "completed": False,
    },
    {
        "title": "Test adding a new custom todo",
        "description": "Use the frontend input field to create a new task and verify it persists in PostgreSQL.",
        "completed": False,
    },
    {
        "title": "Test toggle completion status",
        "description": "Click the checkmark checkbox to toggle task completed state via PUT /todos/{id}.",
        "completed": False,
    },
    {
        "title": "Filter todos by active and completed states",
        "description": "Switch between All, Active, and Completed view tabs to verify filtering logic.",
        "completed": False,
    },
    {
        "title": "Test search bar filtering functionality",
        "description": "Type keywords in the search box to filter tasks by title or description in real-time.",
        "completed": False,
    },
    {
        "title": "Review SQLAlchemy model and Pydantic schemas",
        "description": "Inspect app/models.py and app/schemas.py to understand ORM mapping and validation rules.",
        "completed": False,
    },
    {
        "title": "Perform API test using curl commands",
        "description": "Run curl -X GET http://localhost:8000/todos from the terminal to inspect JSON responses.",
        "completed": False,
    },
]


def seed_database():
    """Main seed procedure: creates tables and inserts sample records idempotently."""
    print("=" * 65)
    print("3-TIER TODO APPLICATION - DATABASE SEED SCRIPT")
    print("=" * 65)

    # Sanitize database URL for display (hide password)
    masked_url = DATABASE_URL
    if "@" in DATABASE_URL and ":" in DATABASE_URL.split("@")[0]:
        prefix, rest = DATABASE_URL.split("://", 1)
        creds, host_part = rest.split("@", 1)
        user = creds.split(":")[0]
        masked_url = f"{prefix}://{user}:*****@{host_part}"

    print(f"[*] Target Database: {masked_url}")

    # 1. Connect & Ensure tables exist
    print("[*] Ensuring database tables exist...")
    try:
        Base.metadata.create_all(bind=engine)
        print("[+] Table 'todos' verified / created successfully.")
    except OperationalError as exc:
        print("\n" + "!" * 65)
        print("[ERROR] Could not connect to PostgreSQL database.")
        print(f"Details: {exc.orig if hasattr(exc, 'orig') else exc}")
        print("\nTroubleshooting tips:")
        print("1. Is PostgreSQL running on your machine?")
        print("   - macOS: brew services start postgresql")
        print("   - Linux: sudo systemctl start postgresql")
        print("   - Windows: Start PostgreSQL service via services.msc")
        print("2. Does the database exist?")
        print("   - Run: createdb todo_db (or psql -U postgres -c 'CREATE DATABASE todo_db;')")
        print("3. Check your credentials in backend/.env")
        print("!" * 65 + "\n")
        sys.exit(1)
    except SQLAlchemyError as exc:
        print(f"\n[ERROR] SQLAlchemy database error: {exc}\n")
        sys.exit(1)

    # 2. Insert seed todos safely
    db = SessionLocal()
    inserted_count = 0
    skipped_count = 0

    try:
        for item in SEED_TODOS:
            # Check if todo with this exact title already exists to avoid duplicate data
            existing = db.query(Todo).filter(Todo.title == item["title"]).first()
            if existing:
                skipped_count += 1
                continue

            new_todo = Todo(
                title=item["title"],
                description=item.get("description"),
                completed=item.get("completed", False),
                created_at=datetime.now(timezone.utc),
            )
            db.add(new_todo)
            inserted_count += 1

        db.commit()

        # Total count in database
        total_count = db.query(Todo).count()

        print("\n" + "-" * 65)
        print("DATABASE SEED COMPLETED SUCCESSFULLY!")
        print(f"[*] New records inserted : {inserted_count}")
        print(f"[*] Existing skipped     : {skipped_count}")
        print(f"[*] Total todos in DB    : {total_count}")
        print("-" * 65)
        print("Ready! You can now start the FastAPI backend:")
        print("  uvicorn app.main:app --reload --port 8000\n")

    except Exception as exc:
        db.rollback()
        print(f"\n[ERROR] Failed during data insertion: {exc}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
