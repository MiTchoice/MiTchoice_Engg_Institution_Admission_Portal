import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { QuizClient } from "@/components/quiz/quiz-client";

export default async function QuizPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const quizSession = await prisma.quizSession.findUnique({
    where: { userId: session.user.id },
  });

  if (quizSession?.status === "COMPLETED") {
    redirect("/score-card");
  }

  return <QuizClient userId={session.user.id} />;
}
