"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface Step {
  label: string;
  done: boolean;
  href: string | null;
}

export function DashboardStepper({ steps }: { steps: Step[] }) {
  return (
    <div className="flex items-center justify-between overflow-x-auto pb-2">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center min-w-0">
          {/* Step */}
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                step.done
                  ? "bg-[#0D47A1] border-[#0D47A1] text-white"
                  : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-400"
              }`}
            >
              {step.done ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </motion.div>
            <div className="mt-2 text-center">
              {step.href && !step.done ? (
                <Link
                  href={step.href}
                  className="text-xs font-medium text-[#0D47A1] dark:text-blue-400 hover:underline whitespace-nowrap"
                >
                  {step.label}
                </Link>
              ) : (
                <p className={`text-xs font-medium whitespace-nowrap ${
                  step.done ? "text-[#0D47A1] dark:text-blue-400" : "text-gray-400 dark:text-gray-600"
                }`}>
                  {step.label}
                </p>
              )}
            </div>
          </div>

          {/* Line */}
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-2 min-w-[20px] transition-colors duration-500 ${
                step.done ? "bg-[#0D47A1]" : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
