import pytest
from unittest.mock import Mock, patch
from datetime import datetime
from app import crud, models, schemas

# Mock Redis client fixture
@pytest.fixture
def mock_redis_client():
    return Mock()

# Test for create_task
def test_create_task(mock_redis_client):
    task_create = schemas.TaskCreate(title="Test Task", description="Test Description")
    
    # Mock uuid4 to return a predictable ID
    with patch('app.models.uuid.uuid4', return_value=Mock(hex='test-uuid')):
        created_task = crud.create_task(mock_redis_client, task_create)

    assert created_task.title == "Test Task"
    assert created_task.description == "Test Description"
    assert created_task.status == models.Status.pending
    assert created_task.id == "test-uuid"
    assert isinstance(created_task.created_at, datetime)
    assert created_task.updated_at is not None # updated_at is set on creation now
    
    # Verify Redis set and sadd calls
    mock_redis_client.hmset.assert_called_once() # Changed from set to hmset
    mock_redis_client.sadd.assert_called_once_with("tasks:pending", "test-uuid")

# Test for get_task
def test_get_task(mock_redis_client):
    task_id = "test-uuid"
    # Mock Redis get to return a serialized task
    mock_redis_client.hgetall.return_value = {
        "id": task_id,
        "title": "Existing Task",
        "description": "Existing Description",
        "status": "completed",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    task = crud.get_task(mock_redis_client, task_id)

    assert task is not None
    assert task.id == task_id
    assert task.title == "Existing Task"
    mock_redis_client.hgetall.assert_called_once_with(f"task:{task_id}")

def test_get_task_not_found(mock_redis_client):
    mock_redis_client.hgetall.return_value = {}
    task = crud.get_task(mock_redis_client, "non-existent-id")
    assert task is None

# Test for update_task
def test_update_task(mock_redis_client):
    task_id = "test-uuid"
    # Mock initial task data
    initial_task_data = {
        "id": task_id,
        "title": "Original Title",
        "description": "Original Description",
        "status": "pending",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    mock_redis_client.hgetall.side_effect = [initial_task_data, initial_task_data] # For get_task inside update_task

    task_update = schemas.TaskUpdate(title="Updated Title", status=models.Status.completed)
    updated_task = crud.update_task(mock_redis_client, task_id, task_update)

    assert updated_task is not None
    assert updated_task.title == "Updated Title"
    assert updated_task.status == models.Status.completed
    assert updated_task.description == "Original Description"
    assert updated_task.updated_at is not None
    
    # Verify Redis calls
    mock_redis_client.srem.assert_called_once_with("tasks:pending", task_id)
    mock_redis_client.sadd.assert_called_once_with("tasks:completed", task_id)
    mock_redis_client.hmset.assert_called_once() # Changed from set to hmset

def test_update_task_status_no_change(mock_redis_client):
    task_id = "test-uuid"
    initial_task_data = {
        "id": task_id,
        "title": "Original Title",
        "description": "Original Description",
        "status": "pending",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    mock_redis_client.hgetall.side_effect = [initial_task_data, initial_task_data]

    task_update = schemas.TaskUpdate(title="Updated Title") # Status not changed
    updated_task = crud.update_task(mock_redis_client, task_id, task_update)

    assert updated_task is not None
    assert updated_task.title == "Updated Title"
    assert updated_task.status == models.Status.pending # Status remains pending
    
    # Verify Redis calls - sadd/srem should NOT be called
    mock_redis_client.srem.assert_not_called()
    mock_redis_client.sadd.assert_not_called()
    mock_redis_client.hmset.assert_called_once()

def test_update_task_not_found(mock_redis_client):
    mock_redis_client.hgetall.return_value = {}
    task_update = schemas.TaskUpdate(title="Updated Title")
    updated_task = crud.update_task(mock_redis_client, "non-existent-id", task_update)
    assert updated_task is None
    mock_redis_client.hmset.assert_not_called()

# Test for delete_task
def test_delete_task(mock_redis_client):
    task_id = "test-uuid"
    # Mock initial task data for get_task inside delete_task
    initial_task_data = {
        "id": task_id,
        "title": "Task to Delete",
        "description": "",
        "status": "completed",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    mock_redis_client.hgetall.return_value = initial_task_data
    mock_redis_client.delete.return_value = 1 # Simulate successful deletion

    result = crud.delete_task(mock_redis_client, task_id)

    assert result is True
    mock_redis_client.hgetall.assert_called_once_with(f"task:{task_id}")
    mock_redis_client.delete.assert_called_once_with(f"task:{task_id}")
    mock_redis_client.srem.assert_called_once_with("tasks:completed", task_id)

def test_delete_task_not_found(mock_redis_client):
    mock_redis_client.hgetall.return_value = {}
    result = crud.delete_task(mock_redis_client, "non-existent-id")
    assert result is False
    mock_redis_client.delete.assert_not_called()
    mock_redis_client.srem.assert_not_called()

# Test for get_tasks (all statuses)
def test_get_all_tasks(mock_redis_client):
    # Mock smembers for all status sets
    mock_redis_client.pipeline.return_value.execute.return_value = [
        {b'id1', b'id2'}, # pending
        {b'id3'}, # in_progress
        {b'id4', b'id5'} # completed
    ]
    
    # Mock hgetall for each task
    mock_redis_client.hgetall.side_effect = [
        {b'id': b'id1', b'title': b'Task 1', b'status': b'pending', b'created_at': datetime.now().isoformat().encode(), b'updated_at': datetime.now().isoformat().encode()},
        {b'id': b'id2', b'title': b'Task 2', b'status': b'pending', b'created_at': datetime.now().isoformat().encode(), b'updated_at': datetime.now().isoformat().encode()},
        {b'id': b'id3', b'title': b'Task 3', b'status': b'in_progress', b'created_at': datetime.now().isoformat().encode(), b'updated_at': datetime.now().isoformat().encode()},
        {b'id': b'id4', b'title': b'Task 4', b'status': b'completed', b'created_at': datetime.now().isoformat().encode(), b'updated_at': datetime.now().isoformat().encode()},
        {b'id': b'id5', b'title': b'Task 5', b'status': b'completed', b'created_at': datetime.now().isoformat().encode(), b'updated_at': datetime.now().isoformat().encode()},
    ]

    tasks = crud.get_tasks(mock_redis_client)

    assert len(tasks) == 5
    assert all(isinstance(t, schemas.Task) for t in tasks)
    assert mock_redis_client.pipeline.called
    assert mock_redis_client.smembers.call_count == len(models.Status) # Called for each status set
    assert mock_redis_client.hgetall.call_count == 5 # Called for each task

def test_get_tasks_by_status(mock_redis_client):
    task_id = "id1"
    mock_redis_client.smembers.return_value = {b'id1'}
    mock_redis_client.hgetall.return_value = {
        b'id': b'id1', b'title': b'Task 1', b'status': b'pending', 
        b'created_at': datetime.now().isoformat().encode(), 
        b'updated_at': datetime.now().isoformat().encode()
    }

    tasks = crud.get_tasks(mock_redis_client, status=models.Status.pending)

    assert len(tasks) == 1
    assert tasks[0].id == task_id
    assert tasks[0].status == models.Status.pending
    mock_redis_client.smembers.assert_called_once_with("tasks:pending")
    mock_redis_client.hgetall.assert_called_once_with(f"task:{task_id}")