import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {};
  let healthy = true;

  // Check DB connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch (e: unknown) {
    checks.database = `error: ${e instanceof Error ? e.message : String(e)}`;
    healthy = false;
  }

  // Check question count
  try {
    const count = await prisma.question.count();
    checks.questions = count > 0 ? `ok (${count})` : "warning: 0 questions — run npm run seed";
    if (count === 0) healthy = false;
  } catch {
    checks.questions = "error: cannot count questions";
    healthy = false;
  }

  return NextResponse.json(
    { healthy, checks, timestamp: new Date().toISOString() },
    { status: healthy ? 200 : 503 }
  );
}
