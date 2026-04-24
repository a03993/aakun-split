"use client";

import { LiffProvider } from "@/contexts/liff";
import { LoadingProvider } from "@/contexts/loading";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <LiffProvider>
            <LoadingProvider>{children}</LoadingProvider>
        </LiffProvider>
    );
}
