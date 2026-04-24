"use client";

import Image from "next/image";

import { CATEGORY_LABELS } from "@/lib/constants";
import type { AddBillForm, Category, Member } from "@/types";

type Props = {
    form: AddBillForm;
    members: Member[];
    onFormChange: (updater: (prev: AddBillForm) => AddBillForm) => void;
    onSubmit: () => void;
    onClose: () => void;
};

export default function AddBillModal({ form, members, onFormChange, onSubmit, onClose }: Props) {
    const isFormComplete =
        form.title.length > 0 && parseFloat(form.amount) > 0 && form.paidBy.length > 0 && form.splitWith.length > 0;

    function toggleMember(id: string) {
        onFormChange((f) => ({
            ...f,
            splitWith: f.splitWith.includes(id) ? f.splitWith.filter((mid) => mid !== id) : [...f.splitWith, id],
        }));
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
            <div className="flex w-full flex-col gap-4 rounded-t-2xl bg-white p-6">
                <h2 className="text-base font-semibold text-gray-800">新增帳單</h2>
                <div>
                    <label className="mb-1.5 block text-sm text-gray-500">品項</label>
                    <input
                        type="text"
                        placeholder="深夜泡麵大會"
                        value={form.title}
                        onChange={(e) => onFormChange((f) => ({ ...f, title: e.target.value }))}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-300 focus:border-lime-400"
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-sm text-gray-500">金額</label>
                    <input
                        type="number"
                        placeholder="350"
                        value={form.amount}
                        onChange={(e) => onFormChange((f) => ({ ...f, amount: e.target.value }))}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-300 focus:border-lime-400"
                    />
                </div>
                <div>
                    <p className="mb-1.5 text-sm text-gray-500">類別</p>
                    <div className="flex flex-wrap gap-2">
                        {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => onFormChange((f) => ({ ...f, category: key }))}
                                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                                    form.category === key
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
                                onClick={() => onFormChange((f) => ({ ...f, paidBy: member.id }))}
                                className={`relative flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 transition-shadow ${
                                    form.paidBy === member.id ? "ring-2 ring-lime-500 ring-offset-2" : ""
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
                                    form.splitWith.includes(member.id) ? "ring-2 ring-lime-500 ring-offset-2" : ""
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
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-gray-200 py-3 text-sm text-gray-500"
                    >
                        取消
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={!isFormComplete}
                        className="flex-1 rounded-xl bg-lime-500 py-3 text-sm text-white disabled:opacity-50"
                    >
                        新增
                    </button>
                </div>
            </div>
        </div>
    );
}
