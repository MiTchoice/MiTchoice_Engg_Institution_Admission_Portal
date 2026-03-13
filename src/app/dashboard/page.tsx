import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDate, getEligibleBranches } from "@/lib/utils";
import { DashboardStepper } from "@/components/dashboard/stepper";
import Link from "next/link";

export default async function DashboardPage() {
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

  if (!user) redirect("/auth/login");

  const quizDone = user.quizSession?.status === "COMPLETED";
  const branchChosen = !!user.branchChoice;
  const admissionDone = !!user.admission;
  const percentage = user.quizSession?.percentage ?? 0;
  const eligibleBranches = quizDone ? getEligibleBranches(percentage) : [];

  const steps = [
    { label: "Register", done: true, href: null },
    { label: "Attempt Quiz", done: quizDone, href: "/quiz" },
    { label: "View Score", done: quizDone, href: "/score-card" },
    { label: "Choose Branch", done: branchChosen, href: "/branch-choice" },
    { label: "Fill Form", done: admissionDone, href: "/admission-form" },
    { label: "Download Letter", done: admissionDone, href: "/admission-letter" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-[#0D47A1] to-[#1976D2] rounded-2xl p-8 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Welcome, {user.name}! 👋
        </h1>
        <p className="text-blue-100">
          Track your admission progress below. Complete each step to secure your seat.
        </p>
        <p className="text-blue-200 text-sm mt-2">
          Registered on {formatDate(user.createdAt)}
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Your Progress</h2>
        <DashboardStepper steps={steps} />
      </div>

      {/* Quick Stats */}
      {quizDone && user.quizSession && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Net Score", value: user.quizSession.netScore?.toFixed(0) ?? "—", color: "text-blue-600" },
            { label: "Percentage", value: `${percentage.toFixed(1)}%`, color: "text-green-600" },
            { label: "Correct", value: user.quizSession.correct ?? "—", color: "text-emerald-600" },
            { label: "Incorrect", value: user.quizSession.incorrect ?? "—", color: "text-red-500" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-center">
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Eligible Branches */}
      {quizDone && eligibleBranches.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Your Eligible Branches
          </h2>
          <div className="flex flex-wrap gap-2">
            {eligibleBranches.map((branch) => (
              <span
                key={branch}
                className="px-4 py-2 bg-blue-50 dark:bg-blue-950 text-[#0D47A1] dark:text-blue-300 rounded-full font-semibold text-sm border border-blue-200 dark:border-blue-800"
              >
                {branch}
              </span>
            ))}
          </div>
          {user.branchChoice && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              ✅ You have chosen: <strong className="text-[#0D47A1]">{user.branchChoice.branch}</strong>
            </p>
          )}
        </div>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {!quizDone && (
          <Link
            href="/quiz"
            className="bg-gradient-to-br from-[#0D47A1] to-[#1565C0] text-white rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group"
          >
            <div className="text-3xl mb-3">📝</div>
            <h3 className="font-bold text-lg mb-1">Start Quiz</h3>
            <p className="text-blue-100 text-sm">100 questions • 120 minutes • +4/-1 marking</p>
            <div className="mt-4 text-[#FFC107] text-sm font-semibold group-hover:translate-x-1 transition-transform">
              Begin Now →
            </div>
          </Link>
        )}

        {quizDone && (
          <Link
            href="/score-card"
            className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group"
          >
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-bold text-lg mb-1">View Score Card</h3>
            <p className="text-green-100 text-sm">Download your official score card PDF</p>
            <div className="mt-4 text-[#FFC107] text-sm font-semibold group-hover:translate-x-1 transition-transform">
              View Score →
            </div>
          </Link>
        )}

        {quizDone && !branchChosen && eligibleBranches.length > 0 && (
          <Link
            href="/branch-choice"
            className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group"
          >
            <div className="text-3xl mb-3">🎓</div>
            <h3 className="font-bold text-lg mb-1">Choose Branch</h3>
            <p className="text-purple-100 text-sm">{eligibleBranches.length} branches available for you</p>
            <div className="mt-4 text-[#FFC107] text-sm font-semibold group-hover:translate-x-1 transition-transform">
              Choose Now →
            </div>
          </Link>
        )}

        {branchChosen && !admissionDone && (
          <Link
            href="/admission-form"
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group"
          >
            <div className="text-3xl mb-3">📋</div>
            <h3 className="font-bold text-lg mb-1">Admission Form</h3>
            <p className="text-orange-100 text-sm">Fill your details and upload documents</p>
            <div className="mt-4 text-[#FFC107] text-sm font-semibold group-hover:translate-x-1 transition-transform">
              Fill Form →
            </div>
          </Link>
        )}

        {admissionDone && (
          <Link
            href="/admission-letter"
            className="bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group"
          >
            <div className="text-3xl mb-3">📄</div>
            <h3 className="font-bold text-lg mb-1">Admission Letter</h3>
            <p className="text-teal-100 text-sm">Download your provisional admission letter</p>
            <div className="mt-4 text-[#FFC107] text-sm font-semibold group-hover:translate-x-1 transition-transform">
              Download →
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
