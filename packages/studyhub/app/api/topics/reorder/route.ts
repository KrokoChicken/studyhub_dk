import { db } from "@/db/drizzle";
import { topics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type TopicOrder = {
  id: number;
  order: number;
};

export async function POST(req: Request) {
  const body = await req.json();
  const topicOrders: TopicOrder[] = body.topicOrders;

  if (!Array.isArray(topicOrders)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  for (const { id, order } of topicOrders) {
    await db.update(topics).set({ order }).where(eq(topics.id, id));
  }

  return NextResponse.json({ message: "Order updated" });
}