"use client";

import { useState, useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizontal } from "lucide-react";

interface MessageInputProps {
    conversationId: Id<"conversations">;
}

export function MessageInput({ conversationId }: MessageInputProps) {
    const [message, setMessage] = useState("");
    const sendMessage = useMutation(api.messages.send);
    const setTyping = useMutation(api.typing.setTyping);
    const typingTimeout = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleTyping = useCallback(() => {
        setTyping({ conversationId });

        // Debounce typing indicator
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
            // Typing indicator will auto-dismiss after 3s on the server
        }, 2000);
    }, [conversationId, setTyping]);

    const handleSend = async () => {
        const trimmed = message.trim();
        if (!trimmed) return;

        setMessage("");
        await sendMessage({
            conversationId,
            content: trimmed,
        });
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="border-t border-border p-4 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <Input
                    ref={inputRef}
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => {
                        setMessage(e.target.value);
                        handleTyping();
                    }}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50 rounded-full px-4"
                    autoFocus
                />
                <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!message.trim()}
                    className="rounded-full h-10 w-10 bg-primary hover:bg-primary/90 transition-all duration-200 disabled:opacity-30"
                >
                    <SendHorizontal className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
