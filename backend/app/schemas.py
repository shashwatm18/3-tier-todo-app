from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TodoBase(BaseModel):
    """Shared fields for Todo models."""

    title: str = Field(
        ..., min_length=1, max_length=255, description="Title of the todo item"
    )
    description: str | None = Field(
        None, max_length=2000, description="Detailed description"
    )
    completed: bool = Field(
        default=False, description="Whether the todo has been marked completed"
    )


class TodoCreate(BaseModel):
    """Schema for creating a new Todo."""

    title: str = Field(
        ..., min_length=1, max_length=255, description="Title of the todo item"
    )
    description: str | None = Field(
        None, max_length=2000, description="Optional detailed description"
    )
    completed: bool | None = Field(
        default=False, description="Initial completion status"
    )


class TodoUpdate(BaseModel):
    """Schema for updating an existing Todo. All fields are optional."""

    title: str | None = Field(
        None, min_length=1, max_length=255, description="Updated title"
    )
    description: str | None = Field(
        None, max_length=2000, description="Updated description"
    )
    completed: bool | None = Field(None, description="Updated completion status")


class TodoResponse(TodoBase):
    """Schema returned to the client when reading or modifying a Todo."""

    id: int = Field(..., description="Unique primary key identifier")
    created_at: datetime = Field(..., description="Timestamp when the todo was created")

    # This is the single, clean way to support ORM object conversion in Pydantic V2
    model_config = ConfigDict(from_attributes=True)
