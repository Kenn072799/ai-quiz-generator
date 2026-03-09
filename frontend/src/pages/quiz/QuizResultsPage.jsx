import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ArrowLeft,
  Trophy,
} from "lucide-react";

const OPTION_KEYS = { A: "optionA", B: "optionB", C: "optionC", D: "optionD" };

export default function QuizResultsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(null);

  const result = state?.result;
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-gray-600">No results found.</p>
        <button
          onClick={() => navigate("/quizzes")}
          className="text-[#4F46E5] hover:underline text-sm"
        >
          ← Back to Quizzes
        </button>
      </div>
    );
  }

  const pct =
    result.totalQuestions > 0
      ? Math.round((result.score / result.totalQuestions) * 100)
      : 0;

  const grade =
    pct >= 90
      ? { label: "Excellent!", color: "text-emerald-600" }
      : pct >= 70
        ? { label: "Good job!", color: "text-indigo-600" }
        : pct >= 50
          ? { label: "Keep practicing!", color: "text-amber-600" }
          : { label: "Needs improvement", color: "text-red-600" };

  const scoreColor =
    pct >= 70
      ? "text-emerald-600"
      : pct >= 50
        ? "text-amber-600"
        : "text-red-500";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Score card */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center mb-6"
      >
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
            <Trophy size={30} className="text-[#4F46E5]" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Quiz Complete! 🎉</h1>
        <p className="text-sm text-gray-500 mb-3">{result.topicName}</p>
        <div className={`text-5xl font-extrabold mt-2 ${scoreColor}`}>
          {pct}%
        </div>
        <div className={`text-sm font-semibold mt-1 ${grade.color}`}>
          {grade.label}
        </div>
        <p className="text-gray-500 text-sm mt-2">
          {result.score} / {result.totalQuestions} correct · Attempt #
          {result.attemptNumber}
        </p>

        {/* Score bar */}
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mt-4">
          <motion.div
            className={`h-full rounded-full ${pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-red-400"}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => navigate(-2)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft size={15} /> Back to Topics
        </button>
        <button
          onClick={() => navigate(`/quiz/generate/${result.topicId}`)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4F46E5] text-white rounded-xl text-sm font-medium hover:bg-indigo-700"
        >
          <RotateCcw size={15} /> Retake Quiz
        </button>
      </div>

      {/* Results breakdown */}
      <h2 className="font-semibold text-gray-900 mb-4">Answer Review</h2>
      <div className="space-y-3">
        {result.results.map((r, i) => (
          <motion.div
            key={r.questionId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full flex items-start gap-3 p-4 text-left"
            >
              <div className="shrink-0 mt-0.5">
                {r.isCorrect ? (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                ) : (
                  <XCircle size={18} className="text-red-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 leading-snug">
                  {i + 1}. {r.questionText}
                </p>
                <p
                  className={`text-xs mt-1 font-medium ${r.isCorrect ? "text-emerald-600" : "text-red-500"}`}
                >
                  {r.isCorrect
                    ? `✓ Correct (${r.correctAnswer})`
                    : `✗ You chose ${r.selectedAnswer || "(no answer)"} — Correct: ${r.correctAnswer}`}
                </p>
              </div>
              {expanded === i ? (
                <ChevronUp size={16} className="text-gray-400 shrink-0 mt-1" />
              ) : (
                <ChevronDown
                  size={16}
                  className="text-gray-400 shrink-0 mt-1"
                />
              )}
            </button>

            <AnimatePresence>
              {expanded === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 border-t border-gray-50">
                    {/* All options */}
                    <div className="grid grid-cols-1 gap-1.5 mt-3 mb-3">
                      {["A", "B", "C", "D"].map((label) => {
                        const text = r[OPTION_KEYS[label]];
                        const isCorrect = label === r.correctAnswer;
                        const isSelected = label === r.selectedAnswer;
                        return (
                          <div
                            key={label}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                              isCorrect
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : isSelected && !isCorrect
                                  ? "bg-red-50 text-red-700 border border-red-200"
                                  : "bg-gray-50 text-gray-600"
                            }`}
                          >
                            <span
                              className={`font-bold w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                                isCorrect
                                  ? "bg-emerald-500 text-white"
                                  : isSelected
                                    ? "bg-red-400 text-white"
                                    : "bg-gray-200 text-gray-500"
                              }`}
                            >
                              {label}
                            </span>
                            {text}
                            {isCorrect && (
                              <CheckCircle2
                                size={13}
                                className="ml-auto text-emerald-500"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="bg-indigo-50 rounded-lg px-3 py-2.5">
                      <p className="text-xs font-semibold text-[#4F46E5] mb-1">
                        Explanation
                      </p>
                      <p className="text-xs text-indigo-900 leading-relaxed">
                        {r.explanation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
