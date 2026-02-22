"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, X } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface UserSearchProps {
    onSelectUser: (userId: Id<"users">) => void;
}

export function UserSearch({ onSelectUser }: UserSearchProps) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const users = useQuery(api.users.search, query ? { query } : "skip");
    const allUsers = useQuery(api.users.list);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const displayUsers = query ? users : allUsers;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search users..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="pl-9 pr-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery("");
                            setIsOpen(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {isOpen && displayUsers && displayUsers.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
                    <div className="max-h-60 overflow-y-auto">
                        {displayUsers.map((user) => (
                            <button
                                key={user._id}
                                onClick={() => {
                                    onSelectUser(user._id);
                                    setQuery("");
                                    setIsOpen(false);
                                }}
                                className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors"
                            >
                                <div className="relative">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={user.imageUrl} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                                            {user.name?.[0]?.toUpperCase() ?? "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    {user.isOnline && (
                                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-popover" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{user.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        {user.email}
                                    </p>
                                </div>
                                {user.isOnline ? (
                                    <span className="text-xs text-emerald-500 font-medium">
                                        Online
                                    </span>
                                ) : (
                                    <span className="text-xs text-muted-foreground">
                                        Offline
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {isOpen && displayUsers && displayUsers.length === 0 && query && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-popover p-4 shadow-lg text-center text-sm text-muted-foreground">
                    No users found for &ldquo;{query}&rdquo;
                </div>
            )}
        </div>
    );
}
