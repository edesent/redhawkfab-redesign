import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Kept in lock-step with ACCEPTED_EXT in src/components/QuoteForm.tsx */
const ACCEPTED_EXT = new Set([
  "pdf", "dwg", "dxf", "dwf", "step", "stp", "igs", "iges", "sldprt", "sldasm", "slddrw",
  "x_t", "x_b", "sat", "ipt", "iam", "prt", "catpart", "3dm", "stl", "obj",
  "png", "jpg", "jpeg", "heic", "tif", "tiff", "zip", "xlsx", "xls", "csv", "doc", "docx",
]);
const MAX_FILE_BYTES = 50 * 1024 * 1024;

/**
 * Issues short-lived client tokens so the browser can put a print or CAD file
 * straight into Blob storage — which is how a 40 MB STEP file gets past the
 * 4.5 MB body limit on a Vercel function. Files land under quotes/ with a
 * random suffix, so the URL is unguessable; the email carries the link.
 */
export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: "uploads-not-configured" }, { status: 503 });
  }
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const ext = pathname.split(".").pop()?.toLowerCase() ?? "";
        if (!pathname.startsWith("quotes/") || pathname.includes("..") || !ACCEPTED_EXT.has(ext)) {
          throw new Error("That file type is not accepted.");
        }
        return {
          // CAD exporters label files inconsistently (often octet-stream), so
          // the extension check above is the real gate.
          allowedContentTypes: ["application/*", "image/*", "model/*", "text/*", "drawing/*"],
          maximumSizeInBytes: MAX_FILE_BYTES,
          addRandomSuffix: true,
          validUntil: Date.now() + 10 * 60 * 1000,
          tokenPayload: JSON.stringify({ at: Date.now() }),
        };
      },
      onUploadCompleted: async () => {
        /* The quote email is what records the upload; nothing else to do. */
      },
    });
    return Response.json(json);
  } catch (e) {
    return Response.json({ error: (e as Error).message || "Upload refused." }, { status: 400 });
  }
}
