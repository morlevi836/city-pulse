import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { WebSocketServer } from "ws";

import municipalitiesRouter from "./routes/municipalities";
import siriRouter from "./routes/siri";
import siriWsHandler from "./routes/siriWs";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(municipalitiesRouter);
app.use(siriRouter);

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

siriWsHandler(wss);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
