"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ChevronRight, Plus } from "lucide-react";

import { createBillGroup, getBillGroups } from "@/lib/services/billing";
import { useLiff } from "@/hooks/useLiff";
import type { BillGroupWithMembers } from "@/types";

import AvatarStack from "./AvatarStack";
import CreateGroupModal from "./CreateGroupModal";
import ShareModal from "./ShareModal";
import Spinner from "./Spinner";

export default function GroupList() {
    const { profile, isLoading, error } = useLiff();
    const router = useRouter();

    const [groups, setGroups] = useState<BillGroupWithMembers[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [memberInput, setMemberInput] = useState("");
    const [memberNames, setMemberNames] = useState<string[]>([]);
    const [shareGroupId, setShareGroupId] = useState<string | null>(null);
    const [isGroupsLoading, setIsGroupsLoading] = useState(true);

    useEffect(() => {
        if (profile) {
            getBillGroups(profile.authId)
                .then(setGroups)
                .catch(console.error)
                .finally(() => setIsGroupsLoading(false));
        }
    }, [profile]);

    function handleOpenForm() {
        setGroupName("");
        setMemberInput("");
        setMemberNames([]);
        setIsFormOpen(true);
    }

    function handleAddMember() {
        const name = memberInput.trim();

        if (!name || memberNames.includes(name)) {
            return;
        }

        setMemberNames((prev) => [...prev, name]);
        setMemberInput("");
    }

    function handleRemoveMember(name: string) {
        setMemberNames((prev) => prev.filter((n) => n !== name));
    }

    function handleMemberInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAddMember();
        }
    }

    async function handleCreateGroup() {
        if (!groupName.trim() || !profile) {
            return;
        }

        try {
            const group = await createBillGroup({
                name: groupName.trim(),
                memberNames,
                creatorName: profile.displayName,
                creatorAvatarUrl: profile.pictureUrl ?? null,
                creatorUserId: profile.authId,
                lineGroupId: profile.groupId ?? undefined,
            });

            const creatorMember = {
                id: `${group.id}-owner`,
                display_name: profile.displayName,
                avatar_url: profile.pictureUrl ?? null,
                user_id: profile.authId,
                role: "owner" as const,
            };

            const otherMembers = memberNames.map((name, i) => ({
                id: `${group.id}-member-${i}`,
                display_name: name,
                avatar_url: null,
                user_id: null,
                role: "member" as const,
            }));

            setGroups((prev) => [{ ...group, members: [creatorMember, ...otherMembers] }, ...prev]);
            setIsFormOpen(false);
            setShareGroupId(group.id);
        } catch (err) {
            console.error(err);
        }
    }

    if (isLoading) {
        return <Spinner />;
    }

    if (error) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center px-6">
                <p className="text-center text-sm text-red-500">{error}</p>
                <p className="mt-2 text-xs text-gray-400">請關閉後重新開啟</p>
            </div>
        );
    }

    if (isGroupsLoading) {
        return <Spinner />;
    }

    return (
        <div>
            {isFormOpen && profile && (
                <CreateGroupModal
                    groupName={groupName}
                    memberInput={memberInput}
                    memberNames={memberNames}
                    profile={{ displayName: profile.displayName, pictureUrl: profile.pictureUrl }}
                    onGroupNameChange={setGroupName}
                    onMemberInputChange={setMemberInput}
                    onAddMember={handleAddMember}
                    onRemoveMember={handleRemoveMember}
                    onMemberInputKeyDown={handleMemberInputKeyDown}
                    onSubmit={handleCreateGroup}
                    onClose={() => setIsFormOpen(false)}
                />
            )}
            <main className="flex flex-col gap-3 px-4 py-6 pb-24">
                {groups.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-3 py-20">
                        <p className="text-sm text-gray-400">還沒有帳本，點下方按鈕新增吧！</p>
                    </div>
                )}
                {groups.map((group) => (
                    <button
                        key={group.id}
                        onClick={() => router.push(`/group/${group.id}`)}
                        className="flex items-center justify-between rounded-2xl bg-white p-4 text-left shadow-sm"
                    >
                        <div>
                            <p className="text-base font-semibold text-gray-800">
                                {group.name}
                                {!group.is_active && (
                                    <span className="ml-2 text-xs font-normal text-gray-400">已結算</span>
                                )}
                            </p>
                            <div className="mt-1.5 flex items-center gap-2">
                                <AvatarStack users={group.members} size="sm" />
                                <span className="text-sm text-gray-400">
                                    {new Date(group.created_at).toLocaleDateString("zh-TW")}
                                </span>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-300" />
                    </button>
                ))}
            </main>
            {shareGroupId && <ShareModal groupId={shareGroupId} onClose={() => setShareGroupId(null)} />}
            <div className="fixed right-0 bottom-6 left-0 flex justify-center">
                <button
                    onClick={handleOpenForm}
                    className="flex items-center gap-1 rounded-xl bg-lime-500 px-8 py-3.5 text-base font-medium text-white shadow-lg"
                >
                    <Plus size={18} /> 新增帳本
                </button>
            </div>
        </div>
    );
}
