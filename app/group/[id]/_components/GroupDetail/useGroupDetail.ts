"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
    addBill,
    addMember,
    claimMember,
    closeBillGroup,
    deleteBill,
    getBillGroup,
    getBillGroupMembers,
    getBills,
    updateBill,
} from "@/lib/services/billing";
import { calculateSettlements, notifySettlements, saveSettlements } from "@/lib/services/settlement";
import { useLoading } from "@/contexts/loading";
import { useLiff } from "@/hooks/useLiff";
import type { AddBillForm, Bill, BillGroup, Category, Member, SettlementResult } from "@/types";

export function useGroupDetail(id: string) {
    const { profile, isLoading: isProfileLoading } = useLiff();
    const { showLoading, hideLoading } = useLoading();
    const router = useRouter();

    const [group, setGroup] = useState<BillGroup | null>(null);
    const [isFetched, setIsFetched] = useState(false);
    const [bills, setBills] = useState<Bill[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [settlements, setSettlements] = useState<SettlementResult[]>([]);
    const [isAddBillOpen, setIsAddBillOpen] = useState(false);
    const [isSettlementOpen, setIsSettlementOpen] = useState(false);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [isMemberListOpen, setIsMemberListOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [filterCategory, setFilterCategory] = useState<Category | "all">("all");
    const [form, setForm] = useState<AddBillForm>({
        title: "",
        amount: "",
        category: "food",
        paidBy: "",
        splitWith: [],
    });

    useEffect(() => {
        if (!isProfileLoading && !profile) router.replace("/");
    }, [isProfileLoading, profile, router]);

    useEffect(() => {
        if (!profile) {
            return;
        }

        async function fetchData() {
            const [groupData, membersData, billsData] = await Promise.all([
                getBillGroup(id),
                getBillGroupMembers(id),
                getBills(id),
            ]);

            setGroup(groupData);
            setMembers(membersData);
            setBills(billsData);

            const selfMember = membersData.find((m) => m.user_id === profile?.authId) ?? membersData[0];

            setForm((f) => ({
                ...f,
                paidBy: selfMember?.id ?? "",
                splitWith: membersData.map((m) => m.id),
            }));

            setIsFetched(true);
        }

        fetchData().catch(console.error);
    }, [id, profile]);

    async function handleAddBill() {
        const amount = parseFloat(form.amount);

        if (!profile || !form.title || !(amount > 0) || !form.paidBy) {
            return;
        }

        try {
            const bill = await addBill({
                billGroupId: id,
                title: form.title,
                amount,
                category: form.category,
                paidBy: form.paidBy,
                splitWith: form.splitWith,
            });

            setBills((prev) => [bill, ...prev]);

            const selfMember = members.find((m) => m.user_id === profile?.authId) ?? members[0];

            setForm({
                title: "",
                amount: "",
                category: "food",
                paidBy: selfMember?.id ?? "",
                splitWith: members.map((m) => m.id),
            });
            setIsAddBillOpen(false);
        } catch (err) {
            console.error(err);
        }
    }

    function handleSettle() {
        const results = calculateSettlements({ bills, members });

        setSettlements(results);
        setIsSettlementOpen(true);
    }

    async function handleConfirmSettlement() {
        if (!group) {
            return;
        }

        showLoading("傳送中⋯");

        try {
            await saveSettlements(id, settlements);
            await closeBillGroup(id);
            await notifySettlements(settlements, group.name);

            setGroup((prev) => (prev ? { ...prev, is_active: false } : prev));
            setIsSettlementOpen(false);
            setSettlements([]);
        } catch (err) {
            console.error(err);
        } finally {
            hideLoading();
        }
    }

    async function handleClaim(memberId: string) {
        if (!profile) {
            return;
        }

        showLoading("認領中⋯");

        try {
            const updated = await claimMember({
                billGroupId: id,
                memberId,
                userId: profile.authId,
                avatarUrl: profile.pictureUrl ?? null,
            });

            setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
            setForm((f) => ({ ...f, paidBy: updated.id }));
        } catch (err) {
            console.error(err);
        } finally {
            hideLoading();
        }
    }

    async function handleUpdateBill(updated: Bill) {
        try {
            const result = await updateBill(updated);

            setBills((prev) => prev.map((b) => (b.id === result.id ? result : b)));
            setSelectedBill(null);
        } catch (err) {
            console.error(err);
        }
    }

    async function handleDeleteBill(billId: string) {
        try {
            await deleteBill(billId);

            setBills((prev) => prev.filter((b) => b.id !== billId));
            setSelectedBill(null);
        } catch (err) {
            console.error(err);
        }
    }

    async function handleAddMember(displayName: string) {
        showLoading("新增中⋯");

        try {
            const member = await addMember(id, displayName);

            setMembers((prev) => [...prev, member]);
            setIsAddMemberOpen(false);
        } catch (err) {
            console.error(err);
        } finally {
            hideLoading();
        }
    }

    const isClaimed = members.some((m) => m.user_id === profile?.authId);
    const unclaimedMembers = members.filter((m) => m.user_id === null);
    const isClaimRequired = members.length > 0 && !isClaimed;
    const totalAmount = bills.reduce((sum, b) => sum + b.amount, 0);
    const filteredBills = filterCategory === "all" ? bills : bills.filter((b) => b.category === filterCategory);
    const isNotFound = isFetched && !group;
    const isOwner = group?.created_by === profile?.authId;
    const isSettled = group !== null && !group.is_active;

    return {
        // 狀態
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

        // 操作
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
    };
}
