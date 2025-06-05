// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [

            {
                protocol: 'http',
                hostname: 'bersimavisite.ir',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'bersimavisite.ir',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;
