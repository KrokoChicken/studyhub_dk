import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function uploadToSupabase(file: File): Promise<string> {
  const sanitizedName = file.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.\-_]/g, "_");

  const filePath = `notes/${Date.now()}-${sanitizedName}`;

  const { data, error } = await supabase.storage
    .from("note-images")
    .upload(filePath, file, {
      upsert: true, // ✅ ensures overwrite works without silent fail
    });

  if (error) {
    console.error("Supabase upload error:", error);
    throw new Error("Failed to upload image");
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("note-images").getPublicUrl(filePath);

  return publicUrl;
}