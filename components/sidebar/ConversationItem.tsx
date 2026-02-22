"use client";

import { useRouter, useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "@/lib/time";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ConversationItemProps {
    conversation: any;
    onMobileSelect: () => void;
}

export function ConversationItem({
    conversation,
    onMobileSelect,
}: ConversationItemProps) {
    const router = useRouter();
    const params = useParams();
    const isActive = params?.conversationId === conversation._id;

    const otherUser = conversation.otherParticipants?.[0];
    const displayName = conversation.isGroup
        ? conversation.name ?? "Group"
        : otherUser?.name ?? "Unknown";
    const displayImage = conversation.isGroup ? "" : otherUser?.imageUrl ?? "";
    const isOnline = !conversation.isGroup && otherUser?.isOnline;

    const lastMessageText = conversation.lastMessage
        ? conversation.lastMessage.isDeleted
            ? "🚫 This message was deleted"
            : conversation.lastMessage.content
        : "No messages yet";

    const lastMessageTime = conversation.lastMessage
        ? formatDistanceToNow(conversation.lastMessage._creationTime)
        : "";

    return (
        <button
            onClick={() => {
                router.push(`/conversation/${conversation._id}`);
                onMobileSelect();
            }}
            className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all duration-200 hover:bg-accent group ${isActive ? "bg-accent shadow-sm" : ""
                }`}
        >
            <div className="relative flex-shrink-0">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={displayImage} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-chart-1/20 text-primary font-semibold">
                        {conversation.isGroup
                            ? conversation.name?.[0]?.toUpperCase() ?? "G"
                            : displayName[0]?.toUpperCase() ?? "?"}
                    </AvatarFallback>
                </Avatar>
                {isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold truncate">{displayName}</p>
                    {lastMessageTime && (
                        <span className="text-[11px] text-muted-foreground flex-shrink-0 ml-2">
                            {lastMessageTime}
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {lastMessageText}
                    </p>
                    {conversation.unreadCount > 0 && (
                        <Badge
                            variant="default"
                            className="ml-2 h-5 min-w-[20px] px-1.5 flex items-center justify-center text-[10px] font-bold rounded-full bg-primary"
                        >
                            {conversation.unreadCount > 99
                                ? "99+"
                                : conversation.unreadCount}
                        </Badge>
                    )}
                </div>
            </div>
        </button>
    );
}
