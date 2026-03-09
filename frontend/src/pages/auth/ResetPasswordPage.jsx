import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center max-w-sm w-full">
          <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Invalid Reset Link
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            This reset link is missing required information. Please request a
            new one.
          </p>
          <Link
            to="/forgot-password"
            className="text-[#4F46E5] font-medium hover:underline text-sm"
          >
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/reset-password", {
        token,
        email,
        newPassword: password,
      });
      setDone(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Reset failed. The link may have expired.",
      );
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
          {!done ? (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Set new password
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Resetting password for{" "}
                <span className="font-medium text-gray-700">{email}</span>
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      required
                      minLength={8}
                      placeholder="Min. 8 characters"
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => {
                        setConfirm(e.target.value);
                        setError("");
                      }}
                      required
                      minLength={8}
                      placeholder="Repeat password"
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
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-sm text-[#4F46E5] hover:underline"
                >
                  Back to Sign In
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-[#22C55E] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Password Reset!
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Your password has been updated. You can now sign in with your
                new password.
              </p>
              <Link
                to="/login"
                className="w-full inline-block bg-[#4F46E5] hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm text-center"
              >
                Go to Sign In
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
