import mockStore from "@/lib/services/mockStore";
import type { Settlement, SettlementResult } from "@/types";

export async function saveSettlements(billGroupId: string, results: SettlementResult[]): Promise<Settlement[]> {
    const records: Settlement[] = results.map((r) => ({
        id: `mock-settlement-${Date.now()}-${Math.random()}`,
        bill_group_id: billGroupId,
        from_member: r.fromMember.id,
        to_member: r.toMember.id,
        amount: r.amount,
        status: "pending",
        line_notified: false,
        settled_at: null,
        created_at: new Date().toISOString(),
    }));

    mockStore.settlements = [...mockStore.settlements, ...records];

    return records;
}

export async function notifySettlements(results: SettlementResult[], groupName: string): Promise<void> {
    if (results.length === 0) {
        return;
    }

    const lines = results.map((r) => `${r.fromMember.display_name} 欠 ${r.toMember.display_name} $${r.amount}`);

    const message = [
        `${groupName} 結算結果`,
        "─────────────",
        ...lines,
        "─────────────",
        "請至 分帳AA君 App 確認結清",
    ].join("\n");

    console.log("[MOCK] LINE 訊息預覽：\n" + message);
}
