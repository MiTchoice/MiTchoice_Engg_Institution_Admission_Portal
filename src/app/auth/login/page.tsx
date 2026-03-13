"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Please enter your email and password");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        const msg =
          result.error.includes("No account") ? "No account found with this email" :
          result.error.includes("Incorrect") ? "Incorrect password" :
          result.error.includes("Database") ? "Service unavailable. Please try again." :
          "Invalid email or password";
        setError(msg);
        toast.error(msg);
      } else if (result?.ok) {
        toast.success("Welcome back! 👋");
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please check your connection.");
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome Back</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
        Sign in to your MITChoice account
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => { setForm({ ...form, email: e.target.value }); setError(""); }}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0D47A1] transition"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => { setForm({ ...form, password: e.target.value }); setError(""); }}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0D47A1] transition"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0D47A1] hover:bg-[#0a3d8f] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-base"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          New student?{" "}
          <Link href="/auth/register" className="text-[#0D47A1] dark:text-blue-400 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 rounded-lg text-xs text-gray-600 dark:text-gray-400 space-y-1">
        <p><strong>Demo student:</strong> demo@mitchoice.com / student123</p>
        <p><strong>Admin:</strong> admin@mitchoice.com / admin123</p>
      </div>
    </div>
  );
}
