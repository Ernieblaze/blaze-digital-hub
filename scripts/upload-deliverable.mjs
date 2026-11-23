// Upload a paid file into the PRIVATE Supabase bucket "deliverables".
//
// Usage (from the project folder, with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local):
//   node --env-file=.env.local scripts/upload-deliverable.mjs <local-file.pdf> <path-in-bucket>
// Example:
//   node --env-file=.env.local scripts/upload-deliverable.mjs "C:/…/Remote-Job-Blueprint-Naija.pdf" remote-job-blueprint/v1.pdf
//
// Then set the product's Download link to:  private:<path-in-bucket>   e.g. private:remote-job-blueprint/v1.pdf

import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const [, , localFile, bucketPath] = process.argv;
if (!localFile || !bucketPath) {
  console.error("Usage: node --env-file=.env.local scripts/upload-deliverable.mjs <local-file> <path-in-bucket>");
  process.exit(1);
}
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const BUCKET = "deliverables";

// Make sure the bucket exists and is PRIVATE.
const { data: buckets } = await supabase.storage.listBuckets();
if (!buckets?.some((b) => b.id === BUCKET)) {
  const { error } = await supabase.storage.createBucket(BUCKET, { public: false });
  if (error) throw error;
  console.log(`Created private bucket "${BUCKET}".`);
} else if (buckets.find((b) => b.id === BUCKET)?.public) {
  await supabase.storage.updateBucket(BUCKET, { public: false });
  console.log(`Bucket "${BUCKET}" was public; switched it to private.`);
}

const body = await readFile(localFile);
const { error } = await supabase.storage.from(BUCKET).upload(bucketPath, body, {
  contentType: "application/pdf",
  upsert: true,
});
if (error) throw error;
console.log(`Uploaded ${localFile} → ${BUCKET}/${bucketPath} (${Math.round(body.length / 1024)} KB)`);
console.log(`Product download link to use:  private:${bucketPath}`);
