from fastapi import FastAPI, HTTPException,Depends, status
from sqlalchemy.orm import Session 
from . import models,schemas,crud,database

app = FastAPI()

models.Base.metadata.create_all(bind=database.engine)

#---endpoint----

@app.post("/tasks/", response_model=schemas.Task)
def create_task(task:schemas.TaskCreate,db: Session = Depends(database.get_db)):
    
    return crud.create_task(db=db, task=task)

@app.get("/tasks/")
def read_tasks(db: Session = Depends(database.get_db)):
    
    return crud.get_tasks(db)

#他