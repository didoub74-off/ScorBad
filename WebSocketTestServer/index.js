const WebSocket = require("ws");
const readline = require("readline");

const wss = new WebSocket.Server({ port: 8080 }); // ✅ Runs on ws://localhost:8080

console.log("✅ WebSocket server running on ws://localhost:8080");

// Handle incoming WebSocket connections
wss.on("connection", (ws) => {
    console.log("🔗 New client connected");

    ws.on("message", (message) => {
        console.log(`📩 Received from client: ${message}`);
        ws.send(`✅ Server received: ${message}`);
    });

    ws.on("close", () => {
        console.log("❌ Client disconnected");
    });
});

// ✅ Read input from the command line to send messages to all clients
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.setPrompt("💬 Type a message to send to all clients: ");
rl.prompt();

rl.on("line", (input) => {
    console.log(`📤 Sending: ${input}`);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(input);
        }
    });
    rl.prompt();
});
