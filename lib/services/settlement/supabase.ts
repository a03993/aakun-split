import { sendGroupMessage } from "@/lib/liff";
import { createClient } from "@/lib/supabase";
import type { Settlement, SettlementResult } from "@/types";

export async function saveSettlements(billGroupId: string, results: SettlementResult[]): Promise<Settlement[]> {
    const supabase = createClient();

    const records = results.map((r) => ({
        bill_group_id: billGroupId,
        from_member: r.fromMember.id,
        to_member: r.toMember.id,
        amount: r.amount,
        status: "pending" as const,
    }));

    const { data, error } = await supabase.from("settlements").insert(records).select();

    if (error) {
        throw error;
    }

    return data;
}

export async function notifySettlements(results: SettlementResult[], groupName: string): Promise<void> {
    if (results.length === 0) {
        return;
    }

    const lines = results.map((r) => `${r.fromMember.display_name} 欠 ${r.toMember.display_name} $${r.amount}`);

    const message = [
        `📊 ${groupName} 結算結果`,
        "─────────────",
        ...lines,
        "─────────────",
        "請至 分帳AA君 App 確認結清",
    ].join("\n");

    const sent = await sendGroupMessage(message);

    if (!sent) {
        console.warn("不在 LINE 群組環境，無法發送結算通知");
    }
}
