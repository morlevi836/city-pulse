import { useEffect } from "react";
import L from "leaflet";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "../constants/mapConstants";

export default function useMapInitialization(
  mapRef: React.RefObject<L.Map | null>,
  geoJsonLayerRef: React.RefObject<L.LayerGroup | null>,
  vehiclesLayerRef: React.RefObject<L.LayerGroup | null>,
  setMapBounds: React.Dispatch<React.SetStateAction<L.LatLngBounds | null>>,
  onUserInteraction: () => void
) {
  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("leaflet-map-container", {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      preferCanvas: true,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://osm.org">OpenStreetMap</a> contributors',
    }).addTo(map);

    const handleMoveEnd = () => {
      const newBounds = map.getBounds();
      setMapBounds((prevBounds) => {
        if (!prevBounds || !prevBounds.equals(newBounds)) {
          return newBounds;
        }
        return prevBounds;
      });
    };

    map.on("dragstart", onUserInteraction);
    map.on("zoomstart", onUserInteraction);
    map.on("movestart", onUserInteraction);
    map.on("moveend", handleMoveEnd);

    geoJsonLayerRef.current = L.geoJSON().addTo(map);
    vehiclesLayerRef.current = L.layerGroup().addTo(map);
    setMapBounds(map.getBounds());

    return () => {
      map.off("dragstart", onUserInteraction);
      map.off("zoomstart", onUserInteraction);
      map.off("movestart", onUserInteraction);
      map.off("moveend", handleMoveEnd);
      map.remove();
      mapRef.current = null;
      geoJsonLayerRef.current = null;
      vehiclesLayerRef.current = null;
    };
  }, [
    geoJsonLayerRef,
    mapRef,
    onUserInteraction,
    setMapBounds,
    vehiclesLayerRef,
  ]);
}
