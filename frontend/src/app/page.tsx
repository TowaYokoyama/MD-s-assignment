
"use client";

import { Button } from "@/components/Button";
import Loading from "@/components/Loading";
import { CircleCheckBig, Edit, ListTodo, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

type TaskStatus = "pending" | "in_progress" | "completed"; 

interface Task {
  id: string; 
  title: string;
  description: string | null;
  status: TaskStatus;
  created_at?: string;
  updated_at?:string|null
}

export default function Home() {
  const [loading,setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null); 
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState<string | null>("");
  const [editStatus, setEditStatus] = useState<TaskStatus>("pending");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [timeFilter, setTimeFilter] = useState("all");

 
  const API_BASE_URL = "http://localhost:8002";

  const fetchTasks= async() => {
    setLoading(true);
        let url = `${API_BASE_URL}/tasks/`;
    if (filterStatus !== "all") {
      url += `?status=${filterStatus}`;
    }

    try{
      const response = await fetch(url);
    if(!response.ok){
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  const data : Task[] = await response.json();
  setTasks(data);
  }catch(error){
    console.log("failed to fetch tasks",error);

  }finally{
    setLoading(false);
  }
  }

    useEffect(() => {
    fetchTasks();
  }, [filterStatus]); //フィルターリングの状態が変更された場合再フェッチ


  const handleAddTask = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
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

  const handleDelete = async (id: string) => { 
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

  const handleUpdateTask = async (id: string) => { 
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

  const handleToggleStatus = async (taskToToggle: Task) => { 
    let newStatus: TaskStatus;
    if (taskToToggle.status === "pending") {
      newStatus = "in_progress";
    } else if (taskToToggle.status === "in_progress") {
      newStatus = "completed";
    } else {
      newStatus = "pending";
    }

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskToToggle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchTasks();
    } catch (error) {
      console.error("Failed to toggle task status:", error);
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

  const filterTasksByTime = (taskList: Task[]) => {
    const now = new Date();
    return taskList.filter(task => {
      const createdAt = task.created_at ? new Date(task.created_at) : null;
      if (!createdAt) return false;
      
      switch (timeFilter) {
        case "today":
          return createdAt.getDate() === now.getDate() && createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
        case "this_week":
          const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          return createdAt >= firstDayOfWeek;
        case "this_month":
          return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
        case "all":
        default:
          return true;
      }
    });
  };

  const filteredTasks = filterTasksByTime(tasks);


  if(loading){
    return <Loading />
  }
  

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* タスク作成 */}
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

        {/*フィルターリング */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">タスクをフィルタリング</h2>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setFilterStatus("all")} className={filterStatus === "all" ? "bg-blue-600" : ""}>
              <ListTodo size={20} className="mr-2" />
              すべて
            </Button>
            <Button onClick={() => setFilterStatus("pending")} className={filterStatus === "pending" ? "bg-blue-600" : ""}>
              <ListTodo size={20} className="mr-2" />
              未完了
            </Button>
            <Button onClick={() => setFilterStatus("completed")} className={filterStatus === "completed" ? "bg-blue-600" : ""}>
              <CircleCheckBig size={20} className="mr-2" />
              完了済み
            </Button>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              aria-label="時間でフィルタリング" 
              className="bg-gray-200 text-gray-900 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">すべての時間</option>
              <option value="today">今日</option>
              <option value="this_week">今週</option>
              <option value="this_month">今月</option>
            </select>
          </div>
        </section>

        {/* タスクリスト */}
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
                        <option value="in_progress">進行中</option>
                        <option value="completed">完了</option>
                      </select>
                      <div className="flex gap-2 mt-2">
                        <Button onClick={() => handleUpdateTask(task.id)}>保存</Button>
                        <Button onClick={handleCancelEdit} className="bg-gray-500 hover:bg-gray-600">キャンセル</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                    <div className="flex-1 w-full">
                        <h3 className={`font-bold text-xl text-gray-900 ${task.status === "completed" ? "line-through text-gray-500" : ""}`}>
                          {task.title}
                        </h3>
                        <p className="text-gray-600 mt-1 break-words">{task.description}</p>
                        <div className="text-sm text-gray-500 mt-2 flex flex-wrap gap-2">
                          {task.created_at && (
                            <span className="bg-gray-100 px-2 py-1 rounded-full">作成日: {new Date(task.created_at).toLocaleString()}</span>
                          )}
                          {task.updated_at && (
                            <span className="bg-gray-100 px-2 py-1 rounded-full">更新日: {new Date(task.updated_at).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-4 sm:mt-0">
                        <Button 
                          onClick={() => handleToggleStatus(task)} 
                          className={
                            task.status === "completed" 
                              ? "bg-green-500 hover:bg-green-600" 
                              : task.status === "in_progress" 
                                ? "bg-blue-500 hover:bg-blue-600" 
                                : "bg-yellow-500 hover:bg-yellow-600"
                          }
                        >
                          {task.status === "completed" ? "完了" : task.status === "in_progress" ? "進行中" : "未完了"}
                        </Button>
                        <Button onClick={() => handleEditClick(task)} className="bg-gray-500 hover:bg-gray-600">
                          <Edit size={20} />
                        </Button>
                        <Button onClick={() => handleDelete(task.id)} className="bg-red-500 hover:bg-red-600">
                          <Trash2 size={20} />
                        </Button>
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