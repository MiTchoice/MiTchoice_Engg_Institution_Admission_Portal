"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBranchFullName, getBranchColor } from "@/lib/utils";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const BRANCH_ICONS: Record<string, string> = {
  CSE: "💻", IT: "🌐", ECE: "📡", EE: "⚡", ME: "⚙️", CE: "🏗️", BSc: "🔬",
};

export function BranchChoiceClient({
  eligibleBranches,
  percentage,
  chosenBranch: initialChosen,
}: {
  eligibleBranches: string[];
  percentage: number;
  chosenBranch: string | null;
}) {
  const router = useRouter();
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [locking, setLocking] = useState(false);
  const [locked, setLocked] = useState<string | null>(initialChosen);

  async function lockBranch() {
    if (!selectedBranch) return;
    setLocking(true);
    try {
      const res = await fetch("/api/branch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch: selectedBranch }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed"); return; }
      toast.success(`Branch ${selectedBranch} locked successfully!`);
      setLocked(selectedBranch);
      setConfirming(false);
      setTimeout(() => router.push("/admission-form"), 1500);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLocking(false);
    }
  }

  if (locked) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-7xl mb-6">
          {BRANCH_ICONS[locked]}
        </motion.div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Branch Locked! 🎉</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
          You have been allocated to <strong className="text-[#0D47A1]">{locked}</strong> — {getBranchFullName(locked)}
        </p>
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-2xl p-6 mb-6">
          <p className="text-green-700 dark:text-green-300 font-medium">
            Your branch choice is confirmed. Please proceed to fill the admission form.
          </p>
        </div>
        <a href="/admission-form" className="inline-block px-8 py-3 bg-[#0D47A1] text-white rounded-xl font-bold hover:bg-[#0a3d8f] transition">
          Fill Admission Form →
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Choose Your Branch</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Based on your score of <strong>{percentage.toFixed(1)}%</strong>, you are eligible for the following branches.
          This choice is permanent — choose wisely!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {eligibleBranches.map((branch, i) => (
          <motion.button
            key={branch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => setSelectedBranch(branch)}
            className={`relative group text-left rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 ${
              selectedBranch === branch
                ? "ring-4 ring-[#FFC107] ring-offset-2 dark:ring-offset-gray-950"
                : ""
            }`}
          >
            <div className={`bg-gradient-to-br ${getBranchColor(branch)} p-6 text-white h-full`}>
              <div className="text-4xl mb-3">{BRANCH_ICONS[branch]}</div>
              <h3 className="text-xl font-black mb-1">{branch}</h3>
              <p className="text-white/80 text-sm">{getBranchFullName(branch)}</p>
              {selectedBranch === branch && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-[#FFC107] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {selectedBranch && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
        >
          <p className="font-medium text-gray-700 dark:text-gray-300">
            Selected: <strong className="text-[#0D47A1]">{selectedBranch}</strong> — {getBranchFullName(selectedBranch)}
          </p>
          <button
            onClick={() => setConfirming(true)}
            className="px-6 py-2.5 bg-[#0D47A1] text-white rounded-xl font-bold hover:bg-[#0a3d8f] transition"
          >
            Confirm & Lock
          </button>
        </motion.div>
      )}

      {/* Confirm Modal */}
      {confirming && selectedBranch && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
          >
            <div className="text-5xl mb-4">{BRANCH_ICONS[selectedBranch]}</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Confirm Branch Choice
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              You are about to lock your branch as:
            </p>
            <p className="text-2xl font-black text-[#0D47A1] dark:text-blue-400 mb-1">{selectedBranch}</p>
            <p className="text-gray-500 mb-6">{getBranchFullName(selectedBranch)}</p>
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-6">
              <p className="text-amber-700 dark:text-amber-300 text-sm font-medium">
                ⚠️ This action is irreversible. Once locked, you cannot change your branch.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={lockBranch}
                disabled={locking}
                className="flex-1 py-3 bg-[#0D47A1] text-white rounded-xl font-bold hover:bg-[#0a3d8f] disabled:opacity-70 transition flex items-center justify-center gap-2"
              >
                {locking ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Locking...</>
                ) : "Lock Branch"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
