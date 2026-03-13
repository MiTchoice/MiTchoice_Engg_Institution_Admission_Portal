"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface StudentRow {
  id: string; name: string; email: string; phone: string;
  createdAt: string; quizStatus: string; netScore: number | null;
  percentage: number | null; branch: string | null; admissionDone: boolean;
}

interface Props {
  users: StudentRow[];
  stats: { totalStudents: number; questions: number; sessions: number };
}

export function AdminClient({ users: initialUsers, stats }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [filterBranch, setFilterBranch] = useState("ALL");
  const [resetting, setResetting] = useState<string | null>(null);

  const branches = ["ALL", "CSE", "IT", "ECE", "EE", "ME", "CE"];
  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchBranch = filterBranch === "ALL" || u.branch === filterBranch;
    return matchSearch && matchBranch;
  });

  async function resetQuiz(userId: string) {
    setResetting(userId);
    try {
      const res = await fetch(`/api/admin/reset-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed"); return; }
      toast.success("Quiz reset successfully");
      setUsers((u) => u.map((s) =>
        s.id === userId
          ? { ...s, quizStatus: "NOT_STARTED", netScore: null, percentage: null, branch: null, admissionDone: false }
          : s
      ));
    } catch {
      toast.error("Failed to reset quiz");
    } finally {
      setResetting(null);
    }
  }

  function exportCSV() {
    const rows = [
      ["Name", "Email", "Phone", "Quiz Status", "Score", "Percentage", "Branch", "Admission"],
      ...filtered.map((u) => [
        u.name, u.email, u.phone, u.quizStatus,
        u.netScore?.toFixed(0) ?? "—",
        u.percentage?.toFixed(1) ?? "—",
        u.branch ?? "—",
        u.admissionDone ? "Yes" : "No",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mitchoice-students.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported!");
  }

  const statusColor = (s: string) =>
    s === "COMPLETED" ? "bg-green-100 text-green-700"
    : s === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-700"
    : "bg-gray-100 text-gray-600";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-500">Manage students and question bank</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Students", value: stats.totalStudents, color: "text-blue-600" },
          { label: "Questions", value: stats.questions, color: "text-purple-600" },
          { label: "Quiz Sessions", value: stats.sessions, color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-center">
            <p className={`text-4xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-gray-500 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search students..."
          className="flex-1 min-w-[200px] px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0D47A1]"
        />
        <select
          value={filterBranch}
          onChange={(e) => setFilterBranch(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
        >
          {branches.map((b) => <option key={b} value={b}>{b === "ALL" ? "All Branches" : b}</option>)}
        </select>
        <button
          onClick={exportCSV}
          className="px-5 py-2.5 bg-[#0D47A1] text-white rounded-xl font-semibold hover:bg-[#0a3d8f] transition"
        >
          Export CSV
        </button>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {["Name", "Email", "Quiz Status", "Score", "%", "Branch", "Admission", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(u.quizStatus)}`}>
                      {u.quizStatus.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                    {u.netScore?.toFixed(0) ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {u.percentage?.toFixed(1) ?? "—"}{u.percentage !== null ? "%" : ""}
                  </td>
                  <td className="px-4 py-3">
                    {u.branch ? (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                        {u.branch}
                      </span>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {u.admissionDone ? (
                      <span className="text-green-600 font-semibold text-xs">✓ Done</span>
                    ) : <span className="text-gray-400 text-xs">Pending</span>}
                  </td>
                  <td className="px-4 py-3">
                    {u.quizStatus !== "NOT_STARTED" && (
                      <button
                        onClick={() => resetQuiz(u.id)}
                        disabled={resetting === u.id}
                        className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50 transition"
                      >
                        {resetting === u.id ? "Resetting..." : "Reset Quiz"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    No students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
