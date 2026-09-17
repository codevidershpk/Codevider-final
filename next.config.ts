import type { NextConfig } from "next";

/** Static export for S3 / Cloudflare Pages (`out/`). */
const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["192.168.4.66"],
};

export default nextConfig;
