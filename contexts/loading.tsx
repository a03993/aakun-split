"use client";

import { createContext, useCallback, useContext, useState } from "react";

import { Loader2 } from "lucide-react";

type LoadingContextValue = {
    showLoading: (message?: string) => void;
    hideLoading: () => void;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [isVisible, setIsVisible] = useState(false);
    const [message, setMessage] = useState("處理中⋯");

    const showLoading = useCallback((msg?: string) => {
        setMessage(msg ?? "處理中⋯");
        setIsVisible(true);
    }, []);

    const hideLoading = useCallback(() => {
        setIsVisible(false);
    }, []);

    return (
        <LoadingContext.Provider value={{ showLoading, hideLoading }}>
            {children}
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 size={32} className="animate-spin text-white" />
                        <p className="text-sm text-white">{message}</p>
                    </div>
                </div>
            )}
        </LoadingContext.Provider>
    );
}

export function useLoading(): LoadingContextValue {
    const context = useContext(LoadingContext);

    if (!context) {
        throw new Error("useLoading must be used within LoadingProvider");
    }

    return context;
}
