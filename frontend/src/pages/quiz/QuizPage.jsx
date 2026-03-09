import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import api from "../../services/api";

const OPTION_LABELS = ["A", "B", "C", "D"];
const OPTION_KEYS = ["optionA", "optionB", "optionC", "optionD"];

export default function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: 'A' | 'B' | ... }
  const [submitting, setSubmitting] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  useEffect(() => {
    api
      .get(`/quiz/${quizId}`)
      .then((r) => {
        setQuiz(r.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load quiz.");
        setLoading(false);
      });
  }, [quizId]);

  const currentQuestion = quiz?.questions[currentIndex];
  const totalQuestions = quiz?.questions.length ?? 0;
  const isLast = currentIndex === totalQuestions - 1;
  const isFirst = currentIndex === 0;
  const answeredCount = Object.keys(answers).length;

  const goNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  };

  const selectAnswer = (option) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(
          ([questionId, selectedAnswer]) => ({
            questionId: Number(questionId),
            selectedAnswer,
          }),
        ),
      };
      const res = await api.post(`/quiz/${quizId}/submit`, payload);
      navigate(`/quiz/${quizId}/results`, { state: { result: res.data } });
    } catch (err) {
      setError(
        err.response?.data?.message || "Submission failed. Please try again.",
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <div className="h-3.5 w-28 bg-gray-200 rounded-full" />
            <div className="h-3.5 w-16 bg-gray-100 rounded-full" />
          </div>
          <div className="h-2 bg-gray-100 rounded-full w-full" />
        </div>
        {/* Question card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded-full w-full" />
            <div className="h-4 bg-gray-200 rounded-full w-5/6" />
            <div className="h-4 bg-gray-100 rounded-full w-2/3" />
          </div>
          {/* Options */}
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 border border-gray-100 rounded-xl p-4"
              >
                <div className="w-6 h-6 bg-gray-100 rounded-full shrink-0" />
                <div className="h-4 bg-gray-100 rounded-full flex-1" />
              </div>
            ))}
          </div>
          {/* Submit button */}
          <div className="h-11 bg-gray-200 rounded-xl w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-screen gap-4">
        <AlertCircle size={32} className="text-red-500" />
        <p className="text-gray-700">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-[#4F46E5] text-sm hover:underline"
        >
          ← Go back
        </button>
      </div>
    );
  }

  const progressPct =
    totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={16} className="text-[#4F46E5]" />
          <span className="text-sm font-medium text-[#4F46E5]">
            {quiz.topicName}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span>{answeredCount} answered</span>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#4F46E5] rounded-full"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="relative overflow-hidden" style={{ minHeight: "340px" }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.22 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            <p className="text-gray-900 font-semibold text-base leading-relaxed mb-6">
              {currentQuestion.questionText}
            </p>

            <div className="space-y-3">
              {OPTION_LABELS.map((label, idx) => {
                const text = currentQuestion[OPTION_KEYS[idx]];
                const isSelected = answers[currentQuestion.id] === label;
                return (
                  <button
                    key={label}
                    onClick={() => selectAnswer(label)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all text-sm ${
                      isSelected
                        ? "border-[#4F46E5] bg-indigo-50 text-[#4F46E5] font-medium"
                        : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected
                          ? "bg-[#4F46E5] text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {label}
                    </span>
                    {text}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={goPrev}
          disabled={isFirst}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#22C55E] text-white rounded-xl text-sm font-semibold hover:bg-green-600 disabled:opacity-60 transition-all shadow-sm"
          >
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Submitting...
              </>
            ) : (
              "Submit Quiz"
            )}
          </button>
        ) : (
          <button
            onClick={goNext}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#4F46E5] text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all"
          >
            Next <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Question dots */}
      <div className="flex justify-center gap-1.5 mt-6 flex-wrap">
        {quiz.questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => {
              setDirection(i > currentIndex ? 1 : -1);
              setCurrentIndex(i);
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === currentIndex
                ? "bg-[#4F46E5] scale-125"
                : answers[q.id]
                  ? "bg-indigo-300"
                  : "bg-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
