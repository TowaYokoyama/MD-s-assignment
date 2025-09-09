# Task Management Application

This is a simple task management application built with FastAPI for the backend and Next.js for the frontend.

## Features

- Create, Read, Update, Delete (CRUD) tasks.
- Filter tasks by status (pending, in_progress, completed).

## Technology Stack

- **Backend**: FastAPI, Python
- **Frontend**: Next.js, TypeScript
- **Database**: PostgreSQL

## Getting Started

### 1. Backend Setup

First, set up the Python backend.

**Database Setup (PostgreSQL)**

1.  **Install PostgreSQL**: If you don't have it installed, download and install it from the [official website](https://www.postgresql.org/download/).
2.  **Create a database**: Create a new database for this project. For example, `taskdb`.
3.  **Create a user**: Create a user and grant privileges to the database. For example, user `user` with password `password`.

**Environment Variables**

The backend uses a `.env` file for configuration. Create a `.env` file in the `backend` directory and add the following line, replacing the credentials with your own if you used different ones:

```
DATABASE_URL="postgresql://user:password@localhost:5432/taskdb"
```

**Installation & Running**

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment (Windows)
.\venv\Scripts\Activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

### 2. Frontend Setup

(Instructions to be added later)

### API Specification

The API provides the following endpoints:

- `POST /tasks/`: Create a new task.
- `GET /tasks/`: Get a list of all tasks. Can be filtered by `status`.
- `GET /tasks/{task_id}`: Get a single task by its ID.
- `PUT /tasks/{task_id}`: Update a task.
- `DELETE /tasks/{task_id}`: Delete a task.
