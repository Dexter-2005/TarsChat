"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trash2, SmilePlus } from "lucide-react";
import { formatMessageTime } from "@/lib/time";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

interface MessageBubbleProps {
    message: {
        _id: Id<"messages">;
        content: string;
        _creationTime: number;
        isDeleted: boolean;
        senderId: Id<"users">;
        sender: {
            _id: Id<"users">;
            name: string;
            imageUrl: string;
            clerkId: string;
        } | null;
        reactions: Array<{
            emoji: string;
            userId: Id<"users">;
        }>;
    };
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const { user } = useUser();
    const removeMessage = useMutation(api.messages.remove);
    const reactToMessage = useMutation(api.messages.react);
    const [showActions, setShowActions] = useState(false);
    const [showReactions, setShowReactions] = useState(false);

    const isOwn = message.sender?.clerkId === user?.id;
    const time = formatMessageTime(message._creationTime);

    // Group reactions by emoji
    const reactionGroups: Record<string, number> = {};
    message.reactions.forEach((r) => {
        reactionGroups[r.emoji] = (reactionGroups[r.emoji] || 0) + 1;
    });

    const handleDelete = async () => {
        await removeMessage({ messageId: message._id });
    };

    const handleReact = async (emoji: string) => {
        await reactToMessage({ messageId: message._id, emoji });
        setShowReactions(false);
    };

    return (
        <div
            className={`flex gap-2 mb-3 group ${isOwn ? "flex-row-reverse" : ""}`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => {
                setShowActions(false);
                setShowReactions(false);
            }}
        >
            {!isOwn && (
                <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                    <AvatarImage src={message.sender?.imageUrl} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {message.sender?.name?.[0]?.toUpperCase() ?? "?"}
                    </AvatarFallback>
                </Avatar>
            )}

            <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%]`}>
                {!isOwn && (
                    <span className="text-[11px] text-muted-foreground mb-0.5 ml-1">
                        {message.sender?.name}
                    </span>
                )}

                <div className="relative">
                    <div
                        className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${message.isDeleted
                                ? "bg-muted/50 text-muted-foreground italic"
                                : isOwn
                                    ? "bg-primary text-primary-foreground rounded-br-md"
                                    : "bg-muted rounded-bl-md"
                            }`}
                    >
                        {message.isDeleted ? "🚫 This message was deleted" : message.content}
                    </div>

                    {/* Action buttons */}
                    {showActions && !message.isDeleted && (
                        <div
                            className={`absolute top-0 ${isOwn ? "-left-16" : "-right-16"
                                } flex items-center gap-0.5`}
                        >
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                        onClick={() => setShowReactions(!showReactions)}
                                    >
                                        <SmilePlus className="h-3.5 w-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>React</TooltipContent>
                            </Tooltip>

                            {isOwn && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                            onClick={handleDelete}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete</TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    )}

                    {/* Reaction picker */}
                    {showReactions && (
                        <div
                            className={`absolute -top-10 ${isOwn ? "right-0" : "left-0"
                                } flex items-center gap-0.5 bg-popover border border-border rounded-full px-1.5 py-1 shadow-lg z-10`}
                        >
                            {REACTION_EMOJIS.map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => handleReact(emoji)}
                                    className="hover:scale-125 transition-transform p-1 text-base"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Reactions display */}
                {Object.keys(reactionGroups).length > 0 && (
                    <div className={`flex gap-1 mt-0.5 ${isOwn ? "mr-1" : "ml-1"}`}>
                        {Object.entries(reactionGroups).map(([emoji, count]) => (
                            <button
                                key={emoji}
                                onClick={() => handleReact(emoji)}
                                className="flex items-center gap-0.5 bg-muted/80 hover:bg-muted rounded-full px-1.5 py-0.5 text-xs transition-colors"
                            >
                                <span>{emoji}</span>
                                {count > 1 && (
                                    <span className="text-muted-foreground">{count}</span>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                <span className={`text-[10px] text-muted-foreground mt-0.5 ${isOwn ? "mr-1" : "ml-1"}`}>
                    {time}
                </span>
            </div>
        </div>
    );
}
