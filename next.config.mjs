// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {},

  // ✅ single images block (no duplicates)
  images: {
    remotePatterns: [
      // gallery bucket (images)
      {
        protocol: "https",
        hostname: "pub-3354a96a3d194a9c95c8e51e1b20944e.r2.dev",
      },
      // previews bucket (video thumbnails/frames)
      {
        protocol: "https",
        hostname: "pub-f962df99714e4baaac2e2c4a54a7b861.r2.dev",
      },
    ],
  },

  // Optional: handy path aliases to your public R2 buckets
  async rewrites() {
    return [
      {
        source: "/img/:path*",
        destination:
          "https://pub-3354a96a3d194a9c95c8e51e1b20944e.r2.dev/:path*", // gallery
      },
      {
        source: "/media/images/:path*",
        destination:
          "https://pub-3354a96a3d194a9c95c8e51e1b20944e.r2.dev/:path*", // gallery
      },
      {
        source: "/media/previews/:path*",
        destination:
          "https://pub-f962df99714e4baaac2e2c4a54a7b861.r2.dev/:path*", // previews
      },
    ];
  },

  // Security headers (kept broad for dev; tighten later for prod)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src * 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
              "img-src * data: blob:",
              "font-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "connect-src 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
