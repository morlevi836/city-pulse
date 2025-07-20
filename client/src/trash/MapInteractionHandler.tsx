import { useMap } from "react-leaflet";
import { useEffect } from "react";

export default function MapInteractionHandler({
  onUserInteraction,
}: {
  onUserInteraction: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    const handleInteraction = () => {
      onUserInteraction();
    };

    map.on("dragstart", handleInteraction);
    map.on("zoomstart", handleInteraction);

    return () => {
      map.off("dragstart", handleInteraction);
      map.off("zoomstart", handleInteraction);
    };
  }, [map, onUserInteraction]);

  return null;
}
