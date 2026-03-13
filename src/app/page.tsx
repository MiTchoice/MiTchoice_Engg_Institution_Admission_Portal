import Link from "next/link";
import { GearIcon } from "@/components/ui/gear-icon";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D47A1] via-[#1565C0] to-[#1976D2] flex flex-col">
      {/* Navbar */}
      <nav className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GearIcon size={40} />
          <div>
            <p className="text-white font-bold text-lg leading-none">MITChoice</p>
            <p className="text-blue-200 text-xs">Engineering Admissions</p>
          </div>
        </div>
        <div className="text-white text-sm font-medium bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
          2025 – 26 Session
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="mb-8">
          <GearIcon size={100} className="mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
            MITChoice Engineering<br />
            <span className="text-[#FFC107]">Admissions 2025</span>
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Join India's premier engineering institution. Attempt our online entrance test
            and secure admission to your dream branch.
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-8 justify-center mb-12">
          {[
            { label: "Engineering Branches", value: "6+" },
            { label: "Question Bank", value: "600+" },
            { label: "Seats Available", value: "2000+" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-black text-[#FFC107]">{stat.value}</p>
              <p className="text-blue-200 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center gap-2 bg-[#FFC107] hover:bg-[#FFB300] text-gray-900 font-bold px-10 py-4 rounded-xl text-lg transition-all duration-200 hover:shadow-2xl hover:shadow-yellow-400/30 hover:-translate-y-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            New Student – Register
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-10 py-4 rounded-xl text-lg border border-white/30 backdrop-blur-sm transition-all duration-200 hover:-translate-y-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Existing Student – Login
          </Link>
        </div>
      </main>

      {/* How it works */}
      <section className="bg-white/5 backdrop-blur-sm border-t border-white/10 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-white text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Register", desc: "Create your account" },
              { step: "02", title: "Attempt Quiz", desc: "100 MCQs in 120 mins" },
              { step: "03", title: "Choose Branch", desc: "Based on your score" },
              { step: "04", title: "Get Letter", desc: "Download admission letter" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#FFC107] text-gray-900 font-black text-lg flex items-center justify-center mx-auto mb-3">
                  {item.step}
                </div>
                <p className="text-white font-semibold">{item.title}</p>
                <p className="text-blue-200 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="text-center py-4 text-blue-200 text-sm">
        © 2025 MITChoice Engineering Institution. All rights reserved.
      </footer>
    </div>
  );
}
// Developer credit is rendered in layout.tsx footer
