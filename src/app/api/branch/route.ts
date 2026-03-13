import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEligibleBranches } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const branch = body?.branch as string;
    if (!branch) {
      return NextResponse.json({ error: "Branch is required" }, { status: 400 });
    }

    // Check if already chosen
    const existing = await prisma.branchChoice.findUnique({
      where: { userId: session.user.id },
    });
    if (existing) {
      return NextResponse.json({ error: "Branch already chosen", branch: existing.branch }, { status: 409 });
    }

    // Verify quiz completed and check eligibility
    const quizSession = await prisma.quizSession.findUnique({
      where: { userId: session.user.id },
    });
    if (!quizSession || quizSession.status !== "COMPLETED") {
      return NextResponse.json({ error: "Quiz not completed yet" }, { status: 400 });
    }

    const percentage = quizSession.percentage ?? 0;
    const eligible = getEligibleBranches(percentage);
    if (!eligible.includes(branch)) {
      return NextResponse.json({ error: `Not eligible for ${branch} with your score` }, { status: 403 });
    }

    const choice = await prisma.branchChoice.create({
      data: { userId: session.user.id, branch },
    });

    return NextResponse.json({ success: true, branch: choice.branch });
  } catch (error: unknown) {
    console.error("Branch choice error:", error);
    return NextResponse.json({ error: "Failed to save branch choice" }, { status: 500 });
  }
}
