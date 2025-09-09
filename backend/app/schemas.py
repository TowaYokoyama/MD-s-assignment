from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid
import enum

# タスクの状態を文字列で定義
class Status(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    improgress = "improgress"

# タスクの基本構造
class TaskBase(BaseModel):
    title: str = Field(..., description="タスクのタイトル")
    description: Optional[str] = Field(None, description="タスクの詳細")

# 新規タスク作成時の入力データ
class TaskCreate(TaskBase):
    pass

# タスク更新時の入力データ
class TaskUpdate(BaseModel):
    # 更新時はどのフィールドも任意→→--ぱふぉ上げてる 部分的更新
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[Status] = None

# APIのレスポンスで返すタスクオブジェクト
class Task(TaskBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="タスクのユニークID")
    status: str = Field("pending", description="タスクの状態")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="作成日時")
    updated_at: Optional[datetime] = None

    class Config:
        json_encoders = {
            uuid.UUID: str
        }