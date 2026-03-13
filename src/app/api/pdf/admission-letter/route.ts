import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getBranchFullName, formatDate } from "@/lib/utils";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { quizSession: true, branchChoice: true, admission: true },
    });

    if (!user?.admission) {
      return NextResponse.json({ error: "Admission form not submitted" }, { status: 400 });
    }

    const admissionDate = new Date(user.admission.submittedAt);
    const feeDeadline = new Date(admissionDate);
    feeDeadline.setDate(feeDeadline.getDate() + 15);

    const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const verifyUrl = `${appUrl}/verify/${user.id}`;

    let qrDataUrl = "";
    try {
      qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 150,
        margin: 2,
        color: { dark: "#0D47A1", light: "#ffffff" },
      });
    } catch {
      // QR code generation is non-critical
    }

    const html = generateAdmissionLetterHTML({
      name: user.name,
      email: user.email,
      phone: user.phone ?? "N/A",
      dob: user.admission.dob,
      gender: user.admission.gender,
      branch: user.branchChoice?.branch ?? "N/A",
      score: user.quizSession?.netScore ?? 0,
      percentage: user.quizSession?.percentage ?? 0,
      admissionDate: formatDate(admissionDate),
      feeDeadline: formatDate(feeDeadline),
      studentId: `MITC2025${user.id.slice(-6).toUpperCase()}`,
      refNo: `MITC/ADM/2025/${user.id.slice(-6).toUpperCase()}`,
      qrDataUrl,
    });

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": "inline",
      },
    });
  } catch (error: unknown) {
    console.error("Admission letter error:", error);
    return NextResponse.json({ error: "Failed to generate admission letter" }, { status: 500 });
  }
}

function esc(s: string | number): string {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function generateAdmissionLetterHTML(data: {
  name: string; email: string; phone: string; dob: string; gender: string;
  branch: string; score: number; percentage: number;
  admissionDate: string; feeDeadline: string; studentId: string;
  refNo: string; qrDataUrl: string;
}) {
  const rows: [string, string][] = [
    ["Student Name", data.name],
    ["Email Address", data.email],
    ["Phone Number", data.phone],
    ["Date of Birth", data.dob],
    ["Gender", data.gender],
    ["Allocated Branch", `${data.branch} — ${getBranchFullName(data.branch)}`],
    ["Entrance Score", `${data.score.toFixed(0)} / 400  (${data.percentage.toFixed(1)}%)`],
    ["Admission Date", data.admissionDate],
    ["Fee Payment Deadline", data.feeDeadline],
    ["Student ID", data.studentId],
    ["Reference No.", data.refNo],
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>MITChoice Admission Letter - ${esc(data.name)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #f1f5f9; padding: 32px; color: #1e293b; }
  .letter { background: white; max-width: 820px; margin: 0 auto; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.15); }
  .header { background: linear-gradient(135deg, #0D47A1 0%, #1565C0 100%); color: white; padding: 28px 32px; display: flex; align-items: center; gap: 20px; }
  .gear { font-size: 52px; flex-shrink: 0; }
  .header-text h1 { font-size: 22px; font-weight: 900; line-height: 1.2; }
  .header-text p { font-size: 12px; color: #bfdbfe; margin-top: 3px; line-height: 1.6; }
  .banner { background: #FFC107; text-align: center; padding: 12px; font-weight: 900; font-size: 15px; color: #1e293b; letter-spacing: 2px; text-transform: uppercase; }
  .content { padding: 36px; }
  .meta-row { display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 24px; }
  .salutation { font-size: 16px; margin-bottom: 18px; }
  .body-text { font-size: 14px; line-height: 1.85; color: #374151; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; }
  thead { background: linear-gradient(135deg, #0D47A1, #1565C0); color: white; }
  thead th { padding: 14px 16px; text-align: left; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  tbody tr:hover { background: #eff6ff; }
  td { padding: 12px 16px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
  td:first-child { color: #64748b; font-weight: 500; width: 38%; }
  td:last-child { font-weight: 700; color: #1e293b; }
  .alert { background: #fff7ed; border-left: 4px solid #f97316; border-radius: 0 10px 10px 0; padding: 18px 20px; margin-bottom: 24px; }
  .alert h4 { font-weight: 700; color: #c2410c; margin-bottom: 10px; font-size: 14px; }
  .alert ul { padding-left: 20px; color: #9a3412; font-size: 13px; line-height: 2.1; }
  .sig-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 32px; padding-top: 24px; border-top: 2px solid #e2e8f0; }
  .sig-line { height: 2px; width: 180px; background: #0D47A1; margin-bottom: 8px; }
  .sig-name { font-weight: 800; font-size: 14px; }
  .sig-title { font-size: 13px; color: #64748b; }
  .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; display: flex; justify-content: space-between; align-items: center; }
  .footer p { font-size: 11px; color: #94a3b8; }
  .print-btn { background: #0D47A1; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; margin-bottom: 12px; display: block; margin-left: auto; max-width: 820px; }
  @media print {
    body { background: white; padding: 0; }
    .letter { box-shadow: none; border-radius: 0; }
    .print-btn { display: none; }
  }
</style>
</head>
<body>
<button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
<div class="letter">
  <div class="header">
    <div class="gear">⚙️</div>
    <div class="header-text">
      <h1>MITChoice Engineering Institution</h1>
      <p>Estd. 1985 &nbsp;•&nbsp; NAAC A+ Accredited &nbsp;•&nbsp; AICTE Approved &nbsp;•&nbsp; NBA Certified</p>
      <p>123 Engineering Campus, Tech City, Maharashtra - 400001</p>
      <p>📞 1800-MIT-CHOICE &nbsp;|&nbsp; ✉️ admissions@mitchoice.edu.in &nbsp;|&nbsp; 🌐 www.mitchoice.edu.in</p>
    </div>
  </div>
  <div class="banner">✦ Provisional Admission Letter — Academic Year 2025-26 ✦</div>
  <div class="content">
    <div class="meta-row">
      <span>📅 Date: <strong>${esc(data.admissionDate)}</strong></span>
      <span>📄 Ref No: <strong>${esc(data.refNo)}</strong></span>
    </div>

    <p class="salutation">Dear <strong>${esc(data.name)}</strong>,</p>

    <p class="body-text">
      We are delighted to inform you that based on your outstanding performance in the
      <strong>MITChoice Engineering Entrance Test 2025</strong> and successful completion of the admission
      process, you have been <strong>provisionally admitted</strong> to the undergraduate engineering
      program at MITChoice Engineering Institution for the Academic Year <strong>2025-26</strong>.
      We congratulate you on this achievement.
    </p>

    <table>
      <thead><tr><th colspan="2">📋 Student Admission Details</th></tr></thead>
      <tbody>
        ${rows.map(([label, value]) => `<tr><td>${esc(label)}</td><td>${esc(value)}</td></tr>`).join("")}
      </tbody>
    </table>

    <div class="alert">
      <h4>📌 Important Instructions — Please Read Carefully</h4>
      <ul>
        <li>Pay the admission fee of <strong>₹50,000/-</strong> on or before <strong>${esc(data.feeDeadline)}</strong></li>
        <li>Payment can be made via NEFT/RTGS, Demand Draft, or the Online Portal</li>
        <li>Non-payment by the deadline will result in <strong>automatic cancellation</strong> of this admission</li>
        <li>Report to the Admissions Office with <strong>all original documents</strong> for verification</li>
        <li>Required documents: 10th &amp; 12th mark sheets, Transfer Certificate, Aadhar Card, 4 passport photos</li>
        <li>Hostel allocation is on a first-come-first-served basis — apply separately at hostel@mitchoice.edu.in</li>
        <li>Orientation for new students: <strong>July 28, 2025</strong> at 9:00 AM in the Main Auditorium</li>
      </ul>
    </div>

    <p class="body-text">
      We look forward to welcoming you to the MITChoice family and wish you a successful and
      fulfilling academic career. For any assistance, contact our Admissions Helpdesk at
      <strong>1800-MIT-CHOICE</strong> (Toll-Free) or email <strong>admissions@mitchoice.edu.in</strong>.
    </p>

    <div class="sig-row">
      <div>
        <div class="sig-line"></div>
        <div class="sig-name">Dr. Rajesh Kumar</div>
        <div class="sig-title">Dean of Admissions</div>
        <div class="sig-title">MITChoice Engineering Institution</div>
      </div>
      ${data.qrDataUrl ? `
      <div style="text-align:center;">
        <img src="${data.qrDataUrl}" style="width:120px;height:120px;border:2px solid #e2e8f0;border-radius:8px;display:block;" alt="Verification QR Code" />
        <p style="font-size:11px;color:#94a3b8;margin-top:6px;">Scan to verify</p>
        <p style="font-size:10px;color:#94a3b8;">${esc(data.studentId)}</p>
      </div>` : `<div style="font-size:11px;color:#94a3b8;text-align:center;padding:12px;">Student ID:<br><strong>${esc(data.studentId)}</strong></div>`}
    </div>
  </div>
  <div class="footer">
    <p>This is a computer-generated letter and is valid without a physical signature. &nbsp;|&nbsp; © 2025 MITChoice Engineering Institution — Developed by MITRASEN YADAV, M.Tech CSE, NIT Hamirpur (NITH)</p>
  </div>
</div>
</body>
</html>`;
}
