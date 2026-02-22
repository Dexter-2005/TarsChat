import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const store = mutation({
    args: {
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const existing = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        const name = args.name || identity.nickname || identity.name || identity.email?.split("@")[0] || "Unknown";
        const email = args.email || identity.email || "";
        const imageUrl = args.imageUrl || identity.pictureUrl || "";

        if (existing) {
            // Update existing user
            await ctx.db.patch(existing._id, {
                name,
                email,
                imageUrl,
                isOnline: true,
                lastSeen: Date.now(),
            });
            return existing._id;
        }

        // Create new user
        return await ctx.db.insert("users", {
            clerkId: identity.subject,
            name,
            email,
            imageUrl,
            isOnline: true,
            lastSeen: Date.now(),
        });
    },
});

export const get = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();
    },
});

export const list = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const users = await ctx.db.query("users").collect();
        return users.filter((u) => u.clerkId !== identity.subject);
    },
});

export const search = query({
    args: { query: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const users = await ctx.db.query("users").collect();
        const q = args.query.toLowerCase();
        return users.filter(
            (u) =>
                u.clerkId !== identity.subject &&
                (u.name.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q))
        );
    },
});

export const setOnline = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (user) {
            await ctx.db.patch(user._id, { isOnline: true, lastSeen: Date.now() });
        }
    },
});

export const setOffline = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (user) {
            await ctx.db.patch(user._id, { isOnline: false, lastSeen: Date.now() });
        }
    },
});
