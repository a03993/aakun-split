"use client";

import type { SettlementResult } from "@/types";

type Props = {
    settlements: SettlementResult[];
    onConfirm: () => void;
    onClose: () => void;
};

export default function SettlementModal({ settlements, onConfirm, onClose }: Props) {
    return (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
            <div className="flex w-full flex-col gap-4 rounded-t-2xl bg-white p-6">
                <h2 className="text-base font-semibold text-gray-800">結算結果</h2>
                {settlements.length === 0 && (
                    <p className="py-4 text-center text-sm text-gray-400">大家都平了，不需要轉帳！</p>
                )}
                {settlements.length > 0 && (
                    <div className="flex flex-col gap-3">
                        {settlements.map((s) => (
                            <div
                                key={`${s.fromMember.id}-${s.toMember.id}`}
                                className="flex items-center justify-between rounded-xl bg-orange-50 p-4"
                            >
                                <p className="text-sm text-gray-800">
                                    <span className="font-semibold">{s.fromMember.display_name}</span>
                                    <span className="text-gray-400"> 付給 </span>
                                    <span className="font-semibold">{s.toMember.display_name}</span>
                                </p>
                                <p className="text-base font-bold text-orange-500">${s.amount.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-gray-200 py-3 text-sm text-gray-500"
                    >
                        關閉
                    </button>
                    {settlements.length > 0 && (
                        <button onClick={onConfirm} className="flex-1 rounded-xl bg-orange-400 py-3 text-sm text-white">
                            確認並通知 LINE
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
