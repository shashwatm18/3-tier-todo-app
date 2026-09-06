from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class TodoBase(BaseModel):
    """Shared fields for Todo models."""

    title: str = Field(..., min_length=1, max_length=255, description="Title of the todo item")
    description: Optional[str] = Field(None, max_length=2000, description="Detailed description")
    completed: bool = Field(default=False, description="Whether the todo has been marked completed")


class TodoCreate(BaseModel):
    """Schema for creating a new Todo."""

    title: str = Field(..., min_length=1, max_length=255, description="Title of the todo item")
    description: Optional[str] = Field(None, max_length=2000, description="Optional detailed description")
    completed: Optional[bool] = Field(default=False, description="Initial completion status")


class TodoUpdate(BaseModel):
    """Schema for updating an existing Todo. All fields are optional."""

    title: Optional[str] = Field(None, min_length=1, max_length=255, description="Updated title")
    description: Optional[str] = Field(None, max_length=2000, description="Updated description")
    completed: Optional[bool] = Field(None, description="Updated completion status")


class TodoResponse(TodoBase):
    """Schema returned to the client when reading or modifying a Todo."""

    id: int = Field(..., description="Unique primary key identifier")
    created_at: datetime = Field(..., description="Timestamp when the todo was created")

    # Support Pydantic V2 from_attributes & V1 orm_mode
    model_config = ConfigDict(from_attributes=True)

    class Config:
        orm_mode = True
