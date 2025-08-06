import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { collabNotes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const roomId = params.roomId; // no await here!

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

    const ydocStateBase64 = note.ydocState.toString("base64");

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