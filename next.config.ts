import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Явно фіксуємо корінь воркспейсу (є кілька lockfile у батьківських теках).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
