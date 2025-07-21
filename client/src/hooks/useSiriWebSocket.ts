import { useEffect, useState } from "react";
import type { VehicleType } from "../types/vehicle";

export function useSiriWebSocket() {
  const [history, setHistory] = useState<
    { timestamp: number; vehicles: VehicleType[] }[]
  >([]);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
    const wsProtocol = baseUrl.startsWith("https") ? "wss" : "ws";

    const url = new URL(baseUrl);

    const wsUrl = `${wsProtocol}://${url.host}/ws`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => console.log("WS connected");

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.vehicles) {
          const newSnapshot = {
            timestamp: Date.now(),
            vehicles: message.vehicles,
          };

          setHistory((prev) => [...prev.slice(-99), newSnapshot]);
        }
      } catch (e) {
        console.error("WS message parse error", e);
      }
    };

    ws.onerror = (error) => console.error("WS error", error);
    ws.onclose = () => console.log("WS disconnected");

    return () => ws.close();
  }, []);

  return history;
}
