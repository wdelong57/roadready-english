import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "english.freedomusa.net",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
