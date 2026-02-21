// lib/socket.js
"use client";

import { io } from "socket.io-client";

// Connect to your external Socket.IO server (e.g., hosted on Heroku, a custom server, etc.)
// Replace 'http://localhost:4000' with your actual server URL.
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000";

// Create a single socket instance and attach to window to survive HMR / fast-refresh
const getSocket = () => {
    if (typeof window === "undefined") return null;

    if (!window.__MRH_SOCKET) {
        const s = io(SOCKET_URL, {
            path: "/mrh-backend/socket.io",
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            transports: ['websocket', 'polling'],
            timeout: 20000,
            forceNew: true
        });

        s.on("connect", () => {
            console.log("Socket connected:", s.id);
        });

        s.on("disconnect", (reason) => {
            console.log("Socket disconnected:", reason);
        });

        window.__MRH_SOCKET = s;
    }

    return window.__MRH_SOCKET;
};

const Socket = getSocket();
export default Socket;



