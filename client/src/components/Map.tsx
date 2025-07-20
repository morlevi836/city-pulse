import { useState, useMemo, useCallback } from "react";
import { useMunicipalities } from "../api/municipalities";
import { useSiriWebSocket } from "../hooks/useSiriWebSocket";
import LoadingScreen from "./LoadingScreen";
import MunicipalitySelector from "./MunicipalitySelector";
import LeafletMap from "./LeafletMap";
import type { Feature, GeoJsonProperties, Geometry } from "geojson";
import useMunicipalityFilter from "../hooks/useMunicipalityFilter";

export default function Map() {
  // Data fetching
  const { data: municipalitiesData } = useMunicipalities();
  const siriData = useSiriWebSocket();

  // State management
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [selectedVehicleRef, setSelectedVehicleRef] = useState<string | null>(
    null
  );
  const [userInteracted, setUserInteracted] = useState(false);

  // Derived state
  const { filteredSiriData, selectedMunicipalityCenter } =
    useMunicipalityFilter(selectedMunicipality, siriData, municipalitiesData);

  const municipalityOptions = useMemo(() => {
    if (!municipalitiesData) return [];
    return municipalitiesData.features
      .map(
        (f: Feature<Geometry, GeoJsonProperties>) => f.properties?.LocNameHeb
      )
      .filter(Boolean) as string[];
  }, [municipalitiesData]);

  // Event handlers
  const handleMunicipalityChange = useCallback((municipality: string) => {
    setSelectedMunicipality(municipality);
    setUserInteracted(false);
  }, []);

  const handleSelectVehicle = useCallback((vehicleRef: string | null) => {
    setSelectedVehicleRef(vehicleRef);
  }, []);

  const handleUserInteraction = useCallback(() => {
    setUserInteracted(true);
  }, []);

  if (!municipalitiesData) {
    return <LoadingScreen municipalitiesData={municipalitiesData} />;
  }

  return (
    <div className="relative h-screen w-full">
      <MunicipalitySelector
        options={municipalityOptions}
        selected={selectedMunicipality}
        onChange={handleMunicipalityChange}
      />

      <LeafletMap
        municipalitiesData={municipalitiesData}
        siriData={filteredSiriData}
        selectedFeatureCenter={selectedMunicipalityCenter}
        selectedVehicleRef={selectedVehicleRef}
        onSelectVehicle={handleSelectVehicle}
        userInteracted={userInteracted}
        onUserInteraction={handleUserInteraction}
      />
    </div>
  );
}
