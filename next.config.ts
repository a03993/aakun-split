import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            // LINE 使用者頭貼
            { hostname: "profile.line-scdn.net" },
            // DiceBear（開發模式 mock 頭貼）
            { hostname: "api.dicebear.com" },
        ],
    },
};

export default nextConfig;
