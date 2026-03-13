"use client";

import { useState } from "react";
import Link from "next/link";
import { getBranchFullName, getCategoryLabel, QUIZ_CATEGORIES, MAX_SCORE, DEVELOPER } from "@/lib/utils";
import toast from "react-hot-toast";

interface Props {
  student: { id: string; name: string; email: string; phone: string };
  score: {
    correct: number; incorrect: number; attempted: number;
    netScore: number; percentage: number;
  };
  eligibleBranches: string[];
  admissionStatus: "eligible" | "bsc" | "disqualified";
  quizDate: string;
}

export function ScoreCardClient({ student, score, eligibleBranches, admissionStatus, quizDate }: Props) {
  const [opening, setOpening] = useState(false);

  function openScoreCard() {
    setOpening(true);
    window.open("/api/pdf/score-card", "_blank");
    toast.success("Score card opened — use Ctrl+P / ⌘P to save as PDF");
    setTimeout(() => setOpening(false), 1500);
  }

  const getGrade = (p: number) => {
    if (p >= 90) return { grade: "A+", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/50" };
    if (p >= 80) return { grade: "A",  color: "text-green-600",   bg: "bg-green-50 dark:bg-green-950/50" };
    if (p >= 70) return { grade: "B+", color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/50" };
    if (p >= 60) return { grade: "B",  color: "text-indigo-600",  bg: "bg-indigo-50 dark:bg-indigo-950/50" };
    if (p >= 50) return { grade: "C+", color: "text-yellow-600",  bg: "bg-yellow-50 dark:bg-yellow-950/50" };
    if (p >= 40) return { grade: "C",  color: "text-orange-600",  bg: "bg-orange-50 dark:bg-orange-950/50" };
    return { grade: "F", color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/50" };
  };

  const gradeInfo = getGrade(score.percentage);

  if (admissionStatus === "disqualified") {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="text-6xl mb-6">😔</div>
        <h1 className="text-3xl font-black text-red-600 mb-4">Sorry, {student.name}</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
          Your score of <strong>{score.netScore.toFixed(0)}/{MAX_SCORE}</strong> ({score.percentage.toFixed(1)}%) is below the minimum threshold of <strong>35%</strong>.
        </p>
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-8">
          <p className="text-red-700 dark:text-red-300 font-medium">
            Unfortunately you are not eligible for admission this year. Prepare well and apply again next year.
          </p>
        </div>
        <Link href="/dashboard" className="inline-block mt-4 px-6 py-3 bg-[#0D47A1] text-white rounded-xl font-semibold hover:bg-[#0a3d8f] transition">
          ← Back to Dashboard
        </Link>
        <p className="mt-8 text-xs text-gray-400">
          Developed by {DEVELOPER.name} · {DEVELOPER.degree} · {DEVELOPER.institution}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Score Card</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">MITChoice Engineering Entrance Test 2025 · 25 Questions</p>
        </div>
        <button
          onClick={openScoreCard}
          disabled={opening}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0D47A1] text-white rounded-xl font-semibold hover:bg-[#0a3d8f] disabled:opacity-70 transition-all"
        >
          {opening ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Opening…</>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Score Card
            </>
          )}
        </button>
      </div>

      {/* Main card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-[#0D47A1] to-[#1976D2] p-6 text-white">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <p className="text-blue-200 text-xs mb-1 font-medium uppercase tracking-wide">MITChoice Engineering Institution</p>
              <h2 className="text-2xl font-black leading-tight">{student.name}</h2>
              <p className="text-blue-200 text-sm mt-1">{student.email}</p>
              {student.phone && <p className="text-blue-200 text-sm">{student.phone}</p>}
              <p className="text-blue-300 text-xs mt-2">📅 Test Date: {quizDate}</p>
            </div>
            <div className={`px-5 py-4 ${gradeInfo.bg} rounded-2xl text-center min-w-[86px]`}>
              <p className={`text-5xl font-black leading-none ${gradeInfo.color}`}>{gradeInfo.grade}</p>
              <p className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-wide">Grade</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Score stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Net Score",   value: `${score.netScore.toFixed(0)}/${MAX_SCORE}`, color: "text-[#0D47A1]" },
              { label: "Percentage",  value: `${score.percentage.toFixed(1)}%`,           color: "text-purple-600" },
              { label: "Correct",     value: String(score.correct),                        color: "text-green-600",  sub: `+${score.correct * 4} pts` },
              { label: "Incorrect",   value: String(score.incorrect),                      color: "text-red-500",    sub: `−${score.incorrect} pts` },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-100 dark:border-gray-700">
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-gray-700 dark:text-gray-300 text-xs font-bold mt-1 uppercase tracking-wide">{s.label}</p>
                {s.sub && <p className="text-gray-400 text-xs mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>

          {/* Marking scheme */}
          <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 rounded-xl p-3.5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <strong className="text-[#0D47A1] dark:text-blue-300">📊 Score: </strong>
            ({score.correct} × 4) − ({score.incorrect} × 1) = <strong>{score.correct * 4} − {score.incorrect} = {score.netScore.toFixed(0)}</strong>
            &emsp;|&emsp; Attempted: <strong>{score.attempted}/25</strong>
            &emsp;|&emsp; Unanswered: <strong>{25 - score.attempted}</strong>
          </div>

          {/* Per-category breakdown */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3 uppercase tracking-wide">Quiz Breakdown — 5 Questions per Category</h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {QUIZ_CATEGORIES.map((cat) => (
                <div key={cat.name} className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 text-center">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 leading-tight">{cat.label}</p>
                  <p className="text-lg font-black text-[#0D47A1] dark:text-blue-400 mt-1">5 Q</p>
                </div>
              ))}
            </div>
          </div>

          {/* Eligible branches */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">
              {admissionStatus === "bsc" ? "📚 Available Programme" : "🎓 Eligible Engineering Branches"}
            </h3>
            {eligibleBranches.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {eligibleBranches.map((branch) => (
                  <div key={branch} className="px-4 py-2 bg-[#0D47A1] text-white rounded-full font-semibold text-sm">
                    {branch} — {getBranchFullName(branch)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-500 font-medium">No branches available at this score.</p>
            )}
          </div>
        </div>
      </div>

      {/* Developer credit + CTA */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <p className="text-xs text-gray-400">
          Developed by <strong className="text-[#0D47A1]">{DEVELOPER.name}</strong> · {DEVELOPER.degree} · {DEVELOPER.institution}
        </p>
        {admissionStatus !== "disqualified" && (
          <Link
            href="/branch-choice"
            className="flex items-center gap-2 px-6 py-3 bg-[#FFC107] text-gray-900 rounded-xl font-bold hover:bg-[#FFB300] transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            Choose Your Branch →
          </Link>
        )}
      </div>
    </div>
  );
}
