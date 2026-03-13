import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEligibleBranches, getBranchFullName, formatDate, QUIZ_CATEGORIES, MAX_SCORE, DEVELOPER } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { quizSession: true },
    });

    if (!user?.quizSession || user.quizSession.status !== "COMPLETED") {
      return NextResponse.json({ error: "Quiz not completed" }, { status: 400 });
    }

    const qs = user.quizSession;
    const percentage = qs.percentage ?? 0;
    const eligible = getEligibleBranches(percentage);

    const html = generateScoreCardHTML({
      name: user.name,
      email: user.email,
      phone: user.phone ?? "N/A",
      quizDate: formatDate(qs.submittedAt ?? qs.createdAt),
      netScore: qs.netScore ?? 0,
      percentage,
      correct: qs.correct ?? 0,
      incorrect: qs.incorrect ?? 0,
      attempted: qs.attempted ?? 0,
      eligible,
    });

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8", "Content-Disposition": "inline" },
    });
  } catch (error: unknown) {
    console.error("Score card PDF error:", error);
    return NextResponse.json({ error: "Failed to generate score card" }, { status: 500 });
  }
}

function esc(s: string | number): string {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function generateScoreCardHTML(d: {
  name: string; email: string; phone: string; quizDate: string;
  netScore: number; percentage: number; correct: number;
  incorrect: number; attempted: number; eligible: string[];
}) {
  const grade =
    d.percentage >= 90 ? "A+" : d.percentage >= 80 ? "A" : d.percentage >= 70 ? "B+" :
    d.percentage >= 60 ? "B" : d.percentage >= 50 ? "C+" : d.percentage >= 40 ? "C" : "F";
  const gradeColor =
    grade === "A+" ? "#16a34a" : grade === "A" ? "#15803d" :
    grade.startsWith("B") ? "#2563eb" : grade.startsWith("C") ? "#d97706" : "#dc2626";

  const catRows = QUIZ_CATEGORIES.map(c =>
    `<div style="text-align:center;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 8px;">
      <p style="font-size:11px;font-weight:700;color:#64748b;margin:0 0 6px;">${esc(c.label)}</p>
      <p style="font-size:20px;font-weight:900;color:#0D47A1;margin:0;">5 Q</p>
    </div>`
  ).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>MITChoice Score Card — ${esc(d.name)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;background:#f1f5f9;padding:28px;color:#1e293b}
  .card{background:white;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.12);max-width:800px;margin:0 auto}
  .header{background:linear-gradient(135deg,#0D47A1,#1976D2);padding:28px;color:white}
  .hrow{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap}
  .inst{font-size:20px;font-weight:900;margin-bottom:4px}
  .sub{font-size:11px;color:#bfdbfe;line-height:1.7}
  .title{background:#FFC107;text-align:center;padding:10px;font-weight:900;font-size:14px;color:#1e293b;letter-spacing:2px}
  .body{padding:28px}
  .grade-box{background:white;border-radius:12px;padding:10px 22px;text-align:center;min-width:80px}
  .grade-val{font-size:44px;font-weight:900;color:${gradeColor};line-height:1}
  .grade-lbl{font-size:11px;color:#64748b;margin-top:4px;font-weight:700}
  .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
  .stat{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;text-align:center}
  .sv{font-size:30px;font-weight:900;line-height:1}
  .sl{font-size:11px;color:#64748b;margin-top:5px;font-weight:700;text-transform:uppercase}
  .marking{background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px 16px;font-size:12px;color:#1e40af;margin-bottom:20px;line-height:1.8}
  .section{font-size:13px;font-weight:700;color:#1e293b;margin-bottom:12px}
  .catgrid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:20px}
  .branches{display:flex;flex-wrap:wrap;gap:8px}
  .btag{background:linear-gradient(135deg,#0D47A1,#1565C0);color:white;padding:7px 14px;border-radius:100px;font-size:12px;font-weight:700}
  .footer{background:#f8fafc;border-top:2px solid #e2e8f0;padding:14px 28px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}
  .footer p{font-size:11px;color:#94a3b8}
  .dev{font-size:11px;color:#0D47A1;font-weight:700}
  .stamp{border:3px solid #0D47A1;border-radius:50%;width:72px;height:72px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:8px;font-weight:900;color:#0D47A1;line-height:1.4;padding:6px}
  @media print{body{background:white;padding:0}.card{box-shadow:none;border-radius:0}.print-btn{display:none}}
</style>
</head>
<body>
<div style="text-align:right;max-width:800px;margin:0 auto 12px;">
  <button class="print-btn" onclick="window.print()" style="background:#0D47A1;color:white;border:none;padding:9px 22px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;">🖨️ Print / Save as PDF</button>
</div>
<div class="card">
  <div class="header">
    <div class="hrow">
      <div>
        <div class="inst">⚙️ MITChoice Engineering Institution</div>
        <div class="sub">Estd. 1985 &nbsp;·&nbsp; NAAC A+ Accredited &nbsp;·&nbsp; AICTE Approved &nbsp;·&nbsp; NBA Certified<br>
        123 Engineering Campus, Tech City, Maharashtra - 400001</div>
        <div style="margin-top:12px">
          <div style="font-size:15px;font-weight:900">${esc(d.name)}</div>
          <div style="font-size:12px;color:#bfdbfe;margin-top:2px">${esc(d.email)} &nbsp;·&nbsp; ${esc(d.phone)}</div>
          <div style="font-size:11px;color:#93c5fd;margin-top:2px">Test Date: ${esc(d.quizDate)}</div>
        </div>
      </div>
      <div class="grade-box">
        <div class="grade-val">${grade}</div>
        <div class="grade-lbl">Grade</div>
      </div>
    </div>
  </div>
  <div class="title">✦ ENTRANCE TEST SCORE CARD — 2025 &nbsp;·&nbsp; 25 Questions &nbsp;·&nbsp; 5 Categories ✦</div>
  <div class="body">
    <div class="stats">
      <div class="stat"><div class="sv" style="color:#0D47A1">${d.netScore.toFixed(0)}/${MAX_SCORE}</div><div class="sl">Net Score</div></div>
      <div class="stat"><div class="sv" style="color:#7c3aed">${d.percentage.toFixed(1)}%</div><div class="sl">Percentage</div></div>
      <div class="stat"><div class="sv" style="color:#16a34a">${d.correct}</div><div class="sl">Correct (+4 each)</div></div>
      <div class="stat"><div class="sv" style="color:#dc2626">${d.incorrect}</div><div class="sl">Incorrect (−1 each)</div></div>
    </div>
    <div class="marking">
      <strong>📊 Score:</strong> (${d.correct} × 4) − (${d.incorrect} × 1) = ${d.correct * 4} − ${d.incorrect} = <strong>${d.netScore.toFixed(0)} / ${MAX_SCORE}</strong>
      &emsp;|&emsp; Attempted: <strong>${d.attempted} / 25</strong> &emsp;|&emsp; Unanswered: <strong>${25 - d.attempted}</strong>
    </div>
    <div class="section">📋 Quiz Format — 5 Questions per Category</div>
    <div class="catgrid">${catRows}</div>
    <div class="section">🎓 Eligible Engineering Branches</div>
    <div class="branches">
      ${d.eligible.length > 0
        ? d.eligible.map(b => `<span class="btag">${esc(b)} — ${esc(getBranchFullName(b))}</span>`).join("")
        : '<span style="color:#ef4444;font-weight:700;">Not eligible for any branch at this score</span>'}
    </div>
  </div>
  <div class="footer">
    <div>
      <p>Computer-generated document. No physical signature required.</p>
      <p>© 2025 MITChoice Engineering Institution. All Rights Reserved.</p>
      <p class="dev">Developed by ${esc(DEVELOPER.name)} &nbsp;·&nbsp; ${esc(DEVELOPER.degree)} &nbsp;·&nbsp; ${esc(DEVELOPER.institution)}</p>
    </div>
    <div class="stamp">MITCHOICE<br>VERIFIED<br>2025</div>
  </div>
</div>
</body></html>`;
}
