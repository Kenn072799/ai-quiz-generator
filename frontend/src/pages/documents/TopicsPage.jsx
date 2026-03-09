import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Sparkles,
  FileText,
  Layers,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import api from "../../services/api";

export default function TopicsPage() {
  const { documentId } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState("idle");
  const [topics, setTopics] = useState([]);
  const [documentName, setDocumentName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setState("extracting");
      try {
        const res = await api.get(`/topics/document/${documentId}`);
        setDocumentName(res.data.documentName);
        if (res.data.topics.length > 0) {
          setTopics(res.data.topics);
          setState("done");
        } else {
          await extractTopics();
        }
      } catch {
        await extractTopics();
      }
    };
    load();
  }, [documentId]);

  const extractTopics = async () => {
    setState("extracting");
    setError("");
    try {
      const res = await api.post(`/topics/extract/${documentId}`);
      setDocumentName(res.data.documentName);
      setTopics(res.data.topics);
      setState("done");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to extract topics. Please try again.",
      );
      setState("error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* â”€â”€ Back + breadcrumb â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => navigate("/documents")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors bg-white border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg"
        >
          <ArrowLeft size={14} /> Documents
        </button>
        {documentName && (
          <>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-500 flex items-center gap-1 truncate max-w-xs">
              <FileText size={13} /> {documentName}
            </span>
          </>
        )}
      </div>

      {/* â”€â”€ Step indicator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 font-semibold px-2.5 py-1 rounded-full">
            <CheckCircle2 size={11} /> Step 1: Upload
          </span>
          <span className="text-gray-300">/</span>
          <span className="flex items-center gap-1 bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded-full">
            Step 2: Pick a Topic
          </span>
          <span className="text-gray-300 hidden sm:block">/</span>
          <span className="hidden sm:flex items-center gap-1 text-gray-400 font-medium px-2.5 py-1">
            Step 3: Study & Quiz
          </span>
        </div>
      </div>

      {/* â”€â”€ Page title â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Choose a Topic</h1>
        <p className="text-gray-500 text-sm mt-1">
          The AI found these topics in your document. Pick one to start a quiz
          or review flashcards.
        </p>
      </div>

      {/* â”€â”€ Extracting state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {state === "extracting" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 gap-5"
        >
          <div className="relative">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center">
              <Sparkles size={34} className="text-indigo-500" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-200 border-t-indigo-500 animate-spin" />
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-800 text-lg">
              AI is reading your document...
            </p>
            <p className="text-sm text-gray-400 mt-1 max-w-xs">
              Identifying the main study topics. This usually takes a few
              seconds.
            </p>
          </div>
          <div className="flex gap-1.5 mt-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-indigo-300 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* â”€â”€ Error state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {state === "error" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-16 gap-4 text-center"
        >
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <AlertCircle size={28} className="text-red-500" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-lg">
              Could not extract topics
            </p>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">{error}</p>
          </div>
          <button
            onClick={extractTopics}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            <RefreshCw size={15} /> Try Again
          </button>
        </motion.div>
      )}

      {/* â”€â”€ Topics grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {state === "done" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">
                <Sparkles size={11} />
                {topics.length} topic{topics.length !== 1 ? "s" : ""} found
              </span>
            </div>
            <button
              onClick={extractTopics}
              className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
            >
              <RefreshCw size={12} /> Re-extract
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {topics.map((topic, i) => (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Topic number + name */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-9 h-9 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 leading-snug">
                        {topic.topicName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Click an action below to begin
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate(`/quiz/generate/${topic.id}`)}
                      className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                    >
                      <BookOpen size={15} />
                      Start Quiz
                    </button>
                    <button
                      onClick={() => navigate(`/flashcards/${topic.id}`)}
                      className="flex items-center justify-center gap-2 bg-violet-50 hover:bg-violet-100 text-violet-700 text-sm font-semibold py-2.5 rounded-xl transition-colors"
                    >
                      <Layers size={15} />
                      Flashcards
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Bottom hint */}
          <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
            <Sparkles size={16} className="text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-indigo-800">
                How to use these topics
              </p>
              <p className="text-xs text-indigo-600 mt-0.5">
                Tap <strong>Start Quiz</strong> to test your knowledge with
                AI-generated questions. Tap <strong>Flashcards</strong> to
                review key concepts quickly before the quiz.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
