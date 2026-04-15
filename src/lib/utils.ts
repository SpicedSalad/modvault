import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertDriveLink(url: string | null | undefined): string {
  if (!url) return '';
  // Google recently deprecated and blocked the /uc?export=view endpoint for hotlinking images.
  // We must now use the /thumbnail endpoint to bypass the strict CORS and 403 blocks.

  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  }
  return url;
}

export function parseTag(tagRaw: any): string {
  if (typeof tagRaw === 'string') {
    if (tagRaw.startsWith('{')) {
      try {
        const obj = JSON.parse(tagRaw);
        return obj.name || tagRaw;
      } catch (e) {
        return tagRaw;
      }
    }
    return tagRaw;
  } else if (tagRaw && typeof tagRaw === 'object') {
    return tagRaw.name || String(tagRaw);
  }
  return String(tagRaw);
}
