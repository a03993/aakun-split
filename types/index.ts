export type Category = "food" | "transport" | "accommodation" | "entertainment" | "grocery" | "other";

export type Platform = "line" | "ios" | "standalone";

// 使用者，對應 Supabase users 表，目前僅用於 mock
export type User = {
    id: string;
    line_user_id: string | null;
    display_name: string;
    avatar_url: string | null;
    platform: Platform;
    created_at: string;
};

// 帳本成員，認領前 user_id 為 null
export type Member = {
    id: string; // bill_group_members.id
    display_name: string;
    avatar_url: string | null;
    user_id: string | null; // 認領後對應 users.id
    role: "owner" | "member";
};

export type BillGroup = {
    id: string;
    name: string;
    line_group_id: string | null;
    created_by: string;
    is_active: boolean;
    created_at: string;
};

export type Bill = {
    id: string;
    bill_group_id: string;
    paid_by: string; // bill_group_members.id
    title: string;
    amount: number;
    category: Category;
    split_with: string[]; // bill_group_members.id[]
    note: string | null;
    billed_at: string;
    created_at: string;
};

export type Settlement = {
    id: string;
    bill_group_id: string;
    from_member: string; // bill_group_members.id
    to_member: string; // bill_group_members.id
    amount: number;
    status: "pending" | "confirmed";
    line_notified: boolean;
    settled_at: string | null;
    created_at: string;
};

// 結算結果，誰欠誰多少，前端顯示用
export type SettlementResult = {
    fromMember: Member;
    toMember: Member;
    amount: number;
};

export type AddBillForm = {
    title: string;
    amount: string;
    category: Category;
    paidBy: string; // bill_group_members.id
    splitWith: string[]; // bill_group_members.id[]
};

// 帳本含成員列表
export type BillGroupWithMembers = BillGroup & {
    members: Member[];
};

// 建立帳本參數
export type CreateBillGroupParams = {
    name: string;
    memberNames: string[]; // 手動輸入的成員名字
    creatorName: string;
    creatorAvatarUrl: string | null;
    creatorUserId: string; // auth.users.id
    lineGroupId?: string;
};

// 認領成員參數
export type ClaimMemberParams = {
    billGroupId: string; // bill_groups.id
    memberId: string; // bill_group_members.id
    userId: string; // auth.users.id
    avatarUrl: string | null;
};

// 新增帳單參數
export type AddBillParams = {
    billGroupId: string;
    title: string;
    amount: number;
    category: Category;
    paidBy: string; // bill_group_members.id
    splitWith: string[]; // bill_group_members.id[]
    note?: string;
};
