"use client";

import type { Member } from "@/types";

type Props = {
    unclaimedMembers: Member[];
    onClaim: (memberId: string) => void;
    onClose: () => void;
};

export default function ClaimModal({ unclaimedMembers, onClaim, onClose }: Props) {
    if (unclaimedMembers.length === 0) {
        return (
            <div className="fixed inset-0 z-50 flex items-end bg-black/40">
                <div className="flex w-full flex-col gap-4 rounded-t-2xl bg-white p-6">
                    <h2 className="text-base font-semibold text-gray-800">無法加入</h2>
                    <p className="py-4 text-center text-sm text-gray-500">
                        目前沒有可認領的身份，請聯繫創建者新增你的名字
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full rounded-xl border border-gray-200 py-3 text-sm text-gray-500"
                    >
                        返回
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
            <div className="flex w-full flex-col gap-4 rounded-t-2xl bg-white p-6">
                <h2 className="text-base font-semibold text-gray-800">選擇你的身份</h2>
                <div className="flex flex-col gap-2">
                    {unclaimedMembers.map((member) => (
                        <button
                            key={member.id}
                            onClick={() => onClaim(member.id)}
                            className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4 text-left"
                        >
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200">
                                <span className="text-sm font-medium text-gray-500">
                                    {member.display_name.charAt(0)}
                                </span>
                            </div>
                            <span className="text-sm font-medium text-gray-800">{member.display_name}</span>
                        </button>
                    ))}
                </div>
                <button
                    onClick={onClose}
                    className="w-full rounded-xl border border-gray-200 py-3 text-sm text-gray-500"
                >
                    取消
                </button>
            </div>
        </div>
    );
}
