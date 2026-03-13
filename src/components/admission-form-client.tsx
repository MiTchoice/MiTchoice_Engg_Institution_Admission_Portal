"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getBranchFullName } from "@/lib/utils";

interface Props {
  user: { name: string; email: string; phone: string };
  branch: string;
}

export function AdmissionFormClient({ user, branch }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    dob: "", gender: "", address: "",
    tenthPercent: "", twelfthPercent: "", pcmPercent: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [marksheet, setMarksheet] = useState<File | null>(null);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validateFile(file: File): boolean {
    if (file.size > 500 * 1024) {
      toast.error(`${file.name} exceeds 500 KB limit`);
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validations
    if (!form.dob) return toast.error("Date of birth is required");
    if (!form.gender) return toast.error("Gender is required");
    if (form.address.length < 10) return toast.error("Please enter a complete address");
    const tenth = parseFloat(form.tenthPercent);
    const twelfth = parseFloat(form.twelfthPercent);
    const pcm = parseFloat(form.pcmPercent);
    if (isNaN(tenth) || tenth < 0 || tenth > 100) return toast.error("Invalid 10th percentage");
    if (isNaN(twelfth) || twelfth < 0 || twelfth > 100) return toast.error("Invalid 12th percentage");
    if (isNaN(pcm) || pcm < 0 || pcm > 100) return toast.error("Invalid PCM percentage");
    if (!photo) return toast.error("Please upload your photo");
    if (!marksheet) return toast.error("Please upload your marksheet");

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("dob", form.dob);
      fd.append("gender", form.gender);
      fd.append("address", form.address);
      fd.append("tenthPercent", form.tenthPercent);
      fd.append("twelfthPercent", form.twelfthPercent);
      fd.append("pcmPercent", form.pcmPercent);
      fd.append("photo", photo);
      fd.append("marksheet", marksheet);

      const res = await fetch("/api/admission", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) { toast.error(data.error || "Submission failed"); return; }
      toast.success("Admission form submitted successfully!");
      router.push("/admission-letter");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0D47A1] transition";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Admission Form</h1>
        <p className="text-gray-500 dark:text-gray-400">Fill all required details for final admission processing.</p>
      </div>

      {/* Pre-filled info */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4 grid grid-cols-2 gap-4">
        {[
          { label: "Name", value: user.name },
          { label: "Email", value: user.email },
          { label: "Phone", value: user.phone },
          { label: "Branch", value: `${branch} — ${getBranchFullName(branch)}` },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-xs text-blue-500 dark:text-blue-400 font-medium">{item.label}</p>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.value}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
        {/* DOB & Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Date of Birth *</label>
            <input type="date" required value={form.dob} onChange={(e) => update("dob", e.target.value)}
              className={inputClass} max={new Date().toISOString().split("T")[0]} />
          </div>
          <div>
            <label className={labelClass}>Gender *</label>
            <select required value={form.gender} onChange={(e) => update("gender", e.target.value)} className={inputClass}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className={labelClass}>Full Address *</label>
          <textarea
            required rows={3}
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            className={inputClass}
            placeholder="Street, City, State, PIN Code"
          />
        </div>

        {/* Percentages */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "10th %", key: "tenthPercent" },
            { label: "12th %", key: "twelfthPercent" },
            { label: "PCM %", key: "pcmPercent" },
          ].map((f) => (
            <div key={f.key}>
              <label className={labelClass}>{f.label} *</label>
              <input
                type="number" required min="0" max="100" step="0.01"
                value={form[f.key as keyof typeof form]}
                onChange={(e) => update(f.key, e.target.value)}
                className={inputClass}
                placeholder="e.g. 85.5"
              />
            </div>
          ))}
        </div>

        {/* File Uploads */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Photo (JPG/PNG ≤ 500 KB) *</label>
            <input
              type="file" accept="image/jpeg,image/png"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && validateFile(f)) setPhoto(f);
              }}
              className="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#0D47A1] file:text-white file:font-semibold file:cursor-pointer cursor-pointer"
            />
            {photo && <p className="text-xs text-green-600 mt-1">✓ {photo.name}</p>}
          </div>
          <div>
            <label className={labelClass}>Marksheet (JPG/PDF ≤ 500 KB) *</label>
            <input
              type="file" accept="image/jpeg,image/png,application/pdf"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && validateFile(f)) setMarksheet(f);
              }}
              className="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#0D47A1] file:text-white file:font-semibold file:cursor-pointer cursor-pointer"
            />
            {marksheet && <p className="text-xs text-green-600 mt-1">✓ {marksheet.name}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#0D47A1] hover:bg-[#0a3d8f] disabled:opacity-70 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
          ) : "Submit Admission Form"}
        </button>
      </form>
    </div>
  );
}
