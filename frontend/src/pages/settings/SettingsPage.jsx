import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Globe,
  GraduationCap,
  CheckCircle2,
  Loader2,
  User,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const LANGUAGES = ["English", "Tagalog"];
const LEVELS = ["Elementary", "High School", "College"];

const LEVEL_DESC = {
  Elementary: "Simple vocabulary, basic concept questions.",
  "High School": "Moderate vocabulary, conceptual understanding.",
  College: "Deeper reasoning and advanced explanations.",
};

export default function SettingsPage() {
  const { user, updateSettings } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [language, setLanguage] = useState(user?.language ?? "English");
  const [level, setLevel] = useState(user?.educationLevel ?? "College");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const isDirty =
    name !== (user?.name ?? "") ||
    language !== (user?.language ?? "English") ||
    level !== (user?.educationLevel ?? "College");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await api.put("/auth/settings", {
        name,
        preferredLanguage: language,
        educationLevel: level,
      });
      updateSettings(res.data.token);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="text-[#4F46E5]" size={24} />
          Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          These settings affect how the AI generates quizzes and explanations
          for you.
        </p>
      </div>

      <div className="space-y-6">
        {/* Display Name */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-[#4F46E5]" />
            <h2 className="font-semibold text-gray-900">Display Name</h2>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            placeholder="Enter your name"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-2">
            This name will be shown on your dashboard instead of your email.
          </p>
        </div>

        {/* Language */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={18} className="text-[#4F46E5]" />
            <h2 className="font-semibold text-gray-900">Preferred Language</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                  language === lang
                    ? "border-[#4F46E5] bg-indigo-50 text-[#4F46E5]"
                    : "border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-gray-50"
                }`}
              >
                {lang === "English" ? "🇺🇸 English" : "🇵🇭 Tagalog"}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            All quiz questions and explanations will use this language.
          </p>
        </div>

        {/* Education Level */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap size={18} className="text-[#4F46E5]" />
            <h2 className="font-semibold text-gray-900">Education Level</h2>
          </div>
          <div className="space-y-3">
            {LEVELS.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                  level === lvl
                    ? "border-[#4F46E5] bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    level === lvl
                      ? "border-[#4F46E5] bg-[#4F46E5]"
                      : "border-gray-300"
                  }`}
                >
                  {level === lvl && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      level === lvl ? "text-[#4F46E5]" : "text-gray-800"
                    }`}
                  >
                    {lvl}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {LEVEL_DESC[lvl]}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Current values display */}
        <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-500 flex items-center justify-between">
          <span>
            Current:{" "}
            <span className="font-medium text-gray-700">{user?.language}</span>{" "}
            ·{" "}
            <span className="font-medium text-gray-700">
              {user?.educationLevel}
            </span>
          </span>
          {isDirty && (
            <span className="text-amber-600 font-medium">Unsaved changes</span>
          )}
        </div>

        {/* Error */}
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        {/* Save button */}
        <motion.button
          onClick={handleSave}
          disabled={saving || !isDirty}
          whileTap={{ scale: 0.97 }}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
            saved
              ? "bg-emerald-500 text-white"
              : isDirty
                ? "bg-[#4F46E5] text-white hover:bg-indigo-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle2 size={16} /> Saved!
            </>
          ) : (
            "Save Settings"
          )}
        </motion.button>
      </div>
    </div>
  );
}
