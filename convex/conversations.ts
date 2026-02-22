import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createOrGet = mutation({
    args: { participantId: v.id("users") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) throw new Error("User not found");

        // Check if a 1-on-1 conversation already exists between these two users
        const allConversations = await ctx.db.query("conversations").collect();
        const existing = allConversations.find(
            (c) =>
                !c.isGroup &&
                c.participantIds.length === 2 &&
                c.participantIds.includes(currentUser._id) &&
                c.participantIds.includes(args.participantId)
        );

        if (existing) return existing._id;

        // Create a new 1-on-1 conversation
        const conversationId = await ctx.db.insert("conversations", {
            isGroup: false,
            participantIds: [currentUser._id, args.participantId],
            lastMessageTime: Date.now(),
        });

        // Create participant records
        await ctx.db.insert("conversationParticipants", {
            conversationId,
            userId: currentUser._id,
            lastReadTime: Date.now(),
        });
        await ctx.db.insert("conversationParticipants", {
            conversationId,
            userId: args.participantId,
            lastReadTime: Date.now(),
        });

        return conversationId;
    },
});

export const createGroup = mutation({
    args: {
        name: v.string(),
        memberIds: v.array(v.id("users")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) throw new Error("User not found");

        const allParticipants = [currentUser._id, ...args.memberIds];

        const conversationId = await ctx.db.insert("conversations", {
            isGroup: true,
            name: args.name,
            participantIds: allParticipants,
            lastMessageTime: Date.now(),
        });

        // Create participant records for all members
        for (const userId of allParticipants) {
            await ctx.db.insert("conversationParticipants", {
                conversationId,
                userId,
                lastReadTime: Date.now(),
            });
        }

        return conversationId;
    },
});

export const list = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) return [];

        // Get all conversations the user is part of
        const allConversations = await ctx.db.query("conversations").collect();
        const userConversations = allConversations.filter((c) =>
            c.participantIds.includes(currentUser._id)
        );

        // Enrich with last message and participant info
        const enriched = await Promise.all(
            userConversations.map(async (conv) => {
                // Get last message
                const messages = await ctx.db
                    .query("messages")
                    .withIndex("by_conversationId", (q) =>
                        q.eq("conversationId", conv._id)
                    )
                    .order("desc")
                    .take(1);

                const lastMessage = messages[0] ?? null;

                // Get unread count
                const participantRecord = await ctx.db
                    .query("conversationParticipants")
                    .withIndex("by_conversationId_userId", (q) =>
                        q.eq("conversationId", conv._id).eq("userId", currentUser._id)
                    )
                    .unique();

                const lastReadTime = participantRecord?.lastReadTime ?? 0;

                const allMessages = await ctx.db
                    .query("messages")
                    .withIndex("by_conversationId", (q) =>
                        q.eq("conversationId", conv._id)
                    )
                    .collect();

                const unreadCount = allMessages.filter(
                    (m) =>
                        m._creationTime > lastReadTime &&
                        m.senderId !== currentUser._id
                ).length;

                // Get participant details
                const otherParticipants = await Promise.all(
                    conv.participantIds
                        .filter((id) => id !== currentUser._id)
                        .map((id) => ctx.db.get(id))
                );

                return {
                    ...conv,
                    lastMessage,
                    unreadCount,
                    otherParticipants: otherParticipants.filter(Boolean),
                };
            })
        );

        // Sort by last message time (most recent first)
        return enriched.sort(
            (a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0)
        );
    },
});

export const get = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) return null;

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) return null;

        // Get all participants
        const participants = await Promise.all(
            conversation.participantIds.map((id) => ctx.db.get(id))
        );

        return {
            ...conversation,
            participants: participants.filter(Boolean),
            otherParticipants: participants.filter(
                (p) => p && p._id !== currentUser._id
            ),
        };
    },
});

export const markRead = mutation({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) return;

        const participantRecord = await ctx.db
            .query("conversationParticipants")
            .withIndex("by_conversationId_userId", (q) =>
                q.eq("conversationId", args.conversationId).eq("userId", currentUser._id)
            )
            .unique();

        if (participantRecord) {
            await ctx.db.patch(participantRecord._id, { lastReadTime: Date.now() });
        }
    },
});
