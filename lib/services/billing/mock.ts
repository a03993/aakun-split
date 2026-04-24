import mockStore from "@/lib/services/mockStore";
import type {
    AddBillParams,
    Bill,
    BillGroup,
    BillGroupWithMembers,
    ClaimMemberParams,
    CreateBillGroupParams,
    Member,
} from "@/types";

export async function createBillGroup(params: CreateBillGroupParams): Promise<BillGroup> {
    const { name, memberNames, creatorName, creatorAvatarUrl, creatorUserId, lineGroupId } = params;

    const group: BillGroup = {
        id: `mock-group-${Date.now()}`,
        name,
        line_group_id: lineGroupId ?? null,
        created_by: creatorUserId,
        is_active: true,
        created_at: new Date().toISOString(),
    };

    const creatorMember: Member = {
        id: `mock-member-${Date.now()}-0`,
        display_name: creatorName,
        avatar_url: creatorAvatarUrl,
        user_id: creatorUserId,
        role: "owner",
    };

    const otherMembers: Member[] = memberNames.map((name, i) => ({
        id: `mock-member-${Date.now()}-${i + 1}`,
        display_name: name,
        avatar_url: null,
        user_id: null,
        role: "member" as const,
    }));

    mockStore.groups = [group, ...mockStore.groups];
    mockStore.groupMembers[group.id] = [creatorMember, ...otherMembers];

    return group;
}

export async function getBillGroup(id: string): Promise<BillGroup | null> {
    return mockStore.groups.find((g) => g.id === id) ?? null;
}

export async function getBillGroupMembers(billGroupId: string): Promise<Member[]> {
    return mockStore.groupMembers[billGroupId] ?? [];
}

export async function getBillGroups(userId: string): Promise<BillGroupWithMembers[]> {
    const isMember = (groupId: string) => (mockStore.groupMembers[groupId] ?? []).some((m) => m.user_id === userId);

    return mockStore.groups
        .filter((g) => isMember(g.id))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map((g) => ({ ...g, members: mockStore.groupMembers[g.id] ?? [] }));
}

export async function claimMember(params: ClaimMemberParams): Promise<Member> {
    const members = mockStore.groupMembers[params.billGroupId];

    if (!members) {
        throw new Error("找不到帳本");
    }

    const member = members.find((m) => m.id === params.memberId && m.user_id === null);

    if (!member) {
        throw new Error("找不到可認領的成員");
    }

    member.user_id = params.userId;
    member.avatar_url = params.avatarUrl;

    return { ...member };
}

export async function addBill(params: AddBillParams): Promise<Bill> {
    const bill: Bill = {
        id: `mock-bill-${Date.now()}`,
        bill_group_id: params.billGroupId,
        paid_by: params.paidBy,
        title: params.title,
        amount: params.amount,
        category: params.category,
        split_with: params.splitWith,
        note: params.note ?? null,
        billed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
    };

    mockStore.bills = [bill, ...mockStore.bills];

    return bill;
}

export async function getBills(billGroupId: string): Promise<Bill[]> {
    return mockStore.bills.filter((b) => b.bill_group_id === billGroupId);
}

export async function updateBill(updated: Bill): Promise<Bill> {
    const bill = mockStore.bills.find((b) => b.id === updated.id);

    if (!bill) {
        throw new Error("找不到帳單");
    }

    bill.title = updated.title;
    bill.amount = updated.amount;
    bill.category = updated.category;
    bill.paid_by = updated.paid_by;
    bill.split_with = updated.split_with;

    return { ...bill };
}

export async function deleteBill(billId: string): Promise<void> {
    mockStore.bills = mockStore.bills.filter((b) => b.id !== billId);
}

export async function closeBillGroup(billGroupId: string): Promise<void> {
    const group = mockStore.groups.find((g) => g.id === billGroupId);

    if (group) {
        group.is_active = false;
    }
}

export async function addMember(billGroupId: string, displayName: string): Promise<Member> {
    const member: Member = {
        id: `mock-member-${Date.now()}`,
        display_name: displayName,
        avatar_url: null,
        user_id: null,
        role: "member",
    };

    if (!mockStore.groupMembers[billGroupId]) {
        throw new Error("找不到帳本");
    }

    mockStore.groupMembers[billGroupId] = [...mockStore.groupMembers[billGroupId], member];

    return member;
}
