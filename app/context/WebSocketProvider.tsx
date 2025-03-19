import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const BASE_URL = "http://51.91.64.195:8093";

        console.log("🔄 Connecting to Socket.IO server...");

        const newSocket = io(BASE_URL, {
            withCredentials: true, // Ensures cookies are sent
            transports: ["websocket"],
        });

        setSocket(newSocket);

        newSocket.on("connect", () => {
            console.log("✅ Socket.IO Connected");
            setIsConnected(true);
        });

        newSocket.on("disconnect", () => {
            console.log("❌ Socket.IO Disconnected");
            setIsConnected(false);
        });

        newSocket.on("connect_error", (error) => {
            console.error("⚠️ Socket.IO Connection Error:", error);
        });

        return () => {
            console.log("🔌 Disconnecting from Socket.IO...");
            newSocket.disconnect();
        };
    }, []);

    const sendMessage = (message) => {
        if (!socket || !isConnected) {
            console.log("❌ Cannot send: Socket.IO is not connected");
            return;
        }

        socket.emit("event", message);
        console.log(`📤 Sent Message: ${message}`);
    };

    return (
        <WebSocketContext.Provider value={{ socket, isConnected, sendMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    return useContext(WebSocketContext);
};
