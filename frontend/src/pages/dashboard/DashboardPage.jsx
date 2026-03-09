import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  TrendingUp,
  FileText,
  BookOpen,
  ChevronRight,
  Zap,
  Star,
  Upload,
  Target,
  Layers,
  ArrowRight,
  Trophy,
  Flame,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getMotivation(avg, completed) {
  if (completed === 0)
    return {
      text: "Let's start your learning journey!",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    };
  if (avg >= 90)
    return {
      text: "Outstanding! You're crushing it!",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    };
  if (avg >= 75)
    return {
      text: "Great work! Keep the momentum going!",
      color: "text-amber-600",
      bg: "bg-amber-50",
    };
  if (avg >= 60)
    return {
      text: "Good effort! A bit more practice goes a long way!",
      color: "text-sky-600",
      bg: "bg-sky-50",
    };
  return {
    text: "Don't give up! Review your weak topics to improve.",
    color: "text-rose-600",
    bg: "bg-rose-50",
  };
}

function ScoreBadge({ pct }) {
  const color =
    pct >= 70
      ? "bg-emerald-100 text-emerald-700"
      : pct >= 50
        ? "bg-amber-100 text-amber-700"
        : "bg-rose-100 text-rose-700";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      {pct}%
    </span>
  );
}

const FADE = {
  hidden: { opacity: 0, y: 18 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.35 },
  }),
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard")
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const firstName = (
    user?.name?.trim() ||
    user?.email?.split("@")[0] ||
    "Student"
  ).split(" ")[0];
  const completed = data?.quizzesCompleted ?? 0;
  const avg = data?.averageScore ?? 0;
  const motivation = getMotivation(avg, completed);
  const isNewUser = completed === 0 && (data?.documentsUploaded ?? 0) === 0;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="space-y-2">
            <div className="h-3.5 w-24 bg-gray-200 rounded-full" />
            <div className="h-8 w-44 bg-gray-200 rounded-full" />
            <div className="h-6 w-56 bg-gray-100 rounded-full" />
          </div>
          <div className="flex gap-2">
            <div className="h-7 w-20 bg-gray-100 rounded-full" />
            <div className="h-7 w-16 bg-gray-100 rounded-full" />
          </div>
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-xl p-4 sm:p-5 space-y-3"
            >
              <div className="w-9 h-9 bg-gray-200 rounded-lg" />
              <div className="h-8 w-14 bg-gray-200 rounded-lg" />
              <div className="h-3 w-24 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>

        {/* Two-panel skeleton */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3"
            >
              <div className="h-5 w-36 bg-gray-200 rounded-full" />
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-gray-100 rounded-full w-3/4" />
                    <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                  </div>
                  <div className="h-6 w-12 bg-gray-100 rounded-full shrink-0" />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Quick actions skeleton */}
        <div className="space-y-3">
          <div className="h-5 w-28 bg-gray-200 rounded-full" />
          <div className="grid sm:grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Quizzes Completed",
      value: completed,
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      bg: "bg-linear-to-br from-emerald-50 to-teal-50",
      border: "border-emerald-100",
    },
    {
      label: "Average Score",
      value: completed > 0 ? `${avg}%` : "--",
      icon: TrendingUp,
      iconColor: "text-indigo-600",
      bg: "bg-linear-to-br from-indigo-50 to-violet-50",
      border: "border-indigo-100",
    },
    {
      label: "Documents",
      value: data?.documentsUploaded ?? 0,
      icon: FileText,
      iconColor: "text-amber-600",
      bg: "bg-linear-to-br from-amber-50 to-orange-50",
      border: "border-amber-100",
    },
    {
      label: "Topics Studied",
      value: data?.topicsStudied ?? 0,
      icon: BookOpen,
      iconColor: "text-sky-600",
      bg: "bg-linear-to-br from-sky-50 to-cyan-50",
      border: "border-sky-100",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
      >
        <div>
          <p className="text-sm text-gray-500 font-medium">{getGreeting()},</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-0.5">
            {firstName}
          </h1>
          <div
            className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-semibold ${motivation.bg} ${motivation.color}`}
          >
            <Flame size={13} />
            {motivation.text}
          </div>
        </div>

        {/* Education level + language badges */}
        <div className="flex items-center gap-2 flex-wrap sm:justify-end shrink-0">
          {user?.educationLevel && (
            <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-indigo-100">
              <Star size={11} />
              {user.educationLevel}
            </span>
          )}
          {user?.language && (
            <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200">
              {user.language === "Tagalog" ? "PH" : "EN"} {user.language}
            </span>
          )}
        </div>
      </motion.div>

      {/* â”€â”€ Onboarding for new users â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {isNewUser && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-linear-to-br from-indigo-500 to-violet-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center gap-2 mb-1">
            <Zap size={18} className="text-yellow-300" />
            <span className="font-bold text-lg">Get started in 3 steps</span>
          </div>
          <p className="text-indigo-100 text-sm mb-5">
            Upload a document, select a topic, and take your first quiz!
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              {
                num: "1",
                icon: Upload,
                title: "Upload Document",
                desc: "PDF, DOCX, or TXT",
                path: "/documents",
              },
              {
                num: "2",
                icon: Target,
                title: "Select a Topic",
                desc: "AI extracts topics for you",
                path: "/documents",
              },
              {
                num: "3",
                icon: CheckCircle2,
                title: "Take a Quiz",
                desc: "Test your knowledge",
                path: "/documents",
              },
            ].map((step) => (
              <button
                key={step.num}
                onClick={() => navigate(step.path)}
                className="flex items-start gap-3 bg-white/15 hover:bg-white/25 transition-colors rounded-xl p-4 text-left"
              >
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                  <step.icon size={16} className="text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{step.title}</div>
                  <div className="text-indigo-200 text-xs mt-0.5">
                    {step.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => navigate("/documents")}
            className="mt-4 flex items-center gap-2 bg-white text-indigo-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors shadow"
          >
            <Upload size={15} />
            Upload your first document
            <ArrowRight size={15} />
          </button>
        </motion.div>
      )}

      {/* â”€â”€ Stats grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={FADE}
            className={`${s.bg} rounded-xl p-4 sm:p-5 border ${s.border} shadow-sm`}
          >
            <div className="w-9 h-9 bg-white/70 rounded-lg flex items-center justify-center mb-3 shadow-sm">
              <s.icon size={18} className={s.iconColor} />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-none">
              {s.value}
            </div>
            <div className="text-xs text-gray-500 mt-1.5 font-medium">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* â”€â”€ Two-column section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        {/* Weak topics */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={FADE}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Target size={16} className="text-rose-500" />
              Topics to Improve
            </h2>
            {(data?.weakTopics?.length ?? 0) > 0 && (
              <span className="text-xs bg-rose-50 text-rose-600 font-semibold px-2 py-0.5 rounded-full">
                {data.weakTopics.length} topic
                {data.weakTopics.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {data?.weakTopics?.length > 0 ? (
            <div className="space-y-2">
              {data.weakTopics.slice(0, 5).map((t) => (
                <div
                  key={t.topicId}
                  className="flex items-center justify-between gap-3 group rounded-xl p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">
                      {t.topicName}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {t.documentName}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <ScoreBadge pct={t.bestPercentage} />
                    <button
                      onClick={() => navigate(`/flashcards/${t.topicId}`)}
                      className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Layers size={11} />
                      Study
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                <Trophy size={22} className="text-emerald-500" />
              </div>
              <p className="text-sm font-semibold text-gray-700">
                {completed > 0
                  ? "No weak topics -- great work!"
                  : "No quiz data yet"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {completed > 0
                  ? "Keep taking quizzes to stay sharp."
                  : "Take your first quiz to see results here."}
              </p>
            </div>
          )}
        </motion.div>

        {/* Recent activity */}
        <motion.div
          custom={5}
          initial="hidden"
          animate="visible"
          variants={FADE}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500" />
              Recent Activity
            </h2>
            {(data?.recentAttempts?.length ?? 0) > 0 && (
              <button
                onClick={() => navigate("/quizzes")}
                className="text-xs text-indigo-600 hover:underline font-medium flex items-center gap-0.5"
              >
                See all <ChevronRight size={12} />
              </button>
            )}
          </div>

          {data?.recentAttempts?.length > 0 ? (
            <div className="space-y-2">
              {data.recentAttempts.slice(0, 5).map((a) => {
                const pct =
                  a.totalQuestions > 0
                    ? Math.round((a.score / a.totalQuestions) * 100)
                    : 0;
                return (
                  <div
                    key={a.attemptId}
                    className="flex items-center gap-3 rounded-xl p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        pct >= 70
                          ? "bg-emerald-400"
                          : pct >= 50
                            ? "bg-amber-400"
                            : "bg-rose-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">
                        {a.topicName}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(a.completedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <ScoreBadge pct={pct} />
                      <span className="text-xs text-gray-400">
                        {a.score}/{a.totalQuestions}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
                <BookOpen size={22} className="text-indigo-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700">
                No quizzes taken yet
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Complete a quiz to see your activity here.
              </p>
              <button
                onClick={() => navigate("/documents")}
                className="mt-3 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors"
              >
                Get started
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* â”€â”€ Quick actions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <motion.div custom={6} initial="hidden" animate="visible" variants={FADE}>
        <h2 className="font-bold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            {
              icon: Upload,
              label: "Upload Document",
              desc: "Add new study material",
              path: "/documents",
              bg: "bg-indigo-600",
              hover: "hover:bg-indigo-700",
            },
            {
              icon: TrendingUp,
              label: "View Progress",
              desc: "Track your improvement",
              path: "/progress",
              bg: "bg-emerald-600",
              hover: "hover:bg-emerald-700",
            },
            {
              icon: Layers,
              label: "Review Flashcards",
              desc: "Quick topic review",
              path: "/flashcards",
              bg: "bg-violet-600",
              hover: "hover:bg-violet-700",
            },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className={`flex items-center gap-3 ${action.bg} ${action.hover} text-white rounded-xl px-4 py-4 text-left transition-colors shadow-sm group`}
            >
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                <action.icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{action.label}</div>
                <div className="text-white/70 text-xs mt-0.5">
                  {action.desc}
                </div>
              </div>
              <ArrowRight
                size={16}
                className="text-white/60 group-hover:text-white/90 shrink-0 transition-colors"
              />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
