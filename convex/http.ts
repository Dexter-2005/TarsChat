import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Clerk webhook to sync user data
http.route({
    path: "/clerk-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const body = await request.json();
        const eventType = body.type;

        if (eventType === "user.created" || eventType === "user.updated") {
            // The user will be synced when they first authenticate
            // via the store mutation called from the client
        }

        return new Response("OK", { status: 200 });
    }),
});

export default http;
