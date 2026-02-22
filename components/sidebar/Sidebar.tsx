"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { UserSearch } from "./UserSearch";
import { ConversationItem } from "./ConversationItem";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export function Sidebar() {
    const conversations = useQuery(api.conversations.list);
    const createOrGet = useMutation(api.conversations.createOrGet);
    const router = useRouter();
    const [isMobileOpen, setIsMobileOpen] = useState(true);

    const handleSelectUser = async (userId: Id<"users">) => {
        const conversationId = await createOrGet({ participantId: userId });
        router.push(`/conversation/${conversationId}`);
        setIsMobileOpen(false);
    };

    return (
        <div
            className={`${isMobileOpen ? "flex" : "hidden md:flex"
                } w-full md:w-[380px] flex-col border-r border-border bg-card`}
        >
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-border">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
                    Tars Chat
                </h1>
                <div className="flex items-center gap-2">
                    <CreateGroupDialog />
                    <UserButton
                        afterSignOutUrl="/sign-in"
                        appearance={{
                            elements: {
                                avatarBox: "h-8 w-8",
                            },
                        }}
                    />
                </div>
            </div>

            {/* User Search */}
            <div className="p-3">
                <UserSearch onSelectUser={handleSelectUser} />
            </div>

            <Separator />

            {/* Conversation List */}
            <ScrollArea className="flex-1">
                <div className="p-2">
                    {conversations === undefined ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 p-3">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-48" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                                <Users className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold text-lg">No conversations yet</h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-[200px]">
                                Search for a user above to start a conversation
                            </p>
                        </div>
                    ) : (
                        conversations.map((conversation) => (
                            <ConversationItem
                                key={conversation._id}
                                conversation={conversation}
                                onMobileSelect={() => setIsMobileOpen(false)}
                            />
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
