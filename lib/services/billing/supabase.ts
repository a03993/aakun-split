import { createClient } from "@/lib/supabase";
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
    const { name, memberNames, creatorName, creatorAvatarUrl, lineGroupId } = params;
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("尚未登入");
    }

    const { data: group, error: groupError } = await supabase
        .from("bill_groups")
        .insert({ name, line_group_id: lineGroupId ?? null, created_by: user.id })
        .select()
        .single();

    if (groupError) {
        throw groupError;
    }

    const membersToInsert = [
        {
            bill_group_id: group.id,
            display_name: creatorName,
            avatar_url: creatorAvatarUrl,
            user_id: user.id,
            role: "owner",
        },
        ...memberNames.map((name) => ({
            bill_group_id: group.id,
            display_name: name,
            avatar_url: null as string | null,
            user_id: null as string | null,
            role: "member",
        })),
    ];

    const { error: memberError } = await supabase.from("bill_group_members").insert(membersToInsert);

    if (memberError) {
        throw memberError;
    }

    return group;
}

export async function getBillGroup(id: string): Promise<BillGroup | null> {
    const supabase = createClient();

    const { data, error } = await supabase.from("bill_groups").select("*").eq("id", id).single();

    if (error) {
        return null;
    }

    return data;
}

export async function getBillGroupMembers(billGroupId: string): Promise<Member[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("bill_group_members")
        .select("id, display_name, avatar_url, user_id, role")
        .eq("bill_group_id", billGroupId)
        .order("joined_at", { ascending: true });

    if (error) {
        throw error;
    }

    return data as Member[];
}

export async function getBillGroups(userId: string): Promise<BillGroupWithMembers[]> {
    const supabase = createClient();

    // 查使用者參與了哪些帳本
    const { data: memberRows, error: memberError } = await supabase
        .from("bill_group_members")
        .select("bill_group_id")
        .eq("user_id", userId);

    if (memberError) {
        throw memberError;
    }

    const groupIds = [...new Set(memberRows.map((r) => r.bill_group_id))];

    if (groupIds.length === 0) {
        return [];
    }

    // 撈這些帳本的完整資料（含所有成員）
    const { data, error } = await supabase
        .from("bill_groups")
        .select(`*, bill_group_members(id, display_name, avatar_url, user_id, role)`)
        .in("id", groupIds)
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data.map((g: Record<string, unknown>) => ({
        ...(g as BillGroup),
        members: (g.bill_group_members as Member[]) ?? [],
    }));
}

export async function claimMember(params: ClaimMemberParams): Promise<Member> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("bill_group_members")
        .update({ user_id: params.userId, avatar_url: params.avatarUrl })
        .eq("id", params.memberId)
        .is("user_id", null)
        .select("id, display_name, avatar_url, user_id, role")
        .single();

    if (error) {
        throw error;
    }

    return data as Member;
}

export async function addBill(params: AddBillParams): Promise<Bill> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("bills")
        .insert({
            bill_group_id: params.billGroupId,
            paid_by: params.paidBy,
            title: params.title,
            amount: params.amount,
            category: params.category,
            split_with: params.splitWith,
            note: params.note ?? null,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export async function getBills(billGroupId: string): Promise<Bill[]> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("bills")
        .select("*")
        .eq("bill_group_id", billGroupId)
        .order("billed_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data;
}

export async function updateBill(updated: Bill): Promise<Bill> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("bills")
        .update({
            title: updated.title,
            amount: updated.amount,
            category: updated.category,
            paid_by: updated.paid_by,
            split_with: updated.split_with,
        })
        .eq("id", updated.id)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export async function deleteBill(billId: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase.from("bills").delete().eq("id", billId);

    if (error) {
        throw error;
    }
}

export async function closeBillGroup(billGroupId: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase.from("bill_groups").update({ is_active: false }).eq("id", billGroupId);

    if (error) {
        throw error;
    }
}

export async function addMember(billGroupId: string, displayName: string): Promise<Member> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from("bill_group_members")
        .insert({ bill_group_id: billGroupId, display_name: displayName, role: "member" })
        .select("id, display_name, avatar_url, user_id, role")
        .single();

    if (error) {
        throw error;
    }

    return data as Member;
}
