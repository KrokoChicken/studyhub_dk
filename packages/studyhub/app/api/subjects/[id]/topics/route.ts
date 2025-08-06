import { db } from "@/db/drizzle";
import { topics, subjects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parts = url.pathname.split("/");
  const idStr = parts[parts.length - 2]; // because pathname is like /api/subjects/[id]/topics
  const subjectId = parseInt(idStr);

  if (isNaN(subjectId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const [subject] = await db
    .select({ name: subjects.name })
    .from(subjects)
    .where(eq(subjects.id, subjectId));

  if (!subject) {
    return NextResponse.json({ error: "Subject not found" }, { status: 404 });
  }

  const topicList = await db
    .select()
    .from(topics)
    .where(eq(topics.subjectId, subjectId));

  return NextResponse.json({
    name: subject.name,
    topics: topicList,
  });
}