import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  RotateCcw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import api from "../../services/api";

export default function FlashcardsPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState("loading"); // 'loading' | 'ready' | 'error'
  const [flashcards, setFlashcards] = useState([]);
  const [topicName, setTopicName] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    load();
  }, [topicId]);

  const load = async () => {
    setState("loading");
    setFlipped(false);
    setIndex(0);
    try {
      // Try to get existing flashcards first
      const res = await api.get(`/flashcards/topic/${topicId}`);
      if (res.data.flashcards.length > 0) {
        setFlashcards(res.data.flashcards);
        setTopicName(res.data.topicName);
        setDocumentName(res.data.documentName);
        setState("ready");
      } else {
        // Generate new ones
        await generate();
      }
    } catch {
      await generate();
    }
  };

  const generate = async () => {
    setState("loading");
    try {
      const res = await api.post(`/flashcards/generate/${topicId}`);
      setFlashcards(res.data.flashcards);
      setTopicName(res.data.topicName);
      setDocumentName(res.data.documentName);
      setState("ready");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate flashcards.");
      setState("error");
    }
  };

  const goNext = () => {
    setFlipped(false);
    setTimeout(
      () => setIndex((i) => Math.min(i + 1, flashcards.length - 1)),
      150,
    );
  };

  const goPrev = () => {
    setFlipped(false);
    setTimeout(() => setIndex((i) => Math.max(i - 1, 0)), 150);
  };

  if (state === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-5">
        <div className="relative">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
            <Sparkles size={28} className="text-[#4F46E5]" />
          </div>
          <Loader2
            size={20}
            className="animate-spin text-[#4F46E5] absolute -top-1 -right-1"
          />
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-800">Generating Flashcards</p>
          <p className="text-sm text-gray-500 mt-1">
            AI is creating study cards for you...
          </p>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
          <AlertCircle size={26} className="text-red-500" />
        </div>
        <p className="text-gray-700 font-medium">{error}</p>
        <button
          onClick={generate}
          className="flex items-center gap-2 bg-[#4F46E5] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          <RotateCcw size={15} /> Try Again
        </button>
      </div>
    );
  }

  const card = flashcards[index];

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft size={15} /> Back
      </button>

      {/* Header */}
      <div className="mb-6 text-center">
        <p className="text-xs text-gray-400 mb-0.5">{documentName}</p>
        <h1 className="text-xl font-bold text-gray-900">{topicName}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Card {index + 1} of {flashcards.length} · Click card to flip
        </p>
      </div>

      {/* Flashcard */}
      <div
        className="cursor-pointer mb-6"
        style={{ height: "280px", perspective: "1000px" }}
        onClick={() => setFlipped((f) => !f)}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          style={{
            transformStyle: "preserve-3d",
            position: "relative",
            height: "100%",
          }}
        >
          {/* Front */}
          <div
            style={{ backfaceVisibility: "hidden" }}
            className="absolute inset-0 bg-white rounded-2xl shadow-md border-2 border-indigo-100 flex flex-col items-center justify-center p-6"
          >
            <div className="text-xs font-semibold text-[#4F46E5] mb-3 uppercase tracking-wide">
              Question
            </div>
            <p className="text-gray-900 font-semibold text-center text-base leading-relaxed">
              {card.question}
            </p>
            <p className="text-xs text-gray-400 mt-4">Tap to reveal answer</p>
          </div>

          {/* Back */}
          <div
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
            className="absolute inset-0 bg-[#4F46E5] rounded-2xl shadow-md flex flex-col items-center justify-center p-6"
          >
            <div className="text-xs font-semibold text-indigo-200 mb-3 uppercase tracking-wide">
              Answer
            </div>
            <p className="text-white font-semibold text-center text-base leading-relaxed">
              {card.answer}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} /> Previous
        </button>

        <button
          onClick={() => setFlipped((f) => !f)}
          className="text-sm text-[#4F46E5] hover:underline font-medium"
        >
          {flipped ? "Hide answer" : "Show answer"}
        </button>

        <button
          onClick={goNext}
          disabled={index === flashcards.length - 1}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#4F46E5] text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-5 flex-wrap">
        {flashcards.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setFlipped(false);
              setIndex(i);
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              i === index ? "bg-[#4F46E5] scale-125" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Regenerate */}
      <div className="text-center mt-6">
        <button
          onClick={generate}
          className="text-xs text-gray-400 hover:text-[#4F46E5] flex items-center gap-1 mx-auto"
        >
          <RotateCcw size={11} /> Regenerate Flashcards
        </button>
      </div>
    </div>
  );
}
