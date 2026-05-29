import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Allow large file uploads through server actions; Cloudinary handles
      // anything over 100 MB via chunked uploadLarge on the backend.
      bodySizeLimit: "1gb",
    },
  },
};

export default withNextIntl(nextConfig);
