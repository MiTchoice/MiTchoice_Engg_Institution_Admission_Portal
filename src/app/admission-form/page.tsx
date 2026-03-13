import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdmissionFormClient } from "@/components/admission-form-client";

export default async function AdmissionFormPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { branchChoice: true, admission: true },
  });

  if (!user?.branchChoice) redirect("/branch-choice");
  if (user.admission) redirect("/admission-letter");

  return (
    <AdmissionFormClient
      user={{ name: user.name, email: user.email, phone: user.phone ?? "" }}
      branch={user.branchChoice.branch}
    />
  );
}
