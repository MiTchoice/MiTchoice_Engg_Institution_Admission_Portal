import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getEligibleBranches } from "@/lib/utils";
import { BranchChoiceClient } from "@/components/branch-choice-client";

export default async function BranchChoicePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { quizSession: true, branchChoice: true },
  });

  if (!user?.quizSession || user.quizSession.status !== "COMPLETED") redirect("/quiz");

  const percentage = user.quizSession.percentage ?? 0;
  const eligibleBranches = getEligibleBranches(percentage);

  if (eligibleBranches.length === 0) redirect("/score-card");

  return (
    <BranchChoiceClient
      eligibleBranches={eligibleBranches}
      percentage={percentage}
      chosenBranch={user.branchChoice?.branch ?? null}
    />
  );
}
