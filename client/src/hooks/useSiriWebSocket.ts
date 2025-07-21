import { useEffect, useState } from "react";
import type { VehicleType } from "../types/vehicle";

export function useSiriWebSocket() {
  const [history, setHistory] = useState<
    { timestamp: number; vehicles: VehicleType[] }[]
  >([]);

  useEffect(() => {
    const ws = new WebSocket(
      `${window.location.protocol === "https:" ? "wss" : "ws"}://${
        window.location.hostname
      }:3000/ws`
    );

    ws.onopen = () => console.log("WS connected");

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.vehicles) {
          const newSnapshot = {
            timestamp: Date.now(),
            vehicles: message.vehicles,
          };

          // שמירה של עד 100 רשומות
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
