import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, phone, password } = result.data;

    // Check DB connectivity first
    try {
      await prisma.$connect();
    } catch (dbErr) {
      console.error("DB connection failed:", dbErr);
      return NextResponse.json(
        { error: "Database not ready. Run: npx prisma db push && npm run seed" },
        { status: 503 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: { name: name.trim(), email: email.toLowerCase().trim(), phone, password: hashedPassword, role: "STUDENT" },
    });

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Register error:", msg);

    // Prisma table not found = DB not migrated
    if (msg.includes("does not exist") || msg.includes("no such table") || msg.includes("P2021")) {
      return NextResponse.json(
        { error: "Database tables missing. Run: npx prisma db push && npm run seed" },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
