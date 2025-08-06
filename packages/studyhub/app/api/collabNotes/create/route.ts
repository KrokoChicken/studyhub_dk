import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { collabNotes } from "@/db/schema";
import { randomBytes } from "crypto";
import * as Y from "yjs";
import { Buffer } from "buffer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Adjust if path differs

export async function POST(req: NextRequest) {
  try {
    // ✅ Get user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title } = await req.json();

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Missing or invalid title" }, { status: 400 });
    }

    // ✅ Ensure numeric ID (Drizzle expects `number`)
    const createdByUserId = Number(session.user.id);

    if (Number.isNaN(createdByUserId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Generate unique roomId
    const roomId = randomBytes(4).toString("hex");

    // Initialize empty Y.Doc structure for ProseMirror
    const ydoc = new Y.Doc();
    const prosemirrorFragment = ydoc.getXmlFragment("prosemirror");
    const docNode = new Y.XmlElement("doc");
    const paragraphNode = new Y.XmlElement("paragraph");
    docNode.push([paragraphNode]);
    prosemirrorFragment.push([docNode]);

    const ydocStateBuffer = Buffer.from(Y.encodeStateAsUpdate(ydoc));

    // ✅ Insert into database
    const result = await db
      .insert(collabNotes)
      .values({
        title,
        createdByUserId,
        roomId,
        ydocState: ydocStateBuffer,
        collaborators: JSON.stringify([]),
      })
      .returning();

    return NextResponse.json({ success: true, note: result[0] });
  } catch (error) {
    console.error("Create collab note error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}