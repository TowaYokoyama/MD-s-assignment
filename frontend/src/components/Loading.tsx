import { Loader } from "lucide-react";

//loadingコンポーネント
export default function Loading() {
    return (
        <div className="flex item-center justify-center min-h-screen bg-gray-50 text-gray-900">
            <div className="text-center">
                <div className="text-4xl font-bold mb-4">読み込み中</div>
                <div className="mt-8">
                    <Loader className="animate-spin h-10 w-10 text-blue-500 mx-auto" />
                </div>
            </div>
        </div>
    )
}