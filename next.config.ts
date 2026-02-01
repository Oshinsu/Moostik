import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // NOTE: Removed output: "standalone" - @netlify/plugin-nextjs manages build output
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
      {
        protocol: "https",
        hostname: "*.replicate.delivery",
      },
    ],
  },
  
  // Externalize heavy packages from serverless bundle
  serverExternalPackages: ["sharp", "jszip"],
  
  turbopack: {
    root: path.resolve(__dirname),
  },
  
  // Optimize bundle
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
};

export default nextConfig;
