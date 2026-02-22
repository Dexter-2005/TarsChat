"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MessageBubble } from "./MessageBubble";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronDown, MessageSquare } from "lucide-react";

interface MessageListProps {
    conversationId: Id<"conversations">;
}

export function MessageList({ conversationId }: MessageListProps) {
    const messages = useQuery(api.messages.list, { conversationId });
    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isNearBottom, setIsNearBottom] = useState(true);
    const prevMessageCount = useRef(0);

    const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
        bottomRef.current?.scrollIntoView({ behavior });
    }, []);

    // Auto-scroll when new messages arrive (only if near bottom)
    useEffect(() => {
        if (!messages) return;

        if (messages.length > prevMessageCount.current) {
            if (isNearBottom) {
                scrollToBottom();
            } else {
                setShowScrollButton(true);
            }
        }
        prevMessageCount.current = messages.length;
    }, [messages, isNearBottom, scrollToBottom]);

    // Initial scroll to bottom
    useEffect(() => {
        if (messages && messages.length > 0) {
            scrollToBottom("instant");
        }
    }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const target = event.currentTarget;
        const distanceFromBottom =
            target.scrollHeight - target.scrollTop - target.clientHeight;
        const nearBottom = distanceFromBottom < 100;
        setIsNearBottom(nearBottom);
        setShowScrollButton(!nearBottom);
    };

    if (!messages) return null;

    if (messages.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg">No messages yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Send a message to start the conversation!
                </p>
            </div>
        );
    }

    // Group messages by date
    const groupedMessages: { date: string; messages: typeof messages }[] = [];
    let currentDate = "";

    messages.forEach((msg) => {
        const date = new Date(msg._creationTime).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        });

        if (date !== currentDate) {
            currentDate = date;
            groupedMessages.push({ date, messages: [msg] });
        } else {
            groupedMessages[groupedMessages.length - 1].messages.push(msg);
        }
    });

    return (
        <div className="relative flex-1 overflow-hidden">
            <div
                className="h-full overflow-y-auto px-4 py-4"
                onScroll={handleScroll}
                ref={scrollRef}
            >
                {groupedMessages.map((group) => (
                    <div key={group.date}>
                        <div className="flex items-center gap-4 my-4">
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-xs text-muted-foreground font-medium px-2">
                                {group.date}
                            </span>
                            <div className="flex-1 h-px bg-border" />
                        </div>
                        {group.messages.map((message) => (
                            <MessageBubble key={message._id} message={message} />
                        ))}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Scroll to bottom button */}
            {showScrollButton && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                            scrollToBottom();
                            setShowScrollButton(false);
                        }}
                        className="rounded-full shadow-lg gap-1 px-4"
                    >
                        <ChevronDown className="h-4 w-4" />
                        New messages
                    </Button>
                </div>
            )}
        </div>
    );
}
