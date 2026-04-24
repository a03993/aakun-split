"use client";

import { useState } from "react";
import Image from "next/image";

import { Pencil, X } from "lucide-react";

import { CATEGORY_LABELS } from "@/lib/constants";
import type { Bill, Category, Member } from "@/types";

function MemberRow({ member }: { member: Member }) {
    return (
        <div className="flex items-center gap-3">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200">
                {member.avatar_url ? (
                    <Image
                        src={member.avatar_url}
                        alt={member.display_name}
                        fill
                        className="rounded-full object-cover"
                    />
                ) : (
                    <span className="text-xs font-medium text-gray-500">{member.display_name.charAt(0)}</span>
                )}
            </div>
            <span className="text-sm text-gray-800">{member.display_name}</span>
        </div>
    );
}

type Props = {
    bill: Bill;
    members: Member[];
    isSettled: boolean;
    onUpdate: (bill: Bill) => void;
    onDelete: (billId: string) => void;
    onClose: () => void;
};

export default function BillDetailModal({ bill, members, isSettled, onUpdate, onDelete, onClose }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(bill.title);
    const [amount, setAmount] = useState(String(bill.amount));
    const [category, setCategory] = useState<Category>(bill.category);
    const [paidBy, setPaidBy] = useState(bill.paid_by);
    const [splitWith, setSplitWith] = useState<string[]>(bill.split_with);

    function toggleMember(id: string) {
        setSplitWith((prev) => (prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]));
    }

    function getMember(id: string) {
        return members.find((m) => m.id === id);
    }

    function handleSave() {
        const parsedAmount = parseFloat(amount);

        if (!title || !(parsedAmount > 0) || !paidBy || splitWith.length === 0) {
            return;
        }

        onUpdate({
            ...bill,
            title,
            amount: parsedAmount,
            category,
            paid_by: paidBy,
            split_with: splitWith,
        });
    }

    function handleBack() {
        setTitle(bill.title);
        setAmount(String(bill.amount));
        setCategory(bill.category);
        setPaidBy(bill.paid_by);
        setSplitWith(bill.split_with);
        setIsEditing(false);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
            <div className="flex w-full flex-col rounded-2xl bg-white">
                <div className="flex items-center justify-between pt-6 pr-4 pl-6">
                    <h2 className="text-base font-semibold text-gray-800">{isEditing ? "編輯帳單" : "帳單詳情"}</h2>
                    <div className="flex items-center gap-1">
                        {!isSettled && (
                            <button
                                onClick={() => (isEditing ? handleBack() : setIsEditing(true))}
                                className={`flex h-9 w-9 items-center justify-center rounded-full ${
                                    isEditing ? "bg-lime-100 text-lime-600" : "text-gray-400"
                                }`}
                            >
                                <Pencil size={16} />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
                {isEditing ? (
                    <div className="flex flex-col gap-4 p-6">
                        <div>
                            <label className="mb-1.5 block text-sm text-gray-500">品項</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-lime-400"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm text-gray-500">金額</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none focus:border-lime-400"
                            />
                        </div>
                        <div>
                            <p className="mb-1.5 text-sm text-gray-500">類別</p>
                            <div className="flex flex-wrap gap-2">
                                {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => setCategory(key)}
                                        className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                                            category === key
                                                ? "border-lime-500 bg-lime-500 text-white"
                                                : "border-gray-200 bg-white text-gray-500"
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="mb-1.5 text-sm text-gray-500">付款人</p>
                            <div className="flex flex-wrap gap-3">
                                {members.map((member) => (
                                    <button
                                        key={member.id}
                                        onClick={() => setPaidBy(member.id)}
                                        className={`relative flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 transition-shadow ${
                                            paidBy === member.id ? "ring-2 ring-lime-500 ring-offset-2" : ""
                                        }`}
                                        title={member.display_name}
                                    >
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
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="mb-1.5 text-sm text-gray-500">分擔成員</p>
                            <div className="flex flex-wrap gap-3">
                                {members.map((member) => (
                                    <button
                                        key={member.id}
                                        onClick={() => toggleMember(member.id)}
                                        className={`relative flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 transition-shadow ${
                                            splitWith.includes(member.id) ? "ring-2 ring-lime-500 ring-offset-2" : ""
                                        }`}
                                        title={member.display_name}
                                    >
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
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleBack}
                                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm text-gray-500"
                            >
                                返回
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!title || !(parseFloat(amount) > 0) || !paidBy || splitWith.length === 0}
                                className="flex-1 rounded-xl bg-lime-500 py-3 text-sm text-white disabled:opacity-50"
                            >
                                儲存
                            </button>
                        </div>
                        <button onClick={() => onDelete(bill.id)} className="w-full py-3 text-sm text-red-400">
                            刪除此帳單
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
                                    {CATEGORY_LABELS[bill.category]}
                                </span>
                                <p className="text-base font-semibold text-gray-800">{bill.title}</p>
                            </div>
                            <p className="text-xl font-bold text-gray-800">${bill.amount.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="mb-2 text-sm text-gray-500">付款人</p>
                            {getMember(bill.paid_by) && <MemberRow member={getMember(bill.paid_by)!} />}
                        </div>
                        <div>
                            <p className="mb-2 text-sm text-gray-500">
                                分擔成員・每人 ${Math.round(bill.amount / bill.split_with.length).toLocaleString()}
                            </p>
                            <div className="flex flex-col gap-2">
                                {bill.split_with.map((id) => {
                                    const member = getMember(id);

                                    return member ? <MemberRow key={id} member={member} /> : null;
                                })}
                            </div>
                        </div>
                        <p className="text-xs text-gray-400">
                            {new Date(bill.billed_at).toLocaleDateString("zh-TW", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
