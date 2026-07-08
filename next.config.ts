import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "www.gutenberg.org" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" }
    ]
  }
};

export default nextConfig;
