import Link from "next/link";
import { GearIcon } from "@/components/ui/gear-icon";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D47A1] via-[#1565C0] to-[#1976D2] flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-3 mb-8">
        <GearIcon size={50} />
        <div>
          <p className="text-white font-bold text-xl">MITChoice</p>
          <p className="text-blue-200 text-sm">Engineering Admissions 2025</p>
        </div>
      </Link>
      <div className="w-full max-w-md">
        {children}
      </div>
      <p className="mt-8 text-blue-200 text-sm text-center">
        © 2025 MITChoice Engineering Institution
      </p>
    </div>
  );
}
