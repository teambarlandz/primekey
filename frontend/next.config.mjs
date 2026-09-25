/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
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
    // On Vercel NEXT_PUBLIC_API_URL is absolute (https://primekey-api.onrender.com/api/v1)
    // — frontend calls it directly via lib/api-client.ts, no proxy needed.
    // Only keep the /api proxy for local Docker (relative or localhost) to avoid double-prefix /api/v1.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const isAbsolute = /^https?:\/\//.test(apiUrl);
    if (isAbsolute) return [];
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
