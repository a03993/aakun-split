"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { isDev } from "@/lib/config";
import { getLiffProfile, initLiff } from "@/lib/liff";
import { MOCK_USER } from "@/lib/mock";
import { createClient } from "@/lib/supabase";

type LiffProfile = {
    userId: string; // LINE userId
    authId: string; // auth.users.id
    displayName: string;
    pictureUrl: string | undefined;
    groupId: string | null;
};

type LiffContextValue = {
    profile: LiffProfile | null;
    isLoading: boolean;
    isLoggedIn: boolean;
    error: string | null;
};

const LiffContext = createContext<LiffContextValue | null>(null);

export function LiffProvider({ children }: { children: React.ReactNode }) {
    const [profile, setProfile] = useState<LiffProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function setup() {
            try {
                if (isDev) {
                    setProfile({
                        userId: MOCK_USER.line_user_id ?? MOCK_USER.id,
                        authId: MOCK_USER.id,
                        displayName: MOCK_USER.display_name,
                        pictureUrl: MOCK_USER.avatar_url ?? undefined,
                        groupId: null,
                    });

                    setIsLoggedIn(true);

                    return;
                }

                await initLiff();

                const liffProfile = await getLiffProfile();

                if (!liffProfile) {
                    return; // 自動跳轉 LINE 登入
                }

                setIsLoggedIn(true);

                // 暫用匿名登入，正式環境應改為 LINE OAuth
                const supabase = createClient();
                const { data: anonData, error: authError } = await supabase.auth.signInAnonymously();

                if (authError) {
                    throw authError;
                }

                if (!anonData.user) {
                    throw new Error("匿名登入失敗");
                }

                setProfile({
                    ...liffProfile,
                    authId: anonData.user.id,
                });

                // 同步使用者資料到 users 表
                const { error: upsertError } = await supabase.from("users").upsert(
                    {
                        id: anonData.user.id,
                        line_user_id: liffProfile.userId,
                        display_name: liffProfile.displayName,
                        avatar_url: liffProfile.pictureUrl,
                        platform: "line",
                    },
                    { onConflict: "line_user_id" }
                );

                if (upsertError) {
                    throw upsertError;
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "LIFF 初始化失敗");
            } finally {
                setIsLoading(false);
            }
        }

        setup();
    }, []);

    return <LiffContext.Provider value={{ profile, isLoading, isLoggedIn, error }}>{children}</LiffContext.Provider>;
}

export function useLiff(): LiffContextValue {
    const context = useContext(LiffContext);

    if (!context) {
        throw new Error("useLiff must be used within LiffProvider");
    }

    return context;
}
