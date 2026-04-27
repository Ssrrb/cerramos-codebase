import { withToolbar } from "@repo/feature-flags/lib/toolbar";
import { config, withAnalyzer } from "@repo/next-config";
import { withLogging, withSentry } from "@repo/observability/next-config";
import type { NextConfig } from "next";
import { env } from "@/env";

let nextConfig: NextConfig = withToolbar(withLogging(config));

nextConfig.images = nextConfig.images ?? {};
nextConfig.images.localPatterns = nextConfig.images.localPatterns ?? [];
nextConfig.images.localPatterns.push({
  pathname: "/api/products/image",
});

nextConfig.images.remotePatterns = nextConfig.images.remotePatterns ?? [];
nextConfig.images.remotePatterns.push({
  protocol: "https",
  hostname: "images.pexels.com",
});

if (env.VERCEL) {
  nextConfig = withSentry(nextConfig);
}

if (env.ANALYZE === "true") {
  nextConfig = withAnalyzer(nextConfig);
}

export default nextConfig;
