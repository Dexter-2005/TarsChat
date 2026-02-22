"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

export default function ConversationPage() {
    const params = useParams();
    const conversationId = params.conversationId as Id<"conversations">;

    const conversation = useQuery(api.conversations.get, { conversationId });
    const markRead = useMutation(api.conversations.markRead);

    // Mark conversation as read when opened
    useEffect(() => {
        if (conversationId) {
            markRead({ conversationId });
        }
    }, [conversationId, markRead]);

    return (
        <>
            <Sidebar />
            <div className="flex flex-1 flex-col bg-background">
                {conversation === undefined ? (
                    // Loading state
                    <div className="flex flex-col h-full">
                        <div className="flex items-center gap-3 p-4 border-b">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                        <div className="flex-1 p-4 space-y-4">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`flex ${i % 2 === 0 ? "" : "justify-end"}`}
                                >
                                    <Skeleton
                                        className={`h-12 rounded-2xl ${i % 2 === 0 ? "w-48" : "w-36"
                                            }`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : conversation === null ? (
                    <div className="flex flex-1 items-center justify-center">
                        <p className="text-muted-foreground">Conversation not found</p>
                    </div>
                ) : (
                    <>
                        <ChatHeader conversation={conversation} />
                        <MessageList conversationId={conversationId} />
                        <TypingIndicator conversationId={conversationId} />
                        <MessageInput conversationId={conversationId} />
                    </>
                )}
            </div>
        </>
    );
}
