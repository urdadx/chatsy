#!/usr/bin/env node

/**
 * WebSocket Test Script
 *
 * This script tests the WebSocket server by:
 * 1. Connecting to the WebSocket server
 * 2. Joining a test chat room
 * 3. Sending a test message
 * 4. Listening for responses
 *
 * Usage:
 *   node test-websocket.js <chatId>
 */

import { WebSocket } from "ws";

const chatId = process.argv[2] || "test-chat-id";
const wsUrl = process.env.WS_URL || "ws://localhost:3000/ws";

console.log("🚀 Testing WebSocket connection...");
console.log("📍 URL:", wsUrl);
console.log("💬 Chat ID:", chatId);
console.log("");

const ws = new WebSocket(wsUrl);

ws.on("open", () => {
  console.log("✅ WebSocket connected");

  // Join the chat room
  const joinMessage = {
    type: "join",
    chatId: chatId,
    role: "agent",
  };

  console.log("📤 Sending JOIN:", JSON.stringify(joinMessage, null, 2));
  ws.send(JSON.stringify(joinMessage));

  // Send a test message after 1 second
  setTimeout(() => {
    const testMessage = {
      type: "message",
      chatId: chatId,
      text: "Hello! This is a test message from the WebSocket test script.",
      role: "agent",
    };

    console.log("📤 Sending MESSAGE:", JSON.stringify(testMessage, null, 2));
    ws.send(JSON.stringify(testMessage));

    // Send typing indicator
    setTimeout(() => {
      const typingMessage = {
        type: "typing",
        chatId: chatId,
        role: "agent",
        isTyping: true,
      };

      console.log("📤 Sending TYPING:", JSON.stringify(typingMessage, null, 2));
      ws.send(JSON.stringify(typingMessage));

      // Stop typing after 2 seconds
      setTimeout(() => {
        typingMessage.isTyping = false;
        console.log(
          "📤 Sending TYPING (stop):",
          JSON.stringify(typingMessage, null, 2),
        );
        ws.send(JSON.stringify(typingMessage));

        // Leave and close after 1 second
        setTimeout(() => {
          const leaveMessage = {
            type: "leave",
            chatId: chatId,
          };

          console.log(
            "📤 Sending LEAVE:",
            JSON.stringify(leaveMessage, null, 2),
          );
          ws.send(JSON.stringify(leaveMessage));

          setTimeout(() => {
            ws.close();
            console.log("👋 Connection closed");
            process.exit(0);
          }, 500);
        }, 1000);
      }, 2000);
    }, 1000);
  }, 1000);
});

ws.on("message", (data) => {
  try {
    const message = JSON.parse(data.toString());
    console.log("📥 Received:", JSON.stringify(message, null, 2));
  } catch (err) {
    console.log("📥 Received (raw):", data.toString());
  }
});

ws.on("error", (error) => {
  console.error("❌ WebSocket error:", error.message);
  process.exit(1);
});

ws.on("close", () => {
  console.log("🔌 WebSocket closed");
});

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n⚠️  Interrupted, closing connection...");
  ws.close();
  process.exit(0);
});
