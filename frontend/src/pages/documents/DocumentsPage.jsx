import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  ChevronRight,
  Sparkles,
  Layers,
} from "lucide-react";
import api from "../../services/api";

const ALLOWED_EXT = [".pdf", ".docx", ".txt"];
const MAX_SIZE_MB = 10;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileTypeTag({ name }) {
  const ext = name.split(".").pop().toUpperCase();
  const colors = {
    PDF: "bg-red-50 text-red-600",
    DOCX: "bg-blue-50 text-blue-600",
    TXT: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors[ext] ?? "bg-gray-100 text-gray-500"}`}
    >
      {ext}
    </span>
  );
}

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [replacingId, setReplacingId] = useState(null);

  const uploadInputRef = useRef(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDocuments = async () => {
    try {
      const res = await api.get("/documents");
      setDocuments(res.data);
    } catch {
      showToast("error", "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const validateFile = (file) => {
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXT.includes(ext))
      return "Only PDF, DOCX, and TXT files are allowed.";
    if (file.size > MAX_SIZE_MB * 1024 * 1024)
      return `File must be under ${MAX_SIZE_MB} MB.`;
    return null;
  };

  const handleUpload = async (file) => {
    const error = validateFile(file);
    if (error) {
      showToast("error", error);
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("success", "Document uploaded! Topics will be extracted.");
      await fetchDocuments();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Upload failed.");
    } finally {
      setUploading(false);
      if (uploadInputRef.current) uploadInputRef.current.value = "";
    }
  };

  const handleReplace = async (id, file) => {
    const error = validateFile(file);
    if (error) {
      showToast("error", error);
      return;
    }
    setReplacingId(id);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await api.put(`/documents/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("success", "Document replaced successfully!");
      await fetchDocuments();
    } catch (err) {
      showToast("error", err.response?.data?.message || "Replace failed.");
    } finally {
      setReplacingId(null);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      showToast("success", "Document deleted.");
    } catch {
      showToast("error", "Failed to delete document.");
    } finally {
      setDeletingId(null);
      setDeleteConfirm(null);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
        <p className="text-gray-500 text-sm mt-1">
          Upload your study materials. The AI will extract topics and generate
          quizzes for you.
        </p>
      </div>

      {/* â”€â”€ How it works steps â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
        {[
          {
            num: "1",
            icon: Upload,
            label: "Upload",
            desc: "Add a PDF, DOCX or TXT",
          },
          {
            num: "2",
            icon: Sparkles,
            label: "AI Extracts",
            desc: "Topics found automatically",
          },
          {
            num: "3",
            icon: BookOpen,
            label: "Study & Quiz",
            desc: "Take quizzes & flashcards",
          },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-2 sm:gap-3 bg-white border border-gray-100 rounded-xl p-3 sm:p-4 flex-1 shadow-sm">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                <s.icon size={16} className="text-indigo-600" />
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xs font-bold text-gray-900">{s.label}</div>
                <div className="text-xs text-gray-400 hidden sm:block">
                  {s.desc}
                </div>
              </div>
            </div>
            {i < 2 && (
              <ChevronRight
                size={16}
                className="text-gray-300 shrink-0 hidden sm:block"
              />
            )}
          </div>
        ))}
      </div>

      {/* â”€â”€ Upload zone â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !uploading && uploadInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all mb-8 ${
          dragging
            ? "border-indigo-500 bg-indigo-50 scale-[1.01]"
            : uploading
              ? "border-indigo-300 bg-indigo-50 cursor-default"
              : "border-gray-200 hover:border-indigo-400 hover:bg-gray-50"
        }`}
      >
        <input
          ref={uploadInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(e) =>
            e.target.files?.[0] && handleUpload(e.target.files[0])
          }
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-3 text-indigo-600">
            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
              <Loader2 size={28} className="animate-spin" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">
                Uploading your document...
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Please wait, this won't take long.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${dragging ? "bg-indigo-200" : "bg-indigo-50"}`}
            >
              <Upload size={26} className="text-indigo-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-base">
                {dragging ? "Drop it here!" : "Drag & drop your file here"}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                or click to browse your files
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {["PDF", "DOCX", "TXT"].map((ext) => (
                <span
                  key={ext}
                  className="text-xs font-semibold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full"
                >
                  {ext}
                </span>
              ))}
              <span className="text-xs text-gray-300">|</span>
              <span className="text-xs text-gray-400">Max 10 MB</span>
            </div>
          </div>
        )}
      </div>

      {/* â”€â”€ Document list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4 items-center"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded-full w-1/2" />
                <div className="h-3 bg-gray-100 rounded-full w-1/3" />
              </div>
              <div className="flex gap-2 shrink-0">
                <div className="h-8 w-24 bg-gray-100 rounded-lg" />
                <div className="h-8 w-20 bg-gray-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-2xl"
        >
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-indigo-400" />
          </div>
          <p className="font-semibold text-gray-800 text-lg">
            No documents yet
          </p>
          <p className="text-sm text-gray-400 mt-1 mb-5">
            Upload your first study material to get started.
          </p>
          <button
            onClick={() => uploadInputRef.current?.click()}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Upload size={15} /> Upload a Document
          </button>
        </motion.div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">
              {documents.length} document{documents.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {documents.map((doc) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Top row: icon + info + status */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                      <FileText size={22} className="text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 truncate">
                          {doc.fileName}
                        </p>
                        <FileTypeTag name={doc.fileName} />
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            doc.isProcessed
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {doc.isProcessed ? "Ready" : "Processing..."}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>{formatBytes(doc.fileSizeBytes)}</span>
                        <span className="text-gray-300">|</span>
                        <span>
                          {doc.topicCount}{" "}
                          {doc.topicCount === 1 ? "topic" : "topics"} found
                        </span>
                        <span className="text-gray-300">|</span>
                        <span>
                          Uploaded{" "}
                          {new Date(doc.uploadedAt).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Primary: Start Quiz */}
                    <button
                      onClick={() => navigate(`/topics/${doc.id}`)}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                    >
                      <BookOpen size={15} />
                      Start Quiz
                    </button>

                    {/* Secondary: Flashcards â€” only if topics exist */}
                    {doc.topicCount > 0 && (
                      <button
                        onClick={() => navigate(`/flashcards`)}
                        className="flex items-center gap-2 bg-violet-50 hover:bg-violet-100 text-violet-700 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                      >
                        <Layers size={15} />
                        Flashcards
                      </button>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Replace */}
                    <label
                      className={`cursor-pointer flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl transition-colors ${replacingId === doc.id ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      {replacingId === doc.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <RefreshCw size={13} />
                      )}
                      Replace
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        className="hidden"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleReplace(doc.id, e.target.files[0])
                        }
                      />
                    </label>

                    {/* Delete */}
                    <button
                      onClick={() => setDeleteConfirm(doc.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* â”€â”€ Delete confirmation modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">
                Delete this document?
              </h3>
              <p className="text-sm text-gray-500 mt-2 mb-5">
                This will permanently remove the document and all its extracted
                topics, quizzes, questions, and quiz history. This cannot be
                undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={!!deletingId}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {deletingId && <Loader2 size={14} className="animate-spin" />}
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* â”€â”€ Toast notification â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-50 ${
              toast.type === "success"
                ? "bg-emerald-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            {toast.message}
            <button
              onClick={() => setToast(null)}
              className="ml-1 opacity-80 hover:opacity-100"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
