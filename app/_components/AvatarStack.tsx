"use client";

import Image from "next/image";

import type { Member } from "@/types";

type Props = {
    users: Member[];
    size?: "sm" | "md";
    max?: number;
};

const SIZE_MAP = {
    sm: "h-6 w-6 text-[10px]",
    md: "h-8 w-8 text-xs",
};

const OVERLAP_MAP = {
    sm: "-ml-2",
    md: "-ml-2.5",
};

export default function AvatarStack({ users, size = "sm", max = 6 }: Props) {
    const hasOverflow = users.length > max;
    const displayed = hasOverflow ? users.slice(0, max - 1) : users;
    const overflowCount = users.length - displayed.length;

    return (
        <div className="flex items-center">
            {displayed.map((user, i) => (
                <div
                    key={user.id}
                    style={{ zIndex: displayed.length - i }}
                    className={`${SIZE_MAP[size]} ${i > 0 ? OVERLAP_MAP[size] : ""} relative flex shrink-0 items-center justify-center rounded-full border-2 border-white bg-gray-200`}
                    title={user.display_name}
                >
                    {user.avatar_url ? (
                        <Image
                            src={user.avatar_url}
                            alt={user.display_name}
                            fill
                            className="rounded-full object-cover"
                        />
                    ) : (
                        <span className="font-medium text-gray-500">{user.display_name.charAt(0)}</span>
                    )}
                </div>
            ))}
            {hasOverflow && (
                <div
                    className={`${SIZE_MAP[size]} ${OVERLAP_MAP[size]} flex shrink-0 items-center justify-center rounded-full border-2 border-white bg-gray-100`}
                >
                    <span className="font-medium text-gray-400">+{overflowCount}</span>
                </div>
            )}
        </div>
    );
}
