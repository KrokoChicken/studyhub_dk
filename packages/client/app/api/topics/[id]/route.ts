import { db } from "@/db/drizzle";
import { topics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Await the request's params property (Next.js internal)
  const { params } = await (request as any).nextUrl || {};

  // OR, better: get params from the request's context (if available)
  // (this part depends on Next.js version and types)

  // For now fallback:
  const url = new URL(request.url);
  const idStr = url.pathname.split("/").pop() || "";
  const topicId = parseInt(idStr);

  if (isNaN(topicId)) {
    return NextResponse.json({ error: "Ugyldigt ID" }, { status: 400 });
  }

  const [topic] = await db
    .select({
      id: topics.id,
      name: topics.name,
      note: topics.note,
      order: topics.order,  // Add this line
    })
    .from(topics)
    .where(eq(topics.id, topicId));

  if (!topic) {
    return NextResponse.json({ error: "Emne ikke fundet" }, { status: 404 });
  }

  return NextResponse.json(topic);
}