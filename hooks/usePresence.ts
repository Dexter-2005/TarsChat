"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function usePresence() {
    const setOnline = useMutation(api.users.setOnline);
    const setOffline = useMutation(api.users.setOffline);

    useEffect(() => {
        // Set online when component mounts
        setOnline();

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setOffline();
            } else {
                setOnline();
            }
        };

        const handleBeforeUnload = () => {
            setOffline();
        };

        const handleFocus = () => {
            setOnline();
        };

        const handleBlur = () => {
            // Only set offline after a delay to avoid flicker
            setTimeout(() => {
                if (document.hidden) {
                    setOffline();
                }
            }, 5000);
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", handleBeforeUnload);
        window.addEventListener("focus", handleFocus);
        window.addEventListener("blur", handleBlur);

        // Heartbeat: keep online status alive every 30 seconds
        const heartbeat = setInterval(() => {
            if (!document.hidden) {
                setOnline();
            }
        }, 30000);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("focus", handleFocus);
            window.removeEventListener("blur", handleBlur);
            clearInterval(heartbeat);
            setOffline();
        };
    }, [setOnline, setOffline]);
}
