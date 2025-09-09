import { Button } from "@/components/Button";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900"> {/* Outer wrapper for full screen background */}
      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Task Creation Section */}
        <section className="mb-10 p-6 bg-gray-100 rounded-lg shadow-md"> {/* Changed to bg-gray-100 */}
          <h2 className="text-2xl font-bold mb-4">新規タスクの作成</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="タスクのタイトル..."
              className="flex-grow bg-gray-200 text-gray-900 placeholder-gray-500 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button>
              タスクを追加
            </Button>
          </div>
        </section>

        {/* Task List Section */}
        <section>
          <h2 className="text-3xl font-bold mb-6">あなたのタスク</h2>
          <div className="space-y-4">
            {/* Example Task Card */}
            <div className="p-5 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-between"> {/* Changed to bg-white, added border */}
              <div>
                <h3 className="font-bold text-xl text-gray-900">例: UIの再構築</h3> {/* Changed text color */}
                <p className="text-gray-600 mt-1">再利用可能なコンポーネントとTailwind CSSを利用</p> {/* Changed text color */}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold bg-green-100 text-green-800 px-3 py-1 rounded-full"> {/* Changed status badge color */}
                  完了
                </span>
                <button className="text-gray-600 hover:text-gray-900" aria-label="タスクを編集"> {/* Changed icon color */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 6.232z" />
                  </svg>
                </button>
                <button className="text-red-500 hover:text-red-700" aria-label="タスクを削除"> {/* Changed icon color */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          {/* Add more tasks here */}
        </div>
      </section>
      </main>
    </div>
  );
}
