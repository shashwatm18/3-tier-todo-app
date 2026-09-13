from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.models import Todo
from app.schemas import TodoCreate, TodoUpdate


def get_todos(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    completed: bool | None = None,
    search: str | None = None,
) -> list[Todo]:
    """Retrieve all todos from the database with optional filtering and search."""
    query = db.query(Todo)

    if completed is not None:
        query = query.filter(Todo.completed == completed)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Todo.title.ilike(search_pattern))
            | (Todo.description.ilike(search_pattern))
        )

    # Order newest todos first, then by id
    return (
        query.order_by(desc(Todo.created_at), desc(Todo.id))
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_todo_by_id(db: Session, todo_id: int) -> Todo | None:
    """Retrieve a single todo item by its primary key ID."""
    return db.query(Todo).filter(Todo.id == todo_id).first()


def create_todo(db: Session, todo_in: TodoCreate) -> Todo:
    """Create and persist a new todo in the database."""
    db_todo = Todo(
        title=todo_in.title.strip(),
        description=todo_in.description.strip() if todo_in.description else None,
        completed=bool(todo_in.completed),
    )
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo


def update_todo(db: Session, todo_id: int, todo_update: TodoUpdate) -> Todo | None:
    """Update an existing todo by ID with the provided fields."""
    db_todo = get_todo_by_id(db, todo_id)
    if not db_todo:
        return None

    update_data = (
        todo_update.model_dump(exclude_unset=True)
        if hasattr(todo_update, "model_dump")
        else todo_update.dict(exclude_unset=True)
    )

    for field, value in update_data.items():
        if field == "title" and value is not None:
            setattr(db_todo, field, value.strip())
        elif field == "description" and value is not None:
            setattr(db_todo, field, value.strip() if isinstance(value, str) else value)
        else:
            setattr(db_todo, field, value)

    db.commit()
    db.refresh(db_todo)
    return db_todo


def delete_todo(db: Session, todo_id: int) -> bool:
    """Delete a todo item by ID. Returns True if deleted, False if not found."""
    db_todo = get_todo_by_id(db, todo_id)
    if not db_todo:
        return False

    db.delete(db_todo)
    db.commit()
    return True
