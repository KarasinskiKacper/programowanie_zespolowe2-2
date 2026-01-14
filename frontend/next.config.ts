import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BASE_BACKEND_API_URL: process.env.BASE_BACKEND_API_URL,
  },
};

export default nextConfig;
