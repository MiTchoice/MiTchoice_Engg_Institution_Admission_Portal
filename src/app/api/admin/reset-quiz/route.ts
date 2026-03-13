import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const userId = body?.userId as string;
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Verify the user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.role === "ADMIN") {
      return NextResponse.json({ error: "Cannot reset admin user" }, { status: 403 });
    }

    // Delete in correct order (admission -> branchChoice -> quizSession)
    await prisma.admission.deleteMany({ where: { userId } });
    await prisma.branchChoice.deleteMany({ where: { userId } });
    await prisma.quizSession.deleteMany({ where: { userId } });

    return NextResponse.json({ success: true, message: "Quiz and admission data reset" });
  } catch (error: unknown) {
    console.error("Reset quiz error:", error);
    return NextResponse.json({ error: "Failed to reset quiz" }, { status: 500 });
  }
}
