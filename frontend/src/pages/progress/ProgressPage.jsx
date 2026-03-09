import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, BookOpen, RotateCcw } from "lucide-react";
import api from "../../services/api";

export default function ProgressPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/quiz/progress")
      .then((r) => setProgress(r.data))
      .catch(() => setProgress([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <div className="h-7 w-36 bg-gray-200 rounded-full" />
          <div className="h-4 w-60 bg-gray-100 rounded-full" />
        </div>
        {/* Topic progress cards */}
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded-full w-1/2" />
                <div className="h-4 bg-gray-100 rounded-full w-16" />
              </div>
              {/* Progress bar */}
              <div className="h-2.5 bg-gray-100 rounded-full w-full">
                <div
                  className="h-2.5 bg-gray-200 rounded-full"
                  style={{ width: `${30 + i * 15}%` }}
                />
              </div>
              <div className="flex gap-6">
                <div className="h-3 bg-gray-100 rounded-full w-20" />
                <div className="h-3 bg-gray-100 rounded-full w-20" />
                <div className="h-3 bg-gray-100 rounded-full w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="text-[#4F46E5]" size={24} />
          My Progress
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Track your performance across all topics.
        </p>
      </div>

      {progress.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
            <BookOpen size={26} className="text-[#4F46E5]" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-800">No progress yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Complete quizzes to see your progress here.
            </p>
          </div>
          <button
            onClick={() => navigate("/documents")}
            className="bg-[#4F46E5] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Start Studying
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {progress.map((topic, i) => {
            const pct = topic.bestPercentage;
            const barColor =
              pct >= 70
                ? "bg-emerald-500"
                : pct >= 50
                  ? "bg-amber-400"
                  : "bg-red-400";
            const textColor =
              pct >= 70
                ? "text-emerald-600"
                : pct >= 50
                  ? "text-amber-600"
                  : "text-red-500";

            return (
              <motion.div
                key={topic.topicId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {topic.topicName}
                    </h3>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {topic.documentName}
                    </p>
                  </div>
                  <div className="ml-4 text-right shrink-0">
                    <span className={`text-lg font-extrabold ${textColor}`}>
                      {pct}%
                    </span>
                    <p className="text-xs text-gray-400">
                      {topic.bestScore}/{topic.totalQuestions} best
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <motion.div
                    className={`h-full rounded-full ${barColor}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, delay: i * 0.05 }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {topic.attemptCount} attempt
                    {topic.attemptCount !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={() => navigate(`/quiz/generate/${topic.topicId}`)}
                    className="flex items-center gap-1.5 text-xs text-[#4F46E5] hover:underline font-medium"
                  >
                    <RotateCcw size={12} /> Retake Quiz
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
