import json
from datetime import datetime, timezone
from unittest.mock import Mock, patch
import pytest
from redis import Redis
from app import crud, schemas
import uuid

@pytest.fixture
def mock_redis_client():
    return Mock(spec=Redis)

def test_create_task(mock_redis_client):
    task_create = schemas.TaskCreate(title="Test Task", description="Test Description")
    
    # uuid4 をモックして、固定のIDを返すようにする
    mock_uuid = uuid.UUID('00000000-0000-0000-0000-000000000000')
    with patch('uuid.uuid4', return_value=mock_uuid):
        new_task = crud.create_task(mock_redis_client, task_create)

    assert new_task.title == "Test Task"
    assert new_task.description == "Test Description"
    assert new_task.status == schemas.Status.pending
    
    # Redis SET呼び出しを検証
    expected_key = "task:00000000-0000-0000-0000-000000000000"
    
    # setメソッドの第2引数（JSONデータ）を検証する
    # model_dump_json()の出力と直接比較する
    mock_redis_client.set.assert_called_once_with(expected_key, new_task.model_dump_json())


def test_get_task(mock_redis_client):
    task_id = "test-uuid"
    
    # Redisから取得するデータをPydanticモデルのJSON出力に合わせる
    expected_task = schemas.Task(
        id=task_id,
        title="Existing Task",
        description="Existing Description",
        status=schemas.Status.completed,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    mock_redis_client.get.return_value = expected_task.model_dump_json()

    task = crud.get_task(mock_redis_client, task_id)
    assert task is not None
    assert task.title == "Existing Task"
    mock_redis_client.get.assert_called_once_with(f"task:{task_id}")

def test_get_all_tasks(mock_redis_client):
    task_id1 = "task-uuid-1"
    task_id2 = "task-uuid-2"
    task1_data = schemas.Task(id=task_id1, title="Task 1", status=schemas.Status.pending)
    task2_data = schemas.Task(id=task_id2, title="Task 2", status=schemas.Status.completed)
    
    mock_redis_client.keys.return_value = [f"task:{task_id1}".encode(), f"task:{task_id2}".encode()]
    
    pipe = mock_redis_client.pipeline.return_value
    pipe.get.side_effect = [task1_data.model_dump_json().encode(), task2_data.model_dump_json().encode()] # `get`のモックを修正
    pipe.execute.return_value = [task1_data.model_dump_json(), task2_data.model_dump_json()]
    
    tasks = crud.get_tasks(mock_redis_client, status=None)
    
    assert len(tasks) == 2
    assert tasks[0].id == task_id1
    assert tasks[1].id == task_id2

def test_update_task(mock_redis_client):
    task_id = "test-uuid"
    initial_task = schemas.Task(
        id=task_id,
        title="Original Title",
        description="Original Description",
        status=schemas.Status.pending,
        created_at=datetime.utcnow()
    )
    mock_redis_client.get.return_value = initial_task.model_dump_json()
    mock_redis_client.set.return_value = True

    task_update = schemas.TaskUpdate(title="Updated Title", status=schemas.Status.completed)
    updated_task = crud.update_task(mock_redis_client, task_id, task_update)

    assert updated_task is not None
    assert updated_task.title == "Updated Title"
    assert updated_task.status == schemas.Status.completed
    assert updated_task.description == "Original Description"
    mock_redis_client.get.assert_called_once_with(f"task:{task_id}")
    mock_redis_client.set.assert_called_once()

def test_delete_task(mock_redis_client):
    task_id = "test-uuid"
    mock_redis_client.delete.return_value = 1
    
    result = crud.delete_task(mock_redis_client, task_id)
    
    assert result is True
    mock_redis_client.delete.assert_called_once_with(f"task:{task_id}")