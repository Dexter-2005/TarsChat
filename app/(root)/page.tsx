"use client";

import { Sidebar } from "@/components/sidebar/Sidebar";
import { MessageSquare } from "lucide-react";

export default function HomePage() {
    return (
        <>
            <Sidebar />
            <div className="hidden flex-1 md:flex items-center justify-center bg-muted/30">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                        <MessageSquare className="h-10 w-10 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Welcome to Tars Chat
                        </h2>
                        <p className="mt-2 text-muted-foreground max-w-sm">
                            Select a conversation from the sidebar or search for a user to
                            start chatting.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
