import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { collabNotes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest
) {
  try {
    const url = new URL(req.url);
    const segments = url.pathname.split("/");
    const roomId = segments[segments.length - 1];

    if (!roomId) {
      return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
    }

    const note = await db
      .select()
      .from(collabNotes)
      .where(eq(collabNotes.roomId, roomId))
      .limit(1)
      .then((res) => res[0]);

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (!note.ydocState) {
      return NextResponse.json(
        { error: "Empty ydocState in DB" },
        { status: 500 }
      );
    }

    const ydocStateBase64 = Buffer.from(note.ydocState).toString("base64"); // ✅ use Buffer.from

    return NextResponse.json({
      note: {
        id: note.id,
        title: note.title,
        createdByUserId: note.createdByUserId,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        roomId: note.roomId,
        collaborators: note.collaborators,
        ydocState: ydocStateBase64,
      },
    });
  } catch (error) {
    console.error("Get collab note error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}