import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { DEVELOPER } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MITChoice Engineering Admissions 2025",
  description: "Online Admission Portal for MITChoice Engineering Institution — Entrance Test & Branch Allocation",
  authors: [{ name: DEVELOPER.name }],
  keywords: ["engineering admission", "entrance test", "MITChoice", "NIT Hamirpur"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
            <main className="flex-1">{children}</main>
            {/* Developer credit footer */}
            <footer className="py-3 px-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Designed &amp; Developed by{" "}
                <span className="font-bold text-[#0D47A1] dark:text-blue-400">{DEVELOPER.name}</span>
                {" "}·{" "}
                <span className="font-semibold">{DEVELOPER.degree}</span>
                {" "}·{" "}
                <span className="font-semibold">{DEVELOPER.institution}</span>
              </p>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
