import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getEligibleBranches, getAdmissionStatus, formatDate, getBranchFullName } from "@/lib/utils";
import { ScoreCardClient } from "@/components/score-card-client";

export default async function ScoreCardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { quizSession: true },
  });

  if (!user?.quizSession || user.quizSession.status !== "COMPLETED") {
    redirect("/quiz");
  }

  const qs = user.quizSession;
  const percentage = qs.percentage ?? 0;
  const eligibleBranches = getEligibleBranches(percentage);
  const admissionStatus = getAdmissionStatus(percentage);

  return (
    <ScoreCardClient
      student={{
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
      }}
      score={{
        correct: qs.correct ?? 0,
        incorrect: qs.incorrect ?? 0,
        attempted: qs.attempted ?? 0,
        netScore: qs.netScore ?? 0,
        percentage,
      }}
      eligibleBranches={eligibleBranches}
      admissionStatus={admissionStatus}
      quizDate={formatDate(qs.submittedAt ?? qs.createdAt)}
    />
  );
}
