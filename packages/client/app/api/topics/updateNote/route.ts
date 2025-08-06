// app/api/topics/updateNote.ts

import { db } from "@/db/drizzle";
import { topics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { topicId, content } = await req.json();

  if (!topicId || typeof content !== "string") {
    return NextResponse.json({ error: "Ugyldig data" }, { status: 400 });
  }

  await db
    .update(topics)
    .set({ note: content })
    .where(eq(topics.id, topicId));

  return NextResponse.json({ success: true });
}