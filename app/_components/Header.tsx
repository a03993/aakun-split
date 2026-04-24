"use client";

import Image from "next/image";
import Link from "next/link";

import { useLiff } from "@/hooks/useLiff";

export default function Header() {
    const { profile } = useLiff();

    if (!profile) {
        return;
    }

    return (
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-gray-100 bg-white px-4">
            <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-100">
                    <span className="text-xs font-bold text-lime-700">OAO</span>
                </div>
                <span className="text-base font-bold text-gray-800">分帳AA君</span>
            </Link>
            <div className="flex items-center gap-2.5">
                <span className="text-sm text-gray-500">{profile.displayName}</span>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                    {profile.pictureUrl ? (
                        <Image
                            src={profile.pictureUrl}
                            alt={profile.displayName}
                            fill
                            className="rounded-full object-cover"
                        />
                    ) : (
                        <span className="text-sm font-medium text-gray-500">{profile.displayName.charAt(0)}</span>
                    )}
                </div>
            </div>
        </header>
    );
}
