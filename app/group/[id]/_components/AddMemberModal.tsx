"use client";

import { useState } from "react";

type Props = {
    onSubmit: (displayName: string) => void;
    onClose: () => void;
};

export default function AddMemberModal({ onSubmit, onClose }: Props) {
    const [name, setName] = useState("");

    function handleSubmit() {
        const trimmed = name.trim();

        if (!trimmed) {
            return;
        }

        onSubmit(trimmed);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
            <div className="flex w-full flex-col gap-4 rounded-2xl bg-white p-6">
                <h2 className="text-base font-semibold text-gray-800">新增成員</h2>
                <div>
                    <label className="mb-1.5 block text-sm text-gray-500">成員名稱</label>
                    <input
                        type="text"
                        placeholder="輸入成員名稱"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-300 focus:border-lime-400"
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-gray-200 py-3 text-sm text-gray-500"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!name.trim()}
                        className="flex-1 rounded-xl bg-lime-500 py-3 text-sm text-white disabled:opacity-50"
                    >
                        新增
                    </button>
                </div>
            </div>
        </div>
    );
}
