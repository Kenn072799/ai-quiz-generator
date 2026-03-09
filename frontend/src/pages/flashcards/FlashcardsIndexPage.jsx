import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layers, FileText, ChevronRight } from "lucide-react";
import api from "../../services/api";

export default function FlashcardsIndexPage() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load all user documents and their topics to let them pick
  useEffect(() => {
    api
      .get("/documents")
      .then(async (docsRes) => {
        const docs = docsRes.data;
        // Load topics for each document
        const topicResults = await Promise.allSettled(
          docs.map((d) => api.get(`/topics/document/${d.id}`)),
        );
        const allTopics = [];
        topicResults.forEach((r) => {
          if (r.status === "fulfilled" && r.value.data.topics?.length > 0) {
            allTopics.push(...r.value.data.topics);
          }
        });
        setTopics(allTopics);
      })
      .catch(() => setTopics([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <div className="h-7 w-36 bg-gray-200 rounded-full" />
          <div className="h-4 w-64 bg-gray-100 rounded-full" />
        </div>
        {/* Topic cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 bg-gray-100 rounded-lg" />
                <div className="h-5 w-16 bg-gray-100 rounded-full" />
              </div>
              <div className="h-4 bg-gray-200 rounded-full w-3/4" />
              <div className="h-3 bg-gray-100 rounded-full w-1/2" />
              <div className="h-9 bg-gray-100 rounded-lg w-full" />
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
          <Layers className="text-[#4F46E5]" size={24} />
          Flashcards
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Select a topic to start reviewing with flashcards.
        </p>
      </div>

      {topics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
            <Layers size={26} className="text-[#4F46E5]" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-gray-800">No topics found</p>
            <p className="text-sm text-gray-500 mt-1">
              Upload a document and extract topics first.
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
          {topics.map((topic, i) => (
            <motion.button
              key={topic.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => navigate(`/flashcards/${topic.id}`)}
              className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:border-indigo-200 hover:shadow-md transition-all text-left group"
            >
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                <Layers size={18} className="text-[#4F46E5]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm truncate">
                  {topic.topicName}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <FileText size={11} className="text-gray-400" />
                  <p className="text-xs text-gray-400 truncate">
                    {topic.documentName}
                  </p>
                </div>
              </div>
              <ChevronRight
                size={16}
                className="text-gray-300 group-hover:text-[#4F46E5] transition-colors shrink-0"
              />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
