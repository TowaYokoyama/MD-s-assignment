from fastapi import FastAPI, HTTPException, Depends, status, Response,  Request
import os

from redis import Redis, from_url as redis_from_url
from . import schemas, crud
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[#"http://localhost:3000",
                   #"https://md-s-assignment-oi3i.vercel.app",
        #"https://md-s-assignment-oi3i-git-main-towa-yokoyamas-projects.vercel.app",
        #"https://md-s-assignment-oi3i-ftzc99xee-towa-yokoyamas-projects.vercel.app",
         
                  "*"  ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# RedisクライアントをFastAPIの状態に保存
@app.on_event("startup")
def startup_event():
    app.state.redis = redis_from_url(os.environ.get("REDIS_URL", "redis://localhost:6379/0"), decode_responses=True)

# 依存性の注入（DI）
def get_redis_client(request: Request) -> Redis:
    return request.app.state.redis
#---endpoint----
@app.post("/tasks/", response_model=schemas.Task, status_code=status.HTTP_201_CREATED)
def create_new_task(task: schemas.TaskCreate, redis_client: Redis = Depends(get_redis_client)):
    return crud.create_task(redis_client=redis_client, task=task)

@app.get("/tasks/", response_model=List[schemas.Task])
def read_tasks(status: Optional[schemas.Status] = None, redis_client: Redis = Depends(get_redis_client)):
    tasks = crud.get_tasks(redis_client=redis_client, status=status)
    return tasks

@app.get("/tasks/{task_id}", response_model=schemas.Task)
def read_task(task_id: str, redis_client: Redis = Depends(get_redis_client)): 
    db_task = crud.get_task(redis_client=redis_client, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@app.put("/tasks/{task_id}", response_model=schemas.Task)
def update_existing_task(task_id: str, task: schemas.TaskUpdate, redis_client: Redis = Depends(get_redis_client)):
    updated_task = crud.update_task(redis_client=redis_client, task_id=task_id, task_update=task)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return updated_task

@app.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_task(task_id: str, redis_client: Redis = Depends(get_redis_client)):
    db_task = crud.delete_task(redis_client=redis_client, task_id=task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)