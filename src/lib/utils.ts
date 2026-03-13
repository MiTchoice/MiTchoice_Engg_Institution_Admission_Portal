import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ── Quiz constants ─────────────────────────────────────────────────────────
export const QUIZ_TOTAL_QUESTIONS = 25;
export const MARKS_PER_CORRECT   = 4;
export const MARKS_PER_WRONG     = 1;  // deducted
export const MAX_SCORE           = QUIZ_TOTAL_QUESTIONS * MARKS_PER_CORRECT; // 100

export const QUIZ_CATEGORIES = [
  { name: "ENGLISH",            label: "English",              count: 5, color: "blue"   },
  { name: "NUMERICAL_APTITUDE", label: "Numerical Aptitude",   count: 5, color: "purple" },
  { name: "GENERAL_AWARENESS",  label: "General Awareness",    count: 5, color: "green"  },
  { name: "BASIC_ENGINEERING",  label: "Basic Engineering",    count: 5, color: "orange" },
  { name: "MATHEMATICS",        label: "Mathematics",          count: 5, color: "red"    },
] as const;

// Developer credit
export const DEVELOPER = {
  name:        "MITRASEN YADAV",
  degree:      "M.Tech CSE",
  institution: "NIT Hamirpur (NITH)",
} as const;

// ── Tailwind helpers ───────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Date formatter ─────────────────────────────────────────────────────────
export function formatDate(date: Date | string): string {
  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit", month: "long", year: "numeric",
    });
  } catch {
    return String(date);
  }
}

// ── Branch eligibility (based on percentage out of 100) ────────────────────
export function getEligibleBranches(percentage: number): string[] {
  const p = Math.max(0, percentage);
  if (p >= 90) return ["CSE", "IT", "ECE", "EE", "ME", "CE"];
  if (p >= 80) return ["IT", "ECE", "EE", "ME", "CE"];
  if (p >= 70) return ["EE", "ME", "CE"];
  if (p >= 60) return ["ME", "CE"];
  if (p >= 50) return ["ME", "CE"];
  if (p >= 40) return ["CE"];
  if (p >= 35) return ["BSc"];
  return [];
}

export function getAdmissionStatus(percentage: number): "eligible" | "bsc" | "disqualified" {
  if (percentage >= 40) return "eligible";
  if (percentage >= 35) return "bsc";
  return "disqualified";
}

export function getBranchFullName(branch: string): string {
  const names: Record<string, string> = {
    CSE: "Computer Science & Engineering",
    IT:  "Information Technology",
    ECE: "Electronics & Communication Engineering",
    EE:  "Electrical Engineering",
    ME:  "Mechanical Engineering",
    CE:  "Civil Engineering",
    BSc: "Bachelor of Science",
  };
  return names[branch] ?? branch;
}

export function getBranchColor(branch: string): string {
  const colors: Record<string, string> = {
    CSE: "from-blue-600 to-blue-800",
    IT:  "from-indigo-600 to-indigo-800",
    ECE: "from-purple-600 to-purple-800",
    EE:  "from-yellow-600 to-yellow-800",
    ME:  "from-orange-600 to-orange-800",
    CE:  "from-green-600 to-green-800",
    BSc: "from-teal-600 to-teal-800",
  };
  return colors[branch] ?? "from-gray-600 to-gray-800";
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ── Score computation ──────────────────────────────────────────────────────
// 25 Q × 4 marks each = 100 max | Wrong = -1 | Unanswered = 0
export function computeScore(
  answers: Record<string, string>,
  questions: Array<{ id: string; correct: string }>
): { correct: number; incorrect: number; attempted: number; netScore: number; percentage: number } {
  let correct   = 0;
  let incorrect = 0;

  for (const q of questions) {
    const answer = answers[q.id];
    if (!answer || answer === "") continue;
    if (answer === q.correct) correct++;
    else incorrect++;
  }

  const attempted  = correct + incorrect;
  const netScore   = correct * MARKS_PER_CORRECT - incorrect * MARKS_PER_WRONG;
  const percentage = (netScore / MAX_SCORE) * 100; // out of 100%

  return { correct, incorrect, attempted, netScore, percentage };
}

// ── Category display label ─────────────────────────────────────────────────
export function getCategoryLabel(category: string): string {
  const cat = QUIZ_CATEGORIES.find((c) => c.name === category);
  return cat?.label ?? category;
}
