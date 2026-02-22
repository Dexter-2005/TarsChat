"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ChatHeaderProps {
    conversation: any;
}

export function ChatHeader({ conversation }: ChatHeaderProps) {
    const router = useRouter();
    const otherUser = conversation.otherParticipants?.[0];

    const displayName = conversation.isGroup
        ? conversation.name ?? "Group Chat"
        : otherUser?.name ?? "Unknown";

    const displayImage = conversation.isGroup ? "" : otherUser?.imageUrl ?? "";
    const isOnline = !conversation.isGroup && otherUser?.isOnline;

    const statusText = conversation.isGroup
        ? `${conversation.participants?.length ?? 0} members`
        : isOnline
            ? "Online"
            : "Offline";

    return (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden h-8 w-8"
                    onClick={() => router.push("/")}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>

                <div className="relative">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={displayImage} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-chart-1/20 text-primary font-semibold">
                            {displayName[0]?.toUpperCase() ?? "?"}
                        </AvatarFallback>
                    </Avatar>
                    {isOnline && (
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
                    )}
                </div>

                <div>
                    <h2 className="text-sm font-semibold leading-tight">{displayName}</h2>
                    <p
                        className={`text-xs ${isOnline ? "text-emerald-500" : "text-muted-foreground"
                            }`}
                    >
                        {statusText}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
