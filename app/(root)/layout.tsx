"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePresence } from "@/hooks/usePresence";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useUser();
    const storeUser = useMutation(api.users.store);

    // Track online/offline presence
    usePresence();

    useEffect(() => {
        if (user) {
            storeUser();
        }
    }, [user, storeUser]);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {children}
        </div>
    );
}
