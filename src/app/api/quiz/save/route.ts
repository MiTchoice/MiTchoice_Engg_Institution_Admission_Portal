import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const answers = body?.answers ?? {};

    const quizSession = await prisma.quizSession.findUnique({
      where: { userId: session.user.id },
    });

    if (!quizSession || quizSession.status === "COMPLETED") {
      return NextResponse.json({ error: "No active quiz session" }, { status: 400 });
    }

    await prisma.quizSession.update({
      where: { userId: session.user.id },
      data: {
        answers: JSON.stringify(answers),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Save answers error:", error);
    return NextResponse.json({ error: "Failed to save answers" }, { status: 500 });
  }
}
