import path from "node:path";
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image (`npm start` keeps using `next start`).
  output: process.env.STANDALONE === "1" ? "standalone" : undefined,
  outputFileTracingRoot: path.join(__dirname),
  poweredByHeader: false,
  // Native/driver packages for Turso must stay outside the webpack bundle.
  serverExternalPackages: ["@prisma/adapter-libsql", "@libsql/client", "libsql"],
  // Product photos are uploaded through a server action.
  experimental: { serverActions: { bodySizeLimit: "10mb" } },
  images: {
    formats: ["image/avif", "image/webp"],
    // Admin uploads on Vercel live in Vercel Blob.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/img/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }] },
    ];
  },
};

export default nextConfig;
