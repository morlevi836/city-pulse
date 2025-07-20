import { WebSocketServer, WebSocket } from "ws";
import { fetchAndParseSiriData } from "../services/siriService";
import { files } from "../constants/files";

export default function siriWsHandler(wss: WebSocketServer) {
  wss.on("connection", (ws: WebSocket) => {
    console.log("New WS client connected");

    let currentIndex = 0;

    fetchAndParseSiriData(currentIndex).then((data) => {
      ws.send(JSON.stringify({ vehicles: data }));
    });

    const interval = setInterval(async () => {
      currentIndex = (currentIndex + 1) % files.length;

      try {
        const data = await fetchAndParseSiriData(currentIndex);
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({ vehicles: data }));
        }
      } catch (err) {
        console.warn(`WS fetch failed for index ${currentIndex}`);
      }
    }, 3000);

    ws.on("close", () => {
      console.log("WS client disconnected");
      clearInterval(interval);
    });

    ws.on("error", (err) => {
      console.error("WS error", err);
      clearInterval(interval);
    });
  });
}
