"use client";

import Image from "next/image";

import { Plus } from "lucide-react";

import type { Member } from "@/types";

type Props = {
    members: Member[];
    isOwner: boolean;
    isSettled: boolean;
    onAddMember: () => void;
    onClose: () => void;
};

export default function MemberListModal({ members, isOwner, isSettled, onAddMember, onClose }: Props) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
            <div className="flex w-full flex-col gap-4 rounded-2xl bg-white p-6">
                <h2 className="text-base font-semibold text-gray-800">成員列表</h2>
                <div className="flex flex-col gap-2">
                    {members.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3">
                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200">
                                {member.avatar_url ? (
                                    <Image
                                        src={member.avatar_url}
                                        alt={member.display_name}
                                        fill
                                        className="rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-sm font-medium text-gray-500">
                                        {member.display_name.charAt(0)}
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-1 items-center justify-between">
                                <span className="text-sm text-gray-800">{member.display_name}</span>
                                <div className="flex items-center gap-2">
                                    {member.role === "owner" && <span className="text-xs text-gray-400">創建者</span>}
                                    {!member.user_id && <span className="text-xs text-orange-400">未認領</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-gray-200 py-3 text-sm text-gray-500"
                    >
                        關閉
                    </button>
                    {isOwner && !isSettled && (
                        <button
                            onClick={onAddMember}
                            className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-lime-500 py-3 text-sm text-white"
                        >
                            <Plus size={16} /> 新增成員
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
