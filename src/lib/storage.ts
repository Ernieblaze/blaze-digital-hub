/**
 * Product image uploads → Supabase Storage — SERVER ONLY.
 * The bucket is created automatically on first upload (public read),
 * so there's nothing to set up in the Supabase dashboard.
 */

import { supabaseAdmin } from "@/lib/supabase";

const BUCKET = "product-images";
const MAX_BYTES = 6 * 1024 * 1024; // 6MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function uploadProductImage(
  file: File,
  slug: string
): Promise<{ url?: string; error?: string }> {
  const supabase = supabaseAdmin();
  if (!supabase) return { error: "Connect Supabase to upload images." };

  if (!ALLOWED.includes(file.type)) {
    return { error: "Use a JPG, PNG, WebP or GIF image." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "Image is too large — keep it under 6MB." };
  }

  // Ensure the bucket exists (ignore "already exists").
  await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const path = `${slug}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: true,
  });
  if (error) {
    console.error("[storage] upload failed:", error.message);
    return { error: "Upload failed — try again or use an image URL instead." };
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}
