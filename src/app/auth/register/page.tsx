"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    // Clear error on edit
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!/^\d{10}$/.test(form.phone.trim())) {
      newErrors.phone = "Phone must be exactly 10 digits";
    }
    if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          password: form.password,
        }),
      });

      let data: { error?: string; success?: boolean } = {};
      try {
        data = await res.json();
      } catch {
        // non-JSON response
      }

      if (!res.ok) {
        if (res.status === 503) {
          toast.error("⚠️ Database not ready. Please run: npx prisma db push && npm run seed", { duration: 6000 });
        } else if (res.status === 409) {
          setErrors({ email: "This email is already registered" });
          toast.error("Email already registered");
        } else {
          toast.error(data.error ?? "Registration failed. Please try again.");
        }
        return;
      }

      toast.success("Account created! Logging you in...");

      // Auto-login after registration
      const loginResult = await signIn("credentials", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      });

      if (loginResult?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        router.push("/auth/login");
      }
    } catch (err) {
      console.error("Register error:", err);
      toast.error("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { label: "Full Name", key: "name", type: "text", placeholder: "Rahul Kumar", autoComplete: "name" },
    { label: "Email Address", key: "email", type: "email", placeholder: "rahul@example.com", autoComplete: "email" },
    { label: "Phone Number (10 digits)", key: "phone", type: "tel", placeholder: "9876543210", autoComplete: "tel" },
    { label: "Password (min. 6 chars)", key: "password", type: "password", placeholder: "••••••••", autoComplete: "new-password" },
    { label: "Confirm Password", key: "confirmPassword", type: "password", placeholder: "••••••••", autoComplete: "new-password" },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create Account</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
        Register for MITChoice Engineering Admissions 2025
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {fields.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label}
            </label>
            <input
              type={field.type}
              autoComplete={field.autoComplete}
              value={form[field.key as keyof typeof form]}
              onChange={(e) => update(field.key, e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition ${
                errors[field.key]
                  ? "border-red-400 focus:ring-red-300"
                  : "border-gray-300 dark:border-gray-600 focus:ring-[#0D47A1]"
              }`}
              placeholder={field.placeholder}
            />
            {errors[field.key] && (
              <p className="text-red-500 text-xs mt-1">{errors[field.key]}</p>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FFC107] hover:bg-[#FFB300] disabled:opacity-70 disabled:cursor-not-allowed text-gray-900 font-bold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-base"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Already registered?{" "}
          <Link href="/auth/login" className="text-[#0D47A1] dark:text-blue-400 font-semibold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
