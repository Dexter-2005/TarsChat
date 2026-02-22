"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, X, Check } from "lucide-react";

export function CreateGroupDialog() {
    const [open, setOpen] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState<Id<"users">[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const users = useQuery(api.users.list);
    const createGroup = useMutation(api.conversations.createGroup);
    const router = useRouter();

    const filteredUsers = users?.filter((u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleMember = (userId: Id<"users">) => {
        setSelectedMembers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleCreate = async () => {
        if (!groupName.trim() || selectedMembers.length < 1) return;

        const conversationId = await createGroup({
            name: groupName.trim(),
            memberIds: selectedMembers,
        });

        setOpen(false);
        setGroupName("");
        setSelectedMembers([]);
        setSearchQuery("");
        router.push(`/conversation/${conversationId}`);
    };

    const selectedUsers = users?.filter((u) => selectedMembers.includes(u._id));

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                    <Users className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create Group Chat</DialogTitle>
                    <DialogDescription>
                        Add a name and select members for your group.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Group Name */}
                    <Input
                        placeholder="Group name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
                    />

                    {/* Selected Members */}
                    {selectedUsers && selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {selectedUsers.map((user) => (
                                <Badge
                                    key={user._id}
                                    variant="secondary"
                                    className="gap-1 pr-1 pl-2 py-1"
                                >
                                    {user.name}
                                    <button
                                        onClick={() => toggleMember(user._id)}
                                        className="hover:bg-foreground/10 rounded-full p-0.5"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Search Users */}
                    <Input
                        placeholder="Search users to add..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
                    />

                    {/* User List */}
                    <ScrollArea className="max-h-48">
                        <div className="space-y-0.5">
                            {filteredUsers?.map((user) => {
                                const isSelected = selectedMembers.includes(user._id);
                                return (
                                    <button
                                        key={user._id}
                                        onClick={() => toggleMember(user._id)}
                                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${isSelected
                                                ? "bg-primary/10"
                                                : "hover:bg-accent"
                                            }`}
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.imageUrl} />
                                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                {user.name[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {user.name}
                                            </p>
                                        </div>
                                        {isSelected && (
                                            <Check className="h-4 w-4 text-primary" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleCreate}
                        disabled={!groupName.trim() || selectedMembers.length < 1}
                        className="w-full rounded-full"
                    >
                        Create Group ({selectedMembers.length} member
                        {selectedMembers.length !== 1 ? "s" : ""})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
