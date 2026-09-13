from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.schemas import TodoCreate, TodoResponse, TodoUpdate

router = APIRouter(prefix="/todos", tags=["Todos"])


@router.get(
    "",
    response_model=list[TodoResponse],
    summary="List all todos",
    description="Retrieve all todos with optional filtering by completed status or search keyword.",
)
def read_todos(
    completed: bool | None = Query(
        None, description="Filter by completion status (true or false)"
    ),
    search: str | None = Query(
        None, description="Search term matching title or description"
    ),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(
        100, ge=1, le=500, description="Max number of records to return"
    ),
    db: Session = Depends(get_db),
):
    """Retrieve all todos."""
    return crud.get_todos(
        db=db, skip=skip, limit=limit, completed=completed, search=search
    )


@router.post(
    "",
    response_model=TodoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new todo",
    description="Create a new todo item with a title and optional description.",
)
def create_todo_item(
    todo_in: TodoCreate,
    db: Session = Depends(get_db),
):
    """Create a new todo item."""
    if not todo_in.title.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Title cannot be empty or whitespace.",
        )
    return crud.create_todo(db=db, todo_in=todo_in)


@router.get(
    "/{todo_id}",
    response_model=TodoResponse,
    summary="Get a specific todo",
    description="Retrieve a single todo item by its numeric ID.",
)
def read_todo_item(
    todo_id: int,
    db: Session = Depends(get_db),
):
    """Retrieve a single todo by ID."""
    db_todo = crud.get_todo_by_id(db=db, todo_id=todo_id)
    if not db_todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with id {todo_id} not found.",
        )
    return db_todo


@router.put(
    "/{todo_id}",
    response_model=TodoResponse,
    summary="Update a todo",
    description="Update the title, description, or completion status of an existing todo.",
)
def update_todo_item(
    todo_id: int,
    todo_update: TodoUpdate,
    db: Session = Depends(get_db),
):
    """Update a todo item by ID."""
    if todo_update.title is not None and not todo_update.title.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Title cannot be empty or whitespace.",
        )

    updated_todo = crud.update_todo(db=db, todo_id=todo_id, todo_update=todo_update)
    if not updated_todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with id {todo_id} not found.",
        )
    return updated_todo


@router.delete(
    "/{todo_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a todo",
    description="Delete a todo item by its numeric ID.",
)
def delete_todo_item(
    todo_id: int,
    db: Session = Depends(get_db),
):
    """Delete a todo item by ID."""
    success = crud.delete_todo(db=db, todo_id=todo_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with id {todo_id} not found.",
        )
    return {
        "message": f"Todo with id {todo_id} has been deleted successfully.",
        "id": todo_id,
    }
