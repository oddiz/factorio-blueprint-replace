/** @type {import('next').NextConfig} */
const nextConfig = {
    assetPrefix: "./",

    experimental: {
        appDir: true,
    },
    output: "export",
};

module.exports = nextConfig;

