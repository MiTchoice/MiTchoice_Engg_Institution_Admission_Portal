"use client";

import { useState } from "react";
import Link from "next/link";
import { getBranchFullName } from "@/lib/utils";
import toast from "react-hot-toast";
import { GearIcon } from "@/components/ui/gear-icon";

interface Props {
  student: {
    id: string; name: string; email: string; phone: string;
    branch: string; score: number; percentage: number;
    admissionDate: string; feeDeadline: string;
    dob: string; gender: string;
  };
}

export function AdmissionLetterClient({ student }: Props) {
  const [downloading, setDownloading] = useState(false);

  function openLetter() {
    setDownloading(true);
    window.open("/api/pdf/admission-letter", "_blank");
    toast.success("Admission letter opened — use Ctrl+P to save as PDF");
    setTimeout(() => setDownloading(false), 1500);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Admission Letter</h1>
          <p className="text-gray-500 dark:text-gray-400">Provisional Admission Letter 2025-26</p>
        </div>
        <button
          onClick={openLetter}
          disabled={downloading}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0D47A1] text-white rounded-xl font-semibold hover:bg-[#0a3d8f] disabled:opacity-70 transition-all"
        >
          {downloading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Opening...</>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Admission Letter
            </>
          )}
        </button>
      </div>

      {/* Congratulation Banner */}
      <div className="bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-2xl p-4 flex items-center gap-3">
        <span className="text-3xl">🎉</span>
        <div>
          <p className="font-bold text-green-800 dark:text-green-300">Congratulations, {student.name}!</p>
          <p className="text-green-700 dark:text-green-400 text-sm">
            You have been provisionally admitted to <strong>{student.branch}</strong> — {getBranchFullName(student.branch)}
          </p>
        </div>
      </div>

      {/* Letter Preview */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
        {/* Letterhead */}
        <div className="bg-gradient-to-r from-[#0D47A1] to-[#1565C0] p-6 text-white">
          <div className="flex items-center gap-4 flex-wrap">
            <GearIcon size={56} />
            <div>
              <h2 className="text-xl font-black">MITChoice Engineering Institution</h2>
              <p className="text-blue-200 text-sm">Estd. 1985 • NAAC A+ Accredited • AICTE Approved</p>
              <p className="text-blue-300 text-xs">123 Engineering Campus, Tech City, Maharashtra - 400001</p>
            </div>
          </div>
          <div className="mt-5 border-t border-white/30 pt-4 text-center">
            <h3 className="text-lg font-bold text-[#FFC107] tracking-wider">PROVISIONAL ADMISSION LETTER</h3>
            <p className="text-blue-200 text-sm">Academic Year 2025-26</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-5">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Date: <strong className="text-gray-900 dark:text-white">{student.admissionDate}</strong></span>
            <span>Ref: <strong className="text-gray-900 dark:text-white">MITC/ADM/2025/{student.id.slice(-6).toUpperCase()}</strong></span>
          </div>

          <p className="text-gray-700 dark:text-gray-300 text-base">
            Dear <strong>{student.name}</strong>,
          </p>

          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            We are pleased to inform you that based on your performance in the MITChoice Engineering
            Entrance Test 2025, you have been <strong>provisionally admitted</strong> to the undergraduate
            engineering program at MITChoice Engineering Institution.
          </p>

          {/* Details Table */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="bg-[#0D47A1] px-4 py-2.5 font-bold text-white text-sm uppercase tracking-wider">
              Admission Details
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {[
                ["Student Name", student.name],
                ["Email", student.email],
                ["Phone", student.phone],
                ["Date of Birth", student.dob],
                ["Gender", student.gender],
                ["Allocated Branch", `${student.branch} — ${getBranchFullName(student.branch)}`],
                ["Entrance Score", `${student.score.toFixed(0)} / 400 (${student.percentage.toFixed(1)}%)`],
                ["Admission Date", student.admissionDate],
                ["Fee Payment Deadline", student.feeDeadline],
                ["Student ID", `MITC2025${student.id.slice(-6).toUpperCase()}`],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-2 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</span>
                  <span className="text-gray-900 dark:text-white text-sm font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fee Alert */}
          <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 rounded-xl p-4">
            <h4 className="font-bold text-amber-800 dark:text-amber-200 mb-2 text-sm">📌 Important Instructions</h4>
            <ul className="text-amber-700 dark:text-amber-300 text-sm space-y-1 list-disc list-inside">
              <li>Pay admission fee of <strong>₹50,000/-</strong> by <strong>{student.feeDeadline}</strong></li>
              <li>Failure to pay will result in cancellation of admission</li>
              <li>Bring original documents for verification when reporting</li>
              <li>Orientation: July 28, 2025 at 9:00 AM in Main Auditorium</li>
            </ul>
          </div>

          {/* Signature */}
          <div className="flex items-end justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
            <div>
              <div className="w-40 h-0.5 bg-[#0D47A1] mb-2" />
              <p className="font-bold text-gray-900 dark:text-white text-sm">Dr. Rajesh Kumar</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Dean of Admissions</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">MITChoice Engineering Institution</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 border-2 border-[#0D47A1]/30 rounded-lg flex items-center justify-center text-[8px] text-[#0D47A1]/60 font-bold bg-blue-50 dark:bg-blue-950/30 leading-tight text-center p-2">
                QR CODE<br />(Download<br />for full)
              </div>
              <p className="text-xs text-gray-400 mt-1">Scan to verify</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-center text-gray-400 text-sm">
          This is a preview. Click "Download Admission Letter" for the printable version with QR code.
        </p>
        <Link href="/dashboard" className="text-sm text-[#0D47A1] hover:underline">
          ← Dashboard
        </Link>
      </div>
    </div>
  );
}
