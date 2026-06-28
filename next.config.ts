import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project (a stray lockfile exists in the
  // home directory, which would otherwise be inferred as the root).
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
