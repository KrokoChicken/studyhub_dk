import { db } from "@/db/drizzle";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { subjects } from "@/db/schema";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json([], { status: 401 });
  }

  const data = await db
    .select()
    .from(subjects)
    .where(eq(subjects.userId, parseInt(session.user.id)));

  return NextResponse.json(data);
}