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
  // Refs to store the Leaflet map and layer instances
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.LayerGroup | null>(null);
  const vehiclesLayerRef = useRef<L.LayerGroup | null>(null);

  // State to track the current map bounds
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);

  // Initializes the map and sets up event listeners
  useMapInitialization(
    mapRef,
    geoJsonLayerRef,
    vehiclesLayerRef,
    setMapBounds,
    onUserInteraction
  );

  // Renders municipality polygons on the map
  useMunicipalitiesLayer(mapRef, geoJsonLayerRef, municipalitiesData);

  // Renders vehicle markers on the map and updates based on selection and bounds
  useVehiclesLayer(
    mapRef,
    vehiclesLayerRef,
    siriData,
    selectedVehicleRef,
    onSelectVehicle,
    mapBounds,
    municipalitiesData
  );

  // Adjusts map view to selected municipality center when applicable
  useSelectedFeatureCenterEffect(mapRef, selectedFeatureCenter, userInteracted);

  // Container for the Leaflet map
  return (
    <div
      id="leaflet-map-container"
      style={{ height: "100vh", width: "100%" }}
      role="region"
      aria-label="Map showing municipalities and vehicles"
    />
  );
}
