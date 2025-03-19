import React, { useEffect } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useWebSocket } from "@/app/context/WebSocketProvider";
import { router } from "expo-router";

export default function HomeScreen() {
    const { ws, isConnected } = useWebSocket(); // ✅ Ensure `ws` and `isConnected` are returned

    useEffect(() => {
        if (ws && isConnected) {
            console.log("📡 WebSocket Available in HomeScreen");
            ws.send("Hello from HomeScreen");
        }
    }, [ws, isConnected]);

    const sendMessage = () => {
        if (ws && isConnected) {
            ws.send("Test Message from Home");
            console.log("📨 Message Sent!");
        } else {
            console.log("❌ WebSocket is not connected, cannot send message.");
        }
    };

    return (
        <View style={styles.container}>
            <Text>Home Screen</Text>
            <Text>Status: {isConnected ? "✅ Connected" : "❌ Disconnected"}</Text>
            <Button title="Send Test Message" onPress={sendMessage} />
            <Button title="Go to Live Scoring" onPress={() => router.push("/livescoring_game")} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
