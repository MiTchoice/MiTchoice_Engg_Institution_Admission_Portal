import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

// Required for file uploads
export const config = {
  api: { bodyParser: false },
};

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if already submitted
    const existing = await prisma.admission.findUnique({
      where: { userId: session.user.id },
    });
    if (existing) {
      return NextResponse.json({ error: "Admission already submitted" }, { status: 409 });
    }

    // Check branch chosen
    const branchChoice = await prisma.branchChoice.findUnique({
      where: { userId: session.user.id },
    });
    if (!branchChoice) {
      return NextResponse.json({ error: "Please choose a branch first" }, { status: 400 });
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const dob = (formData.get("dob") as string)?.trim();
    const gender = (formData.get("gender") as string)?.trim();
    const address = (formData.get("address") as string)?.trim();
    const tenthStr = formData.get("tenthPercent") as string;
    const twelfthStr = formData.get("twelfthPercent") as string;
    const pcmStr = formData.get("pcmPercent") as string;
    const photo = formData.get("photo") as File | null;
    const marksheet = formData.get("marksheet") as File | null;

    // Validate required fields
    if (!dob) return NextResponse.json({ error: "Date of birth is required" }, { status: 400 });
    if (!gender) return NextResponse.json({ error: "Gender is required" }, { status: 400 });
    if (!address || address.length < 10) return NextResponse.json({ error: "Please enter a complete address" }, { status: 400 });

    const tenthPercent = parseFloat(tenthStr);
    const twelfthPercent = parseFloat(twelfthStr);
    const pcmPercent = parseFloat(pcmStr);

    if (isNaN(tenthPercent) || tenthPercent < 0 || tenthPercent > 100) {
      return NextResponse.json({ error: "Invalid 10th percentage (0-100)" }, { status: 400 });
    }
    if (isNaN(twelfthPercent) || twelfthPercent < 0 || twelfthPercent > 100) {
      return NextResponse.json({ error: "Invalid 12th percentage (0-100)" }, { status: 400 });
    }
    if (isNaN(pcmPercent) || pcmPercent < 0 || pcmPercent > 100) {
      return NextResponse.json({ error: "Invalid PCM percentage (0-100)" }, { status: 400 });
    }

    // Handle file uploads
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    let photoUrl = "";
    let marksheetUrl = "";

    const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/jpg"];
    const ALLOWED_MARKSHEET = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    const MAX_SIZE = 500 * 1024; // 500 KB

    if (photo && photo.size > 0) {
      if (!ALLOWED_IMAGE.includes(photo.type)) {
        return NextResponse.json({ error: "Photo must be JPG or PNG" }, { status: 400 });
      }
      if (photo.size > MAX_SIZE) {
        return NextResponse.json({ error: "Photo exceeds 500 KB limit" }, { status: 400 });
      }
      const ext = photo.name.split(".").pop() ?? "jpg";
      const filename = `photo_${uuidv4()}.${sanitizeFilename(ext)}`;
      const bytes = await photo.arrayBuffer();
      await writeFile(join(uploadDir, filename), Buffer.from(bytes));
      photoUrl = `/uploads/${filename}`;
    }

    if (marksheet && marksheet.size > 0) {
      if (!ALLOWED_MARKSHEET.includes(marksheet.type)) {
        return NextResponse.json({ error: "Marksheet must be JPG, PNG, or PDF" }, { status: 400 });
      }
      if (marksheet.size > MAX_SIZE) {
        return NextResponse.json({ error: "Marksheet exceeds 500 KB limit" }, { status: 400 });
      }
      const ext = marksheet.name.split(".").pop() ?? "pdf";
      const filename = `ms_${uuidv4()}.${sanitizeFilename(ext)}`;
      const bytes = await marksheet.arrayBuffer();
      await writeFile(join(uploadDir, filename), Buffer.from(bytes));
      marksheetUrl = `/uploads/${filename}`;
    }

    await prisma.admission.create({
      data: {
        userId: session.user.id,
        dob,
        gender,
        address,
        tenthPercent,
        twelfthPercent,
        pcmPercent,
        photoUrl,
        marksheetUrl,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Admission error:", msg);
    return NextResponse.json({ error: "Failed to submit admission form" }, { status: 500 });
  }
}
