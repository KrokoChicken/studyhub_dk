import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server-only
const BUCKET = "note-images";

function publicUrlToPath(publicUrl: string) {
  // https://<proj>.supabase.co/storage/v1/object/public/note-images/notes/file.png
  const prefix = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
  if (!publicUrl.startsWith(prefix)) return null;
  return publicUrl.slice(prefix.length); // "notes/file.png"
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

    const path = publicUrlToPath(url);
    if (!path) return NextResponse.json({ error: "URL not in expected bucket" }, { status: 400 });

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { error } = await supabase.storage.from(BUCKET).remove([path]);

    // Treat "not found" as success (idempotent)
    if (error && !/not found/i.test(error.message || "")) {
      console.error("Storage delete error:", error);
      return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Delete image API error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}