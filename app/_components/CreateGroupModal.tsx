"use client";

import Image from "next/image";

import { X } from "lucide-react";

type Props = {
    groupName: string;
    memberInput: string;
    memberNames: string[];
    profile: { displayName: string; pictureUrl: string | undefined };
    onGroupNameChange: (value: string) => void;
    onMemberInputChange: (value: string) => void;
    onAddMember: () => void;
    onRemoveMember: (name: string) => void;
    onMemberInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    onClose: () => void;
};

export default function CreateGroupModal({
    groupName,
    memberInput,
    memberNames,
    profile,
    onGroupNameChange,
    onMemberInputChange,
    onAddMember,
    onRemoveMember,
    onMemberInputKeyDown,
    onSubmit,
    onClose,
}: Props) {
    return (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
            <div className="flex w-full flex-col gap-4 rounded-t-2xl bg-white p-6">
                <h2 className="text-base font-semibold text-gray-800">新增帳本</h2>
                <div>
                    <label className="mb-1.5 block text-sm text-gray-500">帳本名稱</label>
                    <input
                        type="text"
                        placeholder="沖繩爆吃團"
                        value={groupName}
                        onChange={(e) => onGroupNameChange(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-300 focus:border-lime-400"
                    />
                </div>
                <div>
                    <p className="mb-1.5 text-sm text-gray-500">新增其他成員</p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="輸入成員名稱"
                            value={memberInput}
                            onChange={(e) => onMemberInputChange(e.target.value)}
                            onKeyDown={onMemberInputKeyDown}
                            className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-300 focus:border-lime-400"
                        />
                        <button
                            onClick={onAddMember}
                            disabled={!memberInput.trim()}
                            className="rounded-xl bg-lime-500 px-4 py-3 text-sm text-white disabled:opacity-50"
                        >
                            新增
                        </button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 rounded-full bg-lime-50 py-1 pr-3 pl-1 text-sm text-lime-700">
                            {profile.pictureUrl ? (
                                <div className="relative h-6 w-6 overflow-hidden rounded-full">
                                    <Image
                                        src={profile.pictureUrl}
                                        alt={profile.displayName}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-200 text-xs font-medium">
                                    {profile.displayName.charAt(0)}
                                </div>
                            )}
                            <span>{profile.displayName}</span>
                            <span className="text-xs text-lime-400">（我）</span>
                        </div>
                        {memberNames.map((name) => (
                            <div
                                key={name}
                                className="flex items-center gap-1.5 rounded-full bg-gray-100 py-1 pr-2 pl-3 text-sm text-gray-700"
                            >
                                <span>{name}</span>
                                <button onClick={() => onRemoveMember(name)}>
                                    <X size={14} className="text-gray-400" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-gray-200 py-3 text-sm text-gray-500"
                    >
                        取消
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={!groupName.trim()}
                        className="flex-1 rounded-xl bg-lime-500 py-3 text-sm text-white disabled:opacity-50"
                    >
                        建立
                    </button>
                </div>
            </div>
        </div>
    );
}
