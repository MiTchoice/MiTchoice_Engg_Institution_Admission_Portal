import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeScore } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const answers: Record<string, string> = body?.answers ?? {};

    const quizSession = await prisma.quizSession.findUnique({
      where: { userId: session.user.id },
    });

    if (!quizSession) return NextResponse.json({ error: "No quiz session found" }, { status: 400 });
    if (quizSession.status === "COMPLETED") return NextResponse.json({ error: "Quiz already submitted" }, { status: 400 });

    const questionIds = quizSession.questionIds.split(",").filter(Boolean);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, correct: true },
    });

    const score = computeScore(answers, questions);

    await prisma.quizSession.update({
      where: { userId: session.user.id },
      data: {
        answers: JSON.stringify(answers),
        netScore: score.netScore,
        percentage: score.percentage, // can be negative (valid for score card)
        correct: score.correct,
        incorrect: score.incorrect,
        attempted: score.attempted,
        status: "COMPLETED",
        submittedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, score });
  } catch (error: unknown) {
    console.error("Submit error:", error);
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 });
  }
}
