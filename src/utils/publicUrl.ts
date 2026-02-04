import type { Request } from "express";

export function toPublicUrl(req: Request, value: string) {
  const v = value.trim();
  if (/^https?:\/\//i.test(v)) return v;
  const host = req.get("host");
  if (!host) return v;
  if (v.startsWith("/")) return `${req.protocol}://${host}${v}`;
  return `${req.protocol}://${host}/${v}`;
}

export function withPublicProductImageUrl(req: Request, product: any) {
  if (!product || typeof product !== "object") return product;
  const imageUrl = (product as any).image_url;
  if (typeof imageUrl !== "string" || imageUrl.trim().length === 0) return product;
  return { ...(product as any), image_url: toPublicUrl(req, imageUrl) };
}

export function withPublicProductImageUrls(req: Request, products: any[]) {
  if (!Array.isArray(products)) return products as any;
  return products.map((p) => withPublicProductImageUrl(req, p));
}

