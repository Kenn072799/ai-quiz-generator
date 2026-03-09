import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Mail,
  Loader2,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [devResetLink, setDevResetLink] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/forgot-password", { email });
      if (res.data.devToken) {
        const params = new URLSearchParams({ token: res.data.devToken, email });
        setDevResetLink(`/reset-password?${params.toString()}`);
      }
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#4F46E5] text-white p-3 rounded-2xl mb-3">
            <BookOpen size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            AI Quiz Generator
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {!sent ? (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Forgot password?
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Enter your email address and we&apos;ll send you a reset link.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      required
                      placeholder="you@email.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4F46E5] hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-[#22C55E] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Check your email
              </h2>
              <p className="text-gray-500 text-sm">
                If an account exists for{" "}
                <span className="font-medium text-gray-700">{email}</span>, a
                password reset link has been sent.
              </p>
              {devResetLink && (
                <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle
                      size={15}
                      className="text-amber-600 shrink-0"
                    />
                    <p className="text-xs font-semibold text-amber-700">
                      Dev Mode - No email sent
                    </p>
                  </div>
                  <p className="text-xs text-amber-600 mb-2">
                    Click the link below to reset your password:
                  </p>
                  <Link
                    to={devResetLink}
                    className="text-xs text-[#4F46E5] font-medium hover:underline break-all"
                  >
                    Reset Password Link
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-[#4F46E5] hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
