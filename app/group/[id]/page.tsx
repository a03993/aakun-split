import type { Metadata } from "next";

import { getBillGroup } from "@/lib/services/billing";

import GroupDetail from "./_components/GroupDetail";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const group = await getBillGroup(id);

    if (!group) {
        return {};
    }

    return {
        title: group.name,
        description: `加入「${group.name}」一起分帳！`,
    };
}

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return <GroupDetail id={id} />;
}
