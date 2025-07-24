import React from "react";
import L from "leaflet";
import * as turf from "@turf/turf";
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
} from "geojson";
import {
  DEFAULT_CENTER,
  FEATURE_ZOOM,
  FLY_TO_DURATION,
} from "../constants/mapConstants";

// Hook to render municipalities as styled GeoJSON layers on the map
export default function useMunicipalitiesLayer(
  mapRef: React.RefObject<L.Map | null>,
  geoJsonLayerRef: React.RefObject<L.LayerGroup | null>,
  municipalitiesData: FeatureCollection<Geometry, GeoJsonProperties>
) {
  React.useEffect(() => {
    // Ensure map and layer group are initialized
    if (!mapRef.current || !geoJsonLayerRef.current) return;

    // Create a Leaflet layer for each GeoJSON municipality feature
    const layers = municipalitiesData.features.map((feature) => {
      return createMunicipalityLayer(feature, mapRef);
    });

    // Clear existing layers and add new municipality layers
    geoJsonLayerRef.current.clearLayers();
    layers.forEach((layer) => geoJsonLayerRef.current?.addLayer(layer));
  }, [geoJsonLayerRef, mapRef, municipalitiesData]);
}

// Creates a styled GeoJSON layer with popup and click-to-zoom behavior
function createMunicipalityLayer(
  feature: Feature<Geometry, GeoJsonProperties>,
  mapRef: React.RefObject<L.Map | null>
) {
  // Create a styled GeoJSON layer
  const layer = L.geoJSON(feature, {
    style: {
      color: "#3388ff",
      weight: 1.5,
      fillOpacity: 0.1,
    },
  });

  // Calculate center of the feature for fly-to zoom
  const center = calculateFeatureCenter(feature) || DEFAULT_CENTER;

  // Add a popup with the municipality's Hebrew name (RTL support)
  if (feature.properties?.LocNameHeb) {
    layer.bindPopup(`
      <div style="direction: rtl; text-align: right; font-weight: 600; font-size: 16px;">
        ${feature.properties.LocNameHeb}
      </div>
    `);
  }

  // When a municipality is clicked, zoom to its center and open the popup
  layer.on("click", () => {
    mapRef.current?.flyTo(center, FEATURE_ZOOM, { duration: FLY_TO_DURATION });
    layer.openPopup();
  });

  return layer;
}

// Calculate the center of a GeoJSON feature using Turf.js
function calculateFeatureCenter(
  feature: Feature<Geometry, GeoJsonProperties>
): L.LatLngExpression | null {
  try {
    const turfCenter = turf.center(feature);
    const [lng, lat] = turfCenter.geometry.coordinates;
    return !isNaN(lat) && !isNaN(lng) ? [lat, lng] : null;
  } catch (error) {
    console.warn("Failed to calculate feature center:", error);
    return null;
  }
}
