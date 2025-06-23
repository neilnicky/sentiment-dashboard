import { WebSocketServer, WebSocket } from "ws";

let wss;

export function initWebSocketServer(server) {
  wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    console.log("🧠 Client connected via WebSocket");
    ws.on("message", (msg) => {
      console.log("📩 message received:", msg);
    });
    ws.on("close", () => {
      console.log("❌ WebSocket client disconnected");
    });

    ws.send(JSON.stringify({ status: "connected" }));
  });
}

export function broadcastResult(result) {
  if (!wss) return;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(result));
    }
  });
}
