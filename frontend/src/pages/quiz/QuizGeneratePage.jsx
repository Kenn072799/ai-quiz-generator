import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import api from "../../services/api";

export default function QuizGeneratePage() {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState("generating"); // 'generating' | 'error'
  const [error, setError] = useState("");
  const [topicName, setTopicName] = useState("");

  useEffect(() => {
    const generate = async () => {
      try {
        const res = await api.post(`/quiz/generate/${topicId}`);
        setTopicName(res.data.topicName);
        // Navigate to the quiz page once generated
        navigate(`/quiz/${res.data.quizId}`, { replace: true });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to generate quiz. Please try again.",
        );
        setState("error");
      }
    };
    generate();
  }, [topicId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {state === "generating" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6 text-center max-w-sm"
        >
          <div className="relative">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center">
              <Sparkles size={34} className="text-[#4F46E5]" />
            </div>
            <Loader2
              size={22}
              className="animate-spin text-[#4F46E5] absolute -top-1 -right-1"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Generating Your Quiz
            </h2>
            {topicName && (
              <p className="text-sm text-[#4F46E5] font-medium mt-1">
                {topicName}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              AI is creating personalized questions based on your document. This
              may take a few seconds...
            </p>
          </div>

          {/* Animated dots */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                className="w-2 h-2 rounded-full bg-[#4F46E5]"
              />
            ))}
          </div>
        </motion.div>
      )}

      {state === "error" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 text-center max-w-sm"
        >
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <AlertCircle size={28} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Generation Failed
            </h2>
            <p className="text-sm text-gray-500 mt-2">{error}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              <ArrowLeft size={15} /> Go Back
            </button>
            <button
              onClick={() => {
                setState("generating");
                setError("");
                window.location.reload();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              <Sparkles size={15} /> Try Again
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
