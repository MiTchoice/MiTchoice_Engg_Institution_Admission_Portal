import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDate, getBranchFullName } from "@/lib/utils";
import { AdmissionLetterClient } from "@/components/admission-letter-client";

export default async function AdmissionLetterPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      quizSession: true,
      branchChoice: true,
      admission: true,
    },
  });

  if (!user?.admission) redirect("/admission-form");

  const admissionDate = new Date(user.admission.submittedAt);
  const feeDeadline = new Date(admissionDate);
  feeDeadline.setDate(feeDeadline.getDate() + 15);

  return (
    <AdmissionLetterClient
      student={{
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        branch: user.branchChoice?.branch ?? "CSE",
        score: user.quizSession?.netScore ?? 0,
        percentage: user.quizSession?.percentage ?? 0,
        admissionDate: formatDate(admissionDate),
        feeDeadline: formatDate(feeDeadline),
        dob: user.admission.dob,
        gender: user.admission.gender,
      }}
    />
  );
}
