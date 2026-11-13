/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "@/env.js";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  cacheComponents: true,
  /** Off — was prefetching dashboard RSC from login and bouncing with auth redirects. */
  partialPrefetching: false,
  reactCompiler: true,
  turbopack: {
    rules: {
      // Tailwind v4 only on app entry stylesheets — plain token files under src/styles/
      // must not go through @tailwindcss/turbopack (dev mis-bundles them as client modules).
      "./src/app/**/*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
