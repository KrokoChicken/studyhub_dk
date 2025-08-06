// app/api/topics/add/route.ts
import { db } from "@/db/drizzle";
import { topics } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name, subjectId } = await req.json();

  if (!name || !subjectId) {
    return NextResponse.json({ error: "Ugyldig data" }, { status: 400 });
  }

  const result = await db.insert(topics).values({ name, subjectId });
  return NextResponse.json({ success: true });
}