
"use client";

import { Button } from "@/components/Button";
import { useState, useEffect } from "react";

type TaskStatus = "pending" | "completed";

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
}

export default function Home() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState<string | null>("");
  const [editStatus, setEditStatus] = useState<TaskStatus>("pending");

  // バックエンドのURLを正しい形式に修正
  const API_BASE_URL = "http://localhost:8002";

  const handleAddTask = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description, status: "pending" }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setTitle("");
      setDescription("");
      fetchTasks();
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleUpdateTask = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          status: editStatus,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setEditingTaskId(null);
      fetchTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditStatus(task.status);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditTitle("");
    setEditDescription("");
    setEditStatus("pending");
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Task[] = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Task Creation Section */}
        <section className="mb-10 p-6 bg-gray-100 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">新規タスクの作成</h2>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="タスクのタイトル..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-grow bg-gray-200 text-gray-900 placeholder-gray-500 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="タスクの説明..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-grow bg-gray-200 text-gray-900 placeholder-gray-500 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
            <Button onClick={handleAddTask}>タスクを追加</Button>
          </div>
        </section>

        {/* Task List Section */}
        <section>
          <h2 className="text-3xl font-bold mb-6">あなたのタスク</h2>
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <p className="text-gray-600">タスクがありません。</p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-5 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-between"
                >
                  {editingTaskId === task.id ? (
                    <div className="flex flex-col w-full gap-2">
                      <input
                        type="text"
                        value={editTitle}
                        aria-label="タスクのタイトル"
                        placeholder="タスクのタイトル"
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-gray-200 text-gray-900 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <textarea
                        value={editDescription || ""}
                        onChange={(e) => setEditDescription(e.target.value)}
                        aria-label="タスクの説明"
                        placeholder="タスクの説明"
                        className="bg-gray-200 text-gray-900 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                      <select
                        aria-label="タスクの状態"
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                        className="bg-gray-200 text-gray-900 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">未完了</option>
                        <option value="completed">完了</option>
                      </select>
                      <div className="flex gap-2 mt-2">
                        <Button onClick={() => handleUpdateTask(task.id)}>保存</Button>
                        <Button onClick={handleCancelEdit} className="bg-gray-500 hover:bg-gray-600">キャンセル</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3 className="font-bold text-xl text-gray-900">{task.title}</h3>
                        <p className="text-gray-600 mt-1">{task.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-sm font-semibold px-3 py-1 rounded-full ${
                            task.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {task.status === "completed" ? "完了" : "未完了"}
                        </span>
                        <button
                          onClick={() => handleEditClick(task)}
                          className="text-gray-600 hover:text-gray-900"
                          aria-label="タスクを編集"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 6.232z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="text-red-500 hover:text-red-700"
                          aria-label="タスクを削除"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}