"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GearIcon } from "@/components/ui/gear-icon";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useState } from "react";

interface NavProps {
  user: { name: string; email: string; role: string };
}

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/quiz", label: "Quiz" },
  { href: "/score-card", label: "Score Card" },
  { href: "/branch-choice", label: "Choose Branch" },
  { href: "/admission-form", label: "Admission Form" },
  { href: "/admission-letter", label: "Admission Letter" },
];

export function DashboardNav({ user }: NavProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <GearIcon size={36} />
            <div className="hidden sm:block">
              <p className="font-bold text-[#0D47A1] dark:text-blue-400 text-sm leading-none">MITChoice</p>
              <p className="text-xs text-gray-500">Engineering Admissions</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href || pathname.startsWith(item.href + "/")
                    ? "bg-[#0D47A1] text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="px-3 py-2 rounded-lg text-sm font-medium text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
              <div className="w-7 h-7 rounded-full bg-[#0D47A1] flex items-center justify-center text-white text-xs font-bold">
                {user.name[0].toUpperCase()}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 max-w-[120px] truncate">{user.name}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="hidden sm:flex items-center gap-1 text-sm text-red-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden py-3 border-t border-gray-100 dark:border-gray-800">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium mb-1 transition-colors ${
                  pathname === item.href
                    ? "bg-[#0D47A1] text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
