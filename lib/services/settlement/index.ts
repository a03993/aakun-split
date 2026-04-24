import { isDev } from "@/lib/config";
import type { Bill, Member, SettlementResult } from "@/types";

import * as mock from "./mock";
import * as supabase from "./supabase";

// 結算計算，純邏輯不依賴資料來源
//
// 貪心法最小化轉帳次數：
// 1. 算出每人淨餘額（付出 - 應付）
// 2. 正數是應收，負數是應付
// 3. 配對最大應付與最大應收，直到清零

type Params = {
    bills: Bill[];
    members: Member[];
};

export function calculateSettlements({ bills, members }: Params): SettlementResult[] {
    // 計算每人淨餘額，key 是 bill_group_members.id
    const balance: Record<string, number> = {};

    members.forEach((m) => {
        balance[m.id] = 0;
    });

    bills.forEach((bill) => {
        const share = bill.amount / bill.split_with.length;
        if (!(bill.paid_by in balance)) {
            balance[bill.paid_by] = 0;
        }

        balance[bill.paid_by] += bill.amount;

        bill.split_with.forEach((memberId) => {
            if (!(memberId in balance)) {
                balance[memberId] = 0;
            }

            balance[memberId] -= share;
        });
    });

    // 分成應收（creditors）和應付（debtors）
    const creditors: { id: string; amount: number }[] = [];
    const debtors: { id: string; amount: number }[] = [];

    Object.entries(balance).forEach(([id, amount]) => {
        const rounded = Math.round(amount);

        if (rounded > 0) {
            creditors.push({ id, amount: rounded });
        }

        if (rounded < 0) {
            debtors.push({ id, amount: Math.abs(rounded) });
        }
    });

    // 貪心配對
    const results: SettlementResult[] = [];
    let ci = 0;
    let di = 0;

    while (ci < creditors.length && di < debtors.length) {
        const creditor = creditors[ci];
        const debtor = debtors[di];
        const settled = Math.min(creditor.amount, debtor.amount);

        const fromMember = members.find((m) => m.id === debtor.id);
        const toMember = members.find((m) => m.id === creditor.id);

        if (fromMember && toMember) {
            results.push({
                fromMember,
                toMember,
                amount: Math.round(settled),
            });
        }

        creditor.amount -= settled;
        debtor.amount -= settled;

        if (creditor.amount < 0.01) {
            ci++;
        }

        if (debtor.amount < 0.01) {
            di++;
        }
    }

    return results;
}

// 資料來源分流

const service = isDev ? mock : supabase;

export const { saveSettlements, notifySettlements } = service;
