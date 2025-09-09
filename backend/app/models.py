#postgre---→redisのため不要
#import enum
# from datetime import datetime
# from typing import Optional
# from pydantic import BaseModel, Field
# import uuid 

# class Status(str, enum.Enum):
    #pending = "pending"
    #in_progress = "in_progress"
    #completed = "completed"

#class Task(BaseModel):
    #__tablename__ = "tasks"
    #id: str = Field(default_factory=lambda: str(uuid.uuid4())) 
    #title: str
    #description: Optional[str] = None
    #status: Status = Status.pending
    #created_at: datetime = Field(default_factory=datetime.now)
   # updated_at: Optional[datetime] = None