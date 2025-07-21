import { useRef, useState } from "react";
import type { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";
import type { VehicleType } from "../types/vehicle";
import useMapInitialization from "../hooks/useMapInitialization";
import useMunicipalitiesLayer from "../hooks/useMunicipalitiesLayer";
import useVehiclesLayer from "../hooks/useVehiclesLayer";
import useSelectedFeatureCenterEffect from "../hooks/useSelectedFeatureCenterEffect";

type LeafletMapProps = {
  municipalitiesData: FeatureCollection<Geometry, GeoJsonProperties>;
  siriData: VehicleType[];
  selectedFeatureCenter?: [number, number] | null;
  selectedVehicleRef: string | null;
  onSelectVehicle: (vehicleRef: string | null) => void;
  userInteracted: boolean;
  onUserInteraction: () => void;
};

export default function LeafletMap({
  municipalitiesData,
  siriData,
  selectedFeatureCenter,
  selectedVehicleRef,
  onSelectVehicle,
  userInteracted,
  onUserInteraction,
}: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.LayerGroup | null>(null);
  const vehiclesLayerRef = useRef<L.LayerGroup | null>(null);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);

  useMapInitialization(
    mapRef,
    geoJsonLayerRef,
    vehiclesLayerRef,
    setMapBounds,
    onUserInteraction
  );

  useMunicipalitiesLayer(mapRef, geoJsonLayerRef, municipalitiesData);

  useVehiclesLayer(
    mapRef,
    vehiclesLayerRef,
    siriData,
    selectedVehicleRef,
    onSelectVehicle,
    mapBounds,
    municipalitiesData
  );

  useSelectedFeatureCenterEffect(mapRef, selectedFeatureCenter, userInteracted);

  return (
    <div
      id="leaflet-map-container"
      style={{ height: "100vh", width: "100%" }}
      role="region"
      aria-label="Map showing municipalities and vehicles"
    />
  );
}
