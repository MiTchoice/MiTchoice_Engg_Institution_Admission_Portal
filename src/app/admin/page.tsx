import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminClient } from "@/components/admin/admin-client";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [users, questions, sessions] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT" },
      include: { quizSession: true, branchChoice: true, admission: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.question.count(),
    prisma.quizSession.count(),
  ]);

  return (
    <AdminClient
      users={users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone ?? "",
        createdAt: u.createdAt.toISOString(),
        quizStatus: u.quizSession?.status ?? "NOT_STARTED",
        netScore: u.quizSession?.netScore ?? null,
        percentage: u.quizSession?.percentage ?? null,
        branch: u.branchChoice?.branch ?? null,
        admissionDone: !!u.admission,
      }))}
      stats={{ totalStudents: users.length, questions, sessions }}
    />
  );
}
