import type { MetadataRoute } from "next";
import { abs } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: "*",
      allow: "/",
      // Private or per-visitor pages carry no search value.
      disallow: ["/admin", "/api/", "/*/cart", "/*/checkout", "/*/account", "/*/order/", "/*/login", "/*/register", "/*/wishlist"],
    }],
    sitemap: abs("/sitemap.xml"),
  };
}
