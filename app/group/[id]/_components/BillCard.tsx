"use client";

import { CATEGORY_LABELS } from "@/lib/constants";
import AvatarStack from "@/app/_components/AvatarStack";
import type { Bill, Member } from "@/types";

type Props = {
    bill: Bill;
    members: Member[];
    onClick: () => void;
};

export default function BillCard({ bill, members, onClick }: Props) {
    function getSplitMembers(userIds: string[]) {
        return userIds.map((uid) => members.find((m) => m.id === uid)).filter(Boolean) as Member[];
    }

    return (
        <button onClick={onClick} className="rounded-2xl bg-white p-4 text-left shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
                            {CATEGORY_LABELS[bill.category]}
                        </span>
                        <p className="text-base font-semibold text-gray-800">{bill.title}</p>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                        <AvatarStack users={getSplitMembers(bill.split_with)} size="sm" />
                        <span className="text-sm text-gray-400">
                            {bill.split_with.length} 人均分・每人 $
                            {Math.round(bill.amount / bill.split_with.length).toLocaleString()}
                        </span>
                    </div>
                </div>
                <p className="text-lg font-bold text-gray-800">${bill.amount.toLocaleString()}</p>
            </div>
        </button>
    );
}
