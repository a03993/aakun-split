"use client";

import { useState } from "react";

import { Check, Copy } from "lucide-react";

import { getGroupUrl } from "@/lib/liff";

type Props = {
    groupId: string;
    onClose: () => void;
};

export default function ShareModal({ groupId, onClose }: Props) {
    const [isCopied, setIsCopied] = useState(false);
    const url = getGroupUrl(groupId);

    async function handleCopy() {
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
            <div className="flex w-full flex-col gap-4 rounded-t-2xl bg-white p-6">
                <h2 className="text-base font-semibold text-gray-800">分享帳本</h2>
                <p className="text-sm text-gray-500">複製連結傳給其他成員，讓他們認領身份加入帳本</p>
                <div className="rounded-xl bg-gray-50 px-4 py-3">
                    <p className="text-sm break-all text-gray-600">{url}</p>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-lime-500 py-3 text-sm text-white"
                >
                    {isCopied ? <Check size={16} /> : <Copy size={16} />}
                    {isCopied ? "已複製" : "複製連結"}
                </button>
                <button
                    onClick={onClose}
                    className="w-full rounded-xl border border-gray-200 py-3 text-sm text-gray-500"
                >
                    關閉
                </button>
            </div>
        </div>
    );
}
