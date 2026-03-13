import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shuffleArray } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Quiz format: exactly 25 questions — 5 from each category (no repetition)
const QUIZ_CATEGORIES = [
  { name: "ENGLISH",              count: 5 },
  { name: "NUMERICAL_APTITUDE",   count: 5 },
  { name: "GENERAL_AWARENESS",    count: 5 },
  { name: "BASIC_ENGINEERING",    count: 5 },
  { name: "MATHEMATICS",          count: 5 },
] as const;

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Resume existing session if any
    let quizSession = await prisma.quizSession.findUnique({
      where: { userId: session.user.id },
    });

    if (quizSession?.status === "COMPLETED") {
      return NextResponse.json({ error: "Quiz already completed" }, { status: 400 });
    }

    if (!quizSession) {
      // ── Build 25-question set: exactly 5 per category ──────────
      const selectedIds: string[] = [];

      for (const cat of QUIZ_CATEGORIES) {
        const pool = await prisma.question.findMany({
          where: { category: cat.name },
          select: { id: true },
        });

        if (pool.length < cat.count) {
          return NextResponse.json(
            {
              error: `Not enough ${cat.name} questions in database (need ${cat.count}, found ${pool.length}). Run: npm run seed`,
            },
            { status: 503 }
          );
        }

        // Pick exactly `count` random unique questions from this category
        const picked = shuffleArray(pool).slice(0, cat.count).map((q) => q.id);
        selectedIds.push(...picked);
      }

      // Shuffle the final 25 so categories are intermixed
      const finalIds = shuffleArray(selectedIds);

      quizSession = await prisma.quizSession.create({
        data: {
          userId: session.user.id,
          questionIds: finalIds.join(","),
          answers: "{}",
          status: "IN_PROGRESS",
        },
      });
    }

    // Load question details (without correct answer exposed)
    const questionIds = quizSession.questionIds.split(",").filter(Boolean);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: {
        id: true,
        text: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
        category: true,
        difficulty: true,
      },
    });

    // Preserve the shuffled order stored in DB
    const ordered = questionIds
      .map((id) => questions.find((q) => q.id === id))
      .filter((q): q is NonNullable<typeof q> => q !== undefined);

    let answers: Record<string, string> = {};
    try {
      answers = JSON.parse(quizSession.answers || "{}");
    } catch {
      answers = {};
    }

    return NextResponse.json({
      questions: ordered,
      answers,
      startedAt: quizSession.startedAt,
      sessionId: quizSession.id,
      totalQuestions: ordered.length, // 25
      categoryBreakdown: QUIZ_CATEGORIES,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Quiz GET error:", msg);
    if (msg.includes("no such table") || msg.includes("does not exist")) {
      return NextResponse.json(
        { error: "Database not ready. Run: npm run setup" },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Failed to load quiz. Please refresh." }, { status: 500 });
  }
}
