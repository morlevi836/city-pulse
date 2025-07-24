import React from "react";
import L from "leaflet";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "../constants/mapConstants";

// Initializes a Leaflet map and sets up layer groups and event listeners
export default function useMapInitialization(
  mapRef: React.RefObject<L.Map | null>,
  geoJsonLayerRef: React.RefObject<L.LayerGroup | null>,
  vehiclesLayerRef: React.RefObject<L.LayerGroup | null>,
  setMapBounds: React.Dispatch<React.SetStateAction<L.LatLngBounds | null>>,
  onUserInteraction: () => void
) {
  React.useEffect(() => {
    // Prevent initializing the map multiple times
    if (mapRef.current) return;

    // Create the Leaflet map instance
    const map = L.map("leaflet-map-container", {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      preferCanvas: true, // Improves performance with many elements
    });
    mapRef.current = map;

    // Add OpenStreetMap tiles to the map
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://osm.org">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Update map bounds when movement ends
    const handleMoveEnd = () => {
      const newBounds = map.getBounds();
      setMapBounds((prevBounds) => {
        // Only update if bounds have changed
        if (!prevBounds || !prevBounds.equals(newBounds)) {
          return newBounds;
        }
        return prevBounds;
      });
    };

    // Register interaction events to detect user movement
    map.on("dragstart", onUserInteraction);
    map.on("zoomstart", onUserInteraction);
    map.on("movestart", onUserInteraction);
    map.on("moveend", handleMoveEnd);

    // Initialize empty layers for GeoJSON and vehicles
    geoJsonLayerRef.current = L.geoJSON().addTo(map);
    vehiclesLayerRef.current = L.layerGroup().addTo(map);

    // Set initial bounds
    setMapBounds(map.getBounds());

    // Cleanup on unmount
    return () => {
      map.off("dragstart", onUserInteraction);
      map.off("zoomstart", onUserInteraction);
      map.off("movestart", onUserInteraction);
      map.off("moveend", handleMoveEnd);
      map.remove(); // Destroy the map instance

      // Clear layer and map references
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
