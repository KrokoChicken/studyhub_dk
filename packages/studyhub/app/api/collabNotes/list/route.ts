import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { collabNotes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // make sure this path is correct

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id);

  try {
    const notes = await db
      .select({
        roomId: collabNotes.roomId,
        title: collabNotes.title,
        updatedAt: collabNotes.updatedAt,
      })
      .from(collabNotes)
      .where(eq(collabNotes.createdByUserId, userId))
      .orderBy(collabNotes.updatedAt);

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Fetch collab notes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}