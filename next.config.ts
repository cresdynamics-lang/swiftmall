import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Runtime uploads are served by /uploads/[...path], not the public/ static map.
    localPatterns: [
      { pathname: "/products/**" },
      { pathname: "/hero/**" },
      { pathname: "/brand/**" },
      { pathname: "/categories/**" },
      { pathname: "/uploads/**" },
    ],
  },
  async rewrites() {
    // Legacy paths written into public/ before the uploads/ route existed.
    return [
      {
        source: "/products/u-:file",
        destination: "/uploads/products/u-:file",
      },
      {
        source: "/hero/uploads/:file",
        destination: "/uploads/hero/:file",
      },
    ];
  },
};

export default nextConfig;
