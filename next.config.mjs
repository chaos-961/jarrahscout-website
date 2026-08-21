/**
 * Static export for GitHub Pages.
 *
 * Pages serves this repo at /jarrahscout-website/, so assets need that prefix
 * in production but not in `next dev`. If a custom domain (jarrahscout.com) is
 * pointed at Pages later, set BASE_PATH to '' in the deploy workflow.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  // Pages has no Next.js image optimizer behind it.
  images: { unoptimized: true },
  // Emit /submit/index.html rather than /submit.html so Pages resolves it.
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;
