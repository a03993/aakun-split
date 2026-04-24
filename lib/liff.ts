import liff from "@line/liff";

import { isDev } from "@/lib/config";

let initialized = false;

export async function initLiff(): Promise<void> {
    if (initialized) {
        return;
    }

    await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });

    initialized = true;
}

export async function getLiffProfile() {
    await initLiff();

    if (!liff.isLoggedIn()) {
        liff.login();

        return null;
    }

    const profile = await liff.getProfile();
    const context = liff.getContext();

    return {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        // 群組內開啟時才有 groupId
        groupId: context?.type === "group" ? context.groupId : null,
    };
}

export async function getAccessToken(): Promise<string | null> {
    await initLiff();

    if (!liff.isLoggedIn()) {
        return null;
    }

    return liff.getAccessToken();
}

// 回傳 true 表示已送出，false 表示不在 LIFF 群組環境無法送出
export async function sendGroupMessage(message: string): Promise<boolean> {
    await initLiff();

    if (!liff.isApiAvailable("sendMessages")) {
        return false;
    }

    await liff.sendMessages([{ type: "text", text: message }]);

    return true;
}

export function getGroupUrl(groupId: string): string {
    if (isDev) {
        return `http://localhost:3000/group/${groupId}`;
    }

    return `https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID}/group/${groupId}`;
}
