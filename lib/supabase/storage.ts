/**
 * Supabase Storage yardımcıları — bucket adları + content-type eşlemesi.
 * Bucket'lar public; scripts/supabase-bootstrap.mjs oluşturur.
 */
export const BUCKETS = {
	images: process.env.SUPABASE_BUCKET_IMAGES ?? "images",
	demos: process.env.SUPABASE_BUCKET_DEMOS ?? "demos",
	downloads: process.env.SUPABASE_BUCKET_DOWNLOADS ?? "downloads",
} as const;

const CONTENT_TYPES: Record<string, string> = {
	".html": "text/html; charset=utf-8",
	".htm": "text/html; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".mjs": "text/javascript; charset=utf-8",
	".json": "application/json",
	".map": "application/json",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".webp": "image/webp",
	".gif": "image/gif",
	".svg": "image/svg+xml",
	".ico": "image/x-icon",
	".woff": "font/woff",
	".woff2": "font/woff2",
	".ttf": "font/ttf",
	".otf": "font/otf",
	".eot": "application/vnd.ms-fontobject",
	".txt": "text/plain; charset=utf-8",
	".xml": "application/xml",
	".mp4": "video/mp4",
	".webm": "video/webm",
	".mp3": "audio/mpeg",
	".ogg": "audio/ogg",
};

export function contentTypeFor(ext: string): string {
	return CONTENT_TYPES[ext.toLowerCase()] ?? "application/octet-stream";
}
