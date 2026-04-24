"use client";

import { Plus } from "lucide-react";

import { CATEGORY_LABELS } from "@/lib/constants";
import AvatarStack from "@/app/_components/AvatarStack";
import Spinner from "@/app/_components/Spinner";
import type { Category } from "@/types";

import AddBillModal from "../AddBillModal";
import AddMemberModal from "../AddMemberModal";
import BillCard from "../BillCard";
import BillDetailModal from "../BillDetailModal";
import ClaimModal from "../ClaimModal";
import MemberListModal from "../MemberListModal";
import SettlementModal from "../SettlementModal";
import { useGroupDetail } from "./useGroupDetail";

export default function GroupDetail({ id }: { id: string }) {
    const {
        group,
        members,
        settlements,
        form,
        filterCategory,
        filteredBills,
        totalAmount,
        isProfileLoading,
        isNotFound,
        isClaimRequired,
        unclaimedMembers,
        isAddBillOpen,
        isSettlementOpen,
        isAddMemberOpen,
        isMemberListOpen,
        selectedBill,
        isOwner,
        isSettled,
        setForm,
        setFilterCategory,
        setIsAddBillOpen,
        setIsSettlementOpen,
        setIsAddMemberOpen,
        setIsMemberListOpen,
        setSelectedBill,
        handleAddBill,
        handleUpdateBill,
        handleDeleteBill,
        handleSettle,
        handleConfirmSettlement,
        handleClaim,
        handleAddMember,
        router,
    } = useGroupDetail(id);

    function handleOpenAddMember() {
        setIsMemberListOpen(false);
        setIsAddMemberOpen(true);
    }

    if (isNotFound) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
                <p className="text-sm text-gray-500">找不到此帳本</p>
                <button onClick={() => router.push("/")} className="text-sm text-lime-600">
                    返回首頁
                </button>
            </div>
        );
    }

    if (isProfileLoading || !group) {
        return <Spinner />;
    }

    if (isClaimRequired) {
        return (
            <ClaimModal unclaimedMembers={unclaimedMembers} onClaim={handleClaim} onClose={() => router.push("/")} />
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between bg-lime-50 px-4 py-4">
                <div>
                    <h1 className="text-lg font-semibold text-gray-800">
                        {group.name}
                        {isSettled && <span className="ml-2 text-sm font-normal text-gray-400">已結算</span>}
                    </h1>
                    <button className="mt-1" onClick={() => setIsMemberListOpen(true)}>
                        <AvatarStack users={members} size="md" />
                    </button>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">帳本總額</p>
                    <p className="text-2xl font-bold text-lime-600">${totalAmount.toLocaleString()}</p>
                </div>
            </div>
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
                <button
                    onClick={() => setFilterCategory("all")}
                    className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                        filterCategory === "all"
                            ? "border-gray-800 bg-gray-800 text-white"
                            : "border-gray-200 bg-white text-gray-500"
                    }`}
                >
                    全部
                </button>
                {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setFilterCategory(key)}
                        className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                            filterCategory === key
                                ? "border-gray-800 bg-gray-800 text-white"
                                : "border-gray-200 bg-white text-gray-500"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>
            <main className="flex flex-col gap-3 px-4 pb-24">
                {filteredBills.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                        <p className="text-sm text-gray-400">
                            {filterCategory !== "all" ? "此類別沒有帳單" : "還沒有帳單，點下方按鈕新增！"}
                        </p>
                    </div>
                )}
                {filteredBills.map((bill) => (
                    <BillCard key={bill.id} bill={bill} members={members} onClick={() => setSelectedBill(bill)} />
                ))}
            </main>
            {!isSettled && (
                <div className="fixed right-0 bottom-6 left-0 flex justify-center gap-3 px-6">
                    <button
                        onClick={() => setIsAddBillOpen(true)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-lime-500 py-3.5 text-base font-medium text-white shadow-lg"
                    >
                        <Plus size={18} /> 新增帳單
                    </button>
                    <button
                        onClick={handleSettle}
                        className="flex-1 rounded-xl bg-orange-400 py-3.5 text-base font-medium text-white shadow-lg"
                    >
                        結算
                    </button>
                </div>
            )}
            {isMemberListOpen && (
                <MemberListModal
                    members={members}
                    isOwner={isOwner}
                    isSettled={isSettled}
                    onAddMember={handleOpenAddMember}
                    onClose={() => setIsMemberListOpen(false)}
                />
            )}
            {isAddBillOpen && (
                <AddBillModal
                    form={form}
                    members={members}
                    onFormChange={setForm}
                    onSubmit={handleAddBill}
                    onClose={() => setIsAddBillOpen(false)}
                />
            )}
            {isSettlementOpen && (
                <SettlementModal
                    settlements={settlements}
                    onConfirm={handleConfirmSettlement}
                    onClose={() => setIsSettlementOpen(false)}
                />
            )}
            {isAddMemberOpen && <AddMemberModal onSubmit={handleAddMember} onClose={() => setIsAddMemberOpen(false)} />}
            {selectedBill && (
                <BillDetailModal
                    bill={selectedBill}
                    members={members}
                    isSettled={isSettled}
                    onUpdate={handleUpdateBill}
                    onDelete={handleDeleteBill}
                    onClose={() => setSelectedBill(null)}
                />
            )}
        </div>
    );
}
