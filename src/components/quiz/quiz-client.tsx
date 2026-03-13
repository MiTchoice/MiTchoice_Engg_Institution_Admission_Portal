"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getCategoryLabel, QUIZ_CATEGORIES } from "@/lib/utils";

interface Question {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  category: string;
  difficulty: string;
}

interface QuizData {
  questions: Question[];
  answers: Record<string, string>;
  startedAt: string;
}

const DURATION_SECONDS = 60 * 60; // 60 minutes for 25 questions
const OPTIONS = ["A", "B", "C", "D"] as const;

const CATEGORY_COLORS: Record<string, string> = {
  ENGLISH:            "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  NUMERICAL_APTITUDE: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
  GENERAL_AWARENESS:  "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  BASIC_ENGINEERING:  "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300",
  MATHEMATICS:        "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
};

export function QuizClient() {
  const router = useRouter();
  const [data, setData]         = useState<QuizData | null>(null);
  const [answers, setAnswers]   = useState<Record<string, string>>({});
  const [current, setCurrent]   = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION_SECONDS);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  // ── Load quiz ──────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/quiz")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { toast.error(d.error); router.push("/dashboard"); return; }
        setData(d);
        setAnswers(d.answers ?? {});
        // Calculate remaining time from startedAt
        const elapsed = Math.floor((Date.now() - new Date(d.startedAt).getTime()) / 1000);
        setTimeLeft(Math.max(0, DURATION_SECONDS - elapsed));
        setLoading(false);
      })
      .catch(() => { toast.error("Failed to load quiz"); router.push("/dashboard"); });
  }, [router]);

  // ── Autosave every 15 seconds ──────────────────────────────────
  const saveAnswers = useCallback(async (ans: Record<string, string>) => {
    try {
      await fetch("/api/quiz/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: ans }),
      });
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (!data) return;
    saveTimer.current = setInterval(() => saveAnswers(answers), 15000);
    return () => { if (saveTimer.current) clearInterval(saveTimer.current); };
  }, [data, answers, saveAnswers]);

  // ── Timer countdown ────────────────────────────────────────────
  useEffect(() => {
    if (!data || loading) return;
    if (timeLeft <= 0) { handleSubmit(true); return; }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, loading, timeLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const timerColor =
    timeLeft < 300 ? "text-red-500 animate-pulse" :
    timeLeft < 600 ? "text-amber-500" : "text-green-600 dark:text-green-400";

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async (autoSubmit = false) => {
    if (submitting) return;
    setSubmitting(true);
    setShowConfirm(false);
    const toastId = toast.loading(autoSubmit ? "Time up! Submitting..." : "Submitting quiz...");
    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const result = await res.json();
      if (result.error) {
        toast.error(result.error, { id: toastId });
        setSubmitting(false);
      } else {
        toast.success("Quiz submitted!", { id: toastId });
        router.push("/score-card");
      }
    } catch {
      toast.error("Submission failed. Try again.", { id: toastId });
      setSubmitting(false);
    }
  };

  const select = (qId: string, opt: string) => {
    const updated = { ...answers, [qId]: opt };
    setAnswers(updated);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-12 h-12 border-4 border-[#0D47A1]/20 border-t-[#0D47A1] rounded-full animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading your quiz…</p>
      </div>
    );
  }

  if (!data) return null;

  const questions = data.questions;
  const q = questions[current];
  const answered = Object.keys(answers).filter((k) => answers[k]).length;
  const unanswered = questions.length - answered;

  // Group questions by category for palette header
  const categoryProgress = QUIZ_CATEGORIES.map((cat) => {
    const qs = questions.filter((q) => q.category === cat.name);
    const ans = qs.filter((q) => answers[q.id]).length;
    return { ...cat, total: qs.length, answered: ans };
  });

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-8">
      {/* ── Top bar ── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between gap-4 flex-wrap shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0D47A1] rounded-xl flex items-center justify-center text-white font-black text-sm">
            ⚙️
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm">MITChoice Entrance Test 2025</p>
            <p className="text-gray-400 text-xs">25 Questions · 5 Categories · 60 Minutes</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress */}
          <div className="hidden sm:flex flex-col items-center">
            <p className="text-xs text-gray-500">Progress</p>
            <p className="font-black text-[#0D47A1] dark:text-blue-400">{answered}/{questions.length}</p>
          </div>

          {/* Timer */}
          <div className={`flex flex-col items-center font-mono font-black text-xl ${timerColor}`}>
            {formatTime(timeLeft)}
            <span className="text-xs font-normal text-gray-400">remaining</span>
          </div>

          {/* Palette toggle (mobile) */}
          <button
            onClick={() => setShowPalette((p) => !p)}
            className="sm:hidden px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-semibold"
          >
            Grid
          </button>

          {/* Submit button */}
          <button
            onClick={() => setShowConfirm(true)}
            disabled={submitting}
            className="px-4 py-2 bg-[#FFC107] hover:bg-[#FFB300] text-gray-900 rounded-xl font-bold text-sm disabled:opacity-70 transition"
          >
            Submit Quiz
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_240px] gap-4">
        {/* ── Question panel ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {/* Category badge + Q number */}
          <div className="px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${CATEGORY_COLORS[q.category] ?? "bg-gray-100 text-gray-600"}`}>
                {getCategoryLabel(q.category)}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                q.difficulty === "hard" ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400" :
                q.difficulty === "medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400" :
                "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
              }`}>
                {q.difficulty}
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-400">Q {current + 1} of {questions.length}</span>
          </div>

          {/* Question text */}
          <div className="px-6 py-5">
            <p className="text-gray-900 dark:text-white font-semibold text-base leading-relaxed">
              {q.text}
            </p>
          </div>

          {/* Options */}
          <div className="px-6 pb-6 space-y-3">
            {OPTIONS.map((opt) => {
              const optText = q[`option${opt}` as keyof Question] as string;
              const selected = answers[q.id] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => select(q.id, opt)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-150 group ${
                    selected
                      ? "border-[#0D47A1] bg-[#0D47A1]/5 dark:bg-[#0D47A1]/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-[#0D47A1]/50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <span className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center text-sm font-black transition-colors ${
                    selected
                      ? "bg-[#0D47A1] text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-[#0D47A1]/10"
                  }`}>
                    {opt}
                  </span>
                  <span className={`text-sm leading-snug ${selected ? "text-[#0D47A1] dark:text-blue-300 font-semibold" : "text-gray-700 dark:text-gray-300"}`}>
                    {optText}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Prev / Next navigation */}
          <div className="px-6 pb-5 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              disabled={current === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-sm disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              ← Previous
            </button>

            {/* Clear selection */}
            {answers[q.id] && (
              <button
                onClick={() => {
                  const updated = { ...answers };
                  delete updated[q.id];
                  setAnswers(updated);
                }}
                className="text-xs text-red-400 hover:text-red-600 transition font-medium"
              >
                Clear answer
              </button>
            )}

            <button
              onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
              disabled={current === questions.length - 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D47A1] text-white font-semibold text-sm disabled:opacity-40 hover:bg-[#0a3d8f] transition"
            >
              Next →
            </button>
          </div>
        </div>

        {/* ── Right panel: palette + category progress ── */}
        <div className={`space-y-4 ${showPalette ? "block" : "hidden sm:block"}`}>
          {/* Category progress */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Category Progress</p>
            <div className="space-y-2">
              {categoryProgress.map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{cat.label}</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">{cat.answered}/{cat.total}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0D47A1] rounded-full transition-all duration-300"
                      style={{ width: cat.total > 0 ? `${(cat.answered / cat.total) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Question palette */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Question Palette</p>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => { setCurrent(idx); setShowPalette(false); }}
                  className={`w-full aspect-square rounded-lg text-xs font-bold transition-all ${
                    idx === current
                      ? "bg-[#FFC107] text-gray-900 ring-2 ring-[#FFC107]/50 scale-110"
                      : answers[item.id]
                      ? "bg-[#0D47A1] text-white hover:bg-[#0a3d8f]"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                  title={`Q${idx + 1}: ${getCategoryLabel(item.category)}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            {/* Legend */}
            <div className="mt-3 space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-[#FFC107] inline-block" /> Current
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-[#0D47A1] inline-block" /> Answered
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 inline-block" /> Not answered
              </div>
            </div>
          </div>

          {/* Score info */}
          <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300 space-y-1 leading-relaxed">
            <p className="font-bold">📊 Marking Scheme</p>
            <p>✅ Correct: <strong>+4 marks</strong></p>
            <p>❌ Wrong: <strong>−1 mark</strong></p>
            <p>⬜ Unanswered: <strong>0 marks</strong></p>
            <p className="border-t border-blue-200 dark:border-blue-800 pt-1 mt-1">Max: <strong>25 × 4 = 100 marks</strong></p>
          </div>
        </div>
      </div>

      {/* ── Confirm submit modal ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="text-3xl mb-3 text-center">📋</div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white text-center mb-4">Submit Quiz?</h3>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-green-50 dark:bg-green-950/50 border border-green-100 dark:border-green-900 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-green-600">{answered}</p>
                <p className="text-xs text-green-700 dark:text-green-400 font-medium">Answered</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-amber-600">{unanswered}</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Unanswered</p>
              </div>
            </div>
            {unanswered > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 text-center mb-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg p-2">
                ⚠️ You have {unanswered} unanswered question{unanswered > 1 ? "s" : ""}. Unanswered questions score 0.
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Review More
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-[#0D47A1] text-white rounded-xl font-bold text-sm hover:bg-[#0a3d8f] disabled:opacity-70 transition"
              >
                {submitting ? "Submitting…" : "Submit Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
