import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Layers,
  TrendingUp,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Settings,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FileText, label: "My Documents", path: "/documents" },
  { icon: BookOpen, label: "Quizzes", path: "/quizzes" },
  { icon: Layers, label: "Flashcards", path: "/flashcards" },
  { icon: TrendingUp, label: "Progress", path: "/progress" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

function NavLinks({ onNavigate }) {
  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map(({ icon: Icon, label, path }) => (
        <NavLink
          key={path}
          to={path}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive
                ? "bg-indigo-50 text-[#4F46E5]"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const close = () => setMobileOpen(false);

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 shrink-0">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-8 h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">
            StudyAI
          </span>
        </div>
        <NavLinks onNavigate={undefined} />
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar (visible on mobile, part of column flow) ─────── */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 z-30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#4F46E5] rounded-lg flex items-center justify-center">
            <GraduationCap size={15} className="text-white" />
          </div>
          <span className="font-bold text-gray-900">StudyAI</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* ── Mobile drawer (fixed overlay) ───────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={close}
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-xl md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#4F46E5] rounded-lg flex items-center justify-center">
                    <GraduationCap size={15} className="text-white" />
                  </div>
                  <span className="font-bold text-gray-900">StudyAI</span>
                </div>
                <button
                  onClick={close}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>
              <NavLinks onNavigate={close} />
              <div className="px-3 py-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    close();
                    handleLogout();
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
