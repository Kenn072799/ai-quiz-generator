import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Clock, ChevronRight } from "lucide-react";
import api from "../../services/api";

export default function QuizzesPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/quiz/history")
      .then((r) => setHistory(r.data))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <div className="h-7 w-40 bg-gray-200 rounded-full" />
          <div className="h-4 w-56 bg-gray-100 rounded-full" />
        </div>
        {/* List rows */}
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded-full w-2/3" />
                <div className="h-3 bg-gray-100 rounded-full w-1/3" />
              </div>
              <div className="h-6 w-12 bg-gray-100 rounded-full shrink-0" />
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
          <BookOpen className="text-[#4F46E5]" size={24} />
          Quiz History
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          View all your past quiz attempts.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
            <BookOpen size={26} className="text-[#4F46E5]" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-800">No quizzes taken yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Upload a document and generate a quiz to get started.
            </p>
          </div>
          <button
            onClick={() => navigate("/documents")}
            className="bg-[#4F46E5] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Go to Documents
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((attempt, i) => {
            const pct =
              attempt.totalQuestions > 0
                ? Math.round((attempt.score / attempt.totalQuestions) * 100)
                : 0;
            const scoreColor =
              pct >= 70
                ? "text-emerald-600"
                : pct >= 50
                  ? "text-amber-600"
                  : "text-red-500";
            const badgeBg =
              pct >= 70
                ? "bg-emerald-50"
                : pct >= 50
                  ? "bg-amber-50"
                  : "bg-red-50";

            return (
              <motion.div
                key={attempt.attemptId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${badgeBg} flex items-center justify-center shrink-0`}
                >
                  <span className={`text-sm font-extrabold ${scoreColor}`}>
                    {pct}%
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {attempt.topicName}
                  </h3>
                  <p className="text-xs text-gray-400 truncate">
                    {attempt.documentName}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">
                      {attempt.score}/{attempt.totalQuestions} correct
                    </span>
                    <span className="text-xs text-gray-400">
                      Attempt #{attempt.attemptNumber}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={11} />
                    {new Date(attempt.completedAt).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
