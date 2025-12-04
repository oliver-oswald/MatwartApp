import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    images: {
        remotePatterns: [new URL('https://api.dicebear.com/9.x/adventurer/svg?seed=Aiden')]
    },
    experimental:{
        viewTransition: true
    }
};

export default nextConfig;
