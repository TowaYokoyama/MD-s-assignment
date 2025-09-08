import os 
from sqlalchemy import create_engine

from sqlalchemy.orm import declarative_base, sessionmaker
#本ちゃんはpostgreでローカルはsqliteで
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///.test.db")

engine = create_engine(
    "DATABSE_URL",
    connect_args={"check_same_thread":False} if DATABASE_URL.startswith("sqlite") else {}
    )
SessionLocal = sessionmaker(autocommit= False, autoflush=False,bind= engine)
Base = declarative_base()

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()