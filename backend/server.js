import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { sendToQueue } from "./queue.js";
import { broadcastResult, initWebSocketServer } from "./websocket.js";

const app = express();
const PORT = 4000;

app.use(bodyParser.json());

app.use(
  cors({
    origin: "http://localhost:5173", // allow frontend origin
    methods: ["GET", "POST"],
  })
);

app.post("/analyze", async (req, res) => {
  const { text } = req.body;
  await sendToQueue({ text });
  res.status(200).json({ message: "Submitted for analysis" });
});

const server = app.listen(PORT, () => {
  console.log(`Express running on http://localhost:${PORT}`);
});

initWebSocketServer(server);

app.post("/ws-broadcast", (req, res) => {
  broadcastResult(req.body);
  res.sendStatus(200);
});


