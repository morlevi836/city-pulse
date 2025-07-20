import React from "react";
import { useMap } from "react-leaflet";

export default function FlyToLocation({
  center,
  userInteracted,
}: {
  center: [number, number];
  userInteracted: boolean;
}) {
  const map = useMap();

  React.useEffect(() => {
    if (center && !userInteracted) {
      map.flyTo(center, 13, { duration: 1.5 });
    }
  }, [center, userInteracted, map]);

  return null;
}
