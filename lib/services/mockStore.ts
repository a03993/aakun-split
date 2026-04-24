import { MOCK_BILL_GROUPS, MOCK_BILLS, MOCK_MEMBERS, MOCK_SETTLEMENTS } from "@/lib/mock";
import type { Bill, BillGroup, Member, Settlement } from "@/types";

// Mock 模式的 in-memory 資料，所有 mock service 共用

const mockStore = {
    groups: [...MOCK_BILL_GROUPS] as BillGroup[],
    bills: [...MOCK_BILLS] as Bill[],
    settlements: [...MOCK_SETTLEMENTS] as Settlement[],
    groupMembers: {
        "mock-group-001": [
            { ...MOCK_MEMBERS[0] },
            { ...MOCK_MEMBERS[1] },
            { ...MOCK_MEMBERS[2] },
            { ...MOCK_MEMBERS[3] },
        ],
        "mock-group-002": [
            { ...MOCK_MEMBERS[1] },
            { ...MOCK_MEMBERS[2] },
            { ...MOCK_MEMBERS[3] },
            { ...MOCK_MEMBERS[4] },
        ],
        "mock-group-003": [{ ...MOCK_MEMBERS[0] }, { ...MOCK_MEMBERS[3] }, { ...MOCK_MEMBERS[4] }],
        "mock-group-004": [{ ...MOCK_MEMBERS[1] }],
        "mock-group-005": [
            { ...MOCK_MEMBERS[1] },
            { ...MOCK_MEMBERS[2] },
            { ...MOCK_MEMBERS[3] },
            { ...MOCK_MEMBERS[4] },
        ],
        "mock-group-006": [
            { ...MOCK_MEMBERS[1], role: "owner" as const },
            { ...MOCK_MEMBERS[0] },
            { ...MOCK_MEMBERS[3] },
        ],
    } as Record<string, Member[]>,
};

export default mockStore;
