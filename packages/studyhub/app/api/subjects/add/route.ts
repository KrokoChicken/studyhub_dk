import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { subjects } from "@/db/schema";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });
  }

  const body = await req.json();
  const { name } = body;

  if (!name || name.trim() === "") {
    return NextResponse.json({ error: "Navn på fag er påkrævet" }, { status: 400 });
  }

  await db.insert(subjects).values({
    userId: parseInt(session.user.id),
    name: name.trim(),
  });

  return NextResponse.json({ success: true });
}