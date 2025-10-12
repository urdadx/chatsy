import "dotenv/config";
import { createServer } from "node:http";
import cors from "cors";
import express from "express";
import { createWebSocketServer } from "./lib/websocket";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).send("We're live baby!");
});

app.get("/ws/health", (_req, res) => {
  res.json({ ok: true });
});

const server = createServer(app);
createWebSocketServer(server);

const port = Number(process.env.PORT || 3000);
server.listen(port, () => {
  console.log(`Server is running on port ${port} (ws path: /ws)`);
});
