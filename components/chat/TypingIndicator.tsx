"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface TypingIndicatorProps {
    conversationId: Id<"conversations">;
}

export function TypingIndicator({ conversationId }: TypingIndicatorProps) {
    const typingUsers = useQuery(api.typing.list, { conversationId });

    if (!typingUsers || typingUsers.length === 0) return null;

    const names = typingUsers.map((u) => u?.name).filter(Boolean);
    const text =
        names.length === 1
            ? `${names[0]} is typing`
            : names.length === 2
                ? `${names[0]} and ${names[1]} are typing`
                : `${names[0]} and ${names.length - 1} others are typing`;

    return (
        <div className="px-4 py-1.5 text-xs text-muted-foreground flex items-center gap-2">
            <div className="flex gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
            </div>
            <span>{text}</span>
        </div>
    );
}
