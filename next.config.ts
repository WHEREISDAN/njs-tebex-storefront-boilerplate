import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dunb17ur4ymx4.cloudfront.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
  reactStrictMode: false, // Temporarily disable strict mode for debugging
  async headers() {
    // Define allowed origins - add your production domains here
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://yourproductiondomain.com', // Add your actual domain
    ];
    
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: process.env.NODE_ENV === 'development' 
            ? '*' // Keep wildcard in development for easier testing
            : allowedOrigins.join(',') }, // Use specific origins in production
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ],
      },
    ];
  },
};

export default nextConfig;
