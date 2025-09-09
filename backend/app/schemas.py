from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .models import Status

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[Status] = None

class Task(TaskBase):
    id: int
    status: Status
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True