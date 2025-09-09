from typing import List, Optional
import json
from redis import Redis
from . import schemas
from uuid import uuid4
from datetime import datetime

def get_task_json(task: schemas.Task) -> str:
    return task.model_dump_json()

# RedisのJSON文字列をPydanticモデルに変換
def redis_json_to_task(data: str) -> Optional[schemas.Task]:
    if data:
        try:
            return schemas.Task.model_validate_json(data)
        except Exception as e:
            print(f"Error validating JSON: {e}")
            return None
    return None

def get_task_key(task_id: str) -> str:
    return f"task:{task_id}"

def get_tasks(redis_client: Redis, status: Optional[schemas.Status] = None) -> List[schemas.Task]:
    task_keys = redis_client.keys(get_task_key('*'))
    if not task_keys:
        return []

    pipe = redis_client.pipeline()
    for key in task_keys:
        pipe.get(key)
    
    tasks_data = pipe.execute()
    
    tasks = []
    for data in tasks_data:
        task = redis_json_to_task(data)
        if task and (status is None or task.status == status):
            tasks.append(task)
    return tasks

def create_task(redis_client: Redis, task: schemas.TaskCreate) -> schemas.Task:
    new_task = schemas.Task(
        id=str(uuid4()),
        title=task.title,
        description=task.description,
        status=schemas.Status.pending,
        created_at=datetime.utcnow()
    )
 
    redis_client.set(get_task_key(new_task.id), get_task_json(new_task))
    return new_task

def get_task(redis_client: Redis, task_id: str) -> Optional[schemas.Task]:
    task_data = redis_client.get(get_task_key(task_id))
    return redis_json_to_task(task_data)

def update_task(redis_client: Redis, task_id: str, task_update: schemas.TaskUpdate) -> Optional[schemas.Task]:
    existing_task_data = redis_client.get(get_task_key(task_id))
    if not existing_task_data:
        return None

    existing_task = schemas.Task.model_validate_json(existing_task_data)
    update_data = task_update.model_dump(exclude_unset=True)

    if not update_data:
        return existing_task

    updated_task = existing_task.model_copy(update=update_data)
    updated_task.updated_at = datetime.utcnow()
    
    
    redis_client.set(get_task_key(updated_task.id), get_task_json(updated_task))
    return updated_task

def delete_task(redis_client: Redis, task_id: str) -> bool:
    return redis_client.delete(get_task_key(task_id)) == 1