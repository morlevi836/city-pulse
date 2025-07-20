import { useEffect } from "react";
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

export default function useMunicipalitiesLayer(
  mapRef: React.RefObject<L.Map | null>,
  geoJsonLayerRef: React.RefObject<L.LayerGroup | null>,
  municipalitiesData: FeatureCollection<Geometry, GeoJsonProperties>
) {
  useEffect(() => {
    if (!mapRef.current || !geoJsonLayerRef.current) return;

    const layers = municipalitiesData.features.map((feature) => {
      return createMunicipalityLayer(feature, mapRef);
    });

    geoJsonLayerRef.current.clearLayers();
    layers.forEach((layer) => geoJsonLayerRef.current?.addLayer(layer));
  }, [geoJsonLayerRef, mapRef, municipalitiesData]);
}

function createMunicipalityLayer(
  feature: Feature<Geometry, GeoJsonProperties>,
  mapRef: React.RefObject<L.Map | null>
) {
  const layer = L.geoJSON(feature, {
    style: {
      color: "#3388ff",
      weight: 1.5,
      fillOpacity: 0.1,
    },
  });

  const center = calculateFeatureCenter(feature) || DEFAULT_CENTER;

  if (feature.properties?.LocNameHeb) {
    layer.bindPopup(`
      <div style="direction: rtl; text-align: right; font-weight: 600; font-size: 16px;">
        ${feature.properties.LocNameHeb}
      </div>
    `);
  }

  layer.on("click", () => {
    mapRef.current?.flyTo(center, FEATURE_ZOOM, { duration: FLY_TO_DURATION });
    layer.openPopup();
  });

  return layer;
}

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
