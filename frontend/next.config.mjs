/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    // `domains` is deprecated but kept for Next 14 compat with existing
    // encrypted-tbn hosts; `remotePatterns` is authoritative.
    domains: [
      'encrypted-tbn0.gstatic.com',
      'encrypted-tbn1.gstatic.com',
      'encrypted-tbn2.gstatic.com',
      'encrypted-tbn3.gstatic.com',
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.nigeriapropertycentre.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: '*.nigeriapropertycentre.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: '*.unsplash.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'images.pexels.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'upload.wikimedia.org', port: '', pathname: '/**' },
      { protocol: 'https', hostname: '*.gstatic.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'encrypted-tbn1.gstatic.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'encrypted-tbn2.gstatic.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'encrypted-tbn3.gstatic.com', port: '', pathname: '/**' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
