import { useMemo, useCallback, useState } from "react";
import { useMunicipalities } from "../api/municipalities";
import { useSiriWebSocket } from "../hooks/useSiriWebSocket";
import LoadingScreen from "./LoadingScreen";
import MunicipalitySelector from "./MunicipalitySelector";
import LeafletMap from "./LeafletMap";
import type { Feature, GeoJsonProperties, Geometry } from "geojson";
import useMunicipalityFilter from "../hooks/useMunicipalityFilter";
import { TimelineControls } from "./TimelineControls";
import { useTimeline } from "../hooks/useTimeline";

export default function Map() {
  const { data: municipalitiesData } = useMunicipalities();
  const siriHistory = useSiriWebSocket();
  const {
    timelineIndex,
    setTimelineIndex,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    isLive,
  } = useTimeline(siriHistory);

  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [selectedVehicleRef, setSelectedVehicleRef] = useState<string | null>(
    null
  );
  const [userInteracted, setUserInteracted] = useState(false);

  const siriData = useMemo(() => {
    if (!siriHistory.length) return [];
    if (timelineIndex === null || timelineIndex >= siriHistory.length) {
      return siriHistory[siriHistory.length - 1].vehicles;
    }
    return siriHistory[timelineIndex]?.vehicles || [];
  }, [siriHistory, timelineIndex]);

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

  const handlePlayPause = useCallback(() => {
    if (isLive) {
      setTimelineIndex(0);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, isLive, setTimelineIndex, setIsPlaying]);

  const handleSpeedChange = useCallback(
    (speed: number) => {
      setPlaybackSpeed(speed);
    },
    [setPlaybackSpeed]
  );

  const handleTimelineChange = useCallback(
    (index: number | null) => {
      setTimelineIndex(index);
    },
    [setTimelineIndex]
  );

  if (!municipalitiesData) {
    return <LoadingScreen municipalitiesData={municipalitiesData} />;
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
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

      {siriHistory.length > 0 && (
        <TimelineControls
          isPlaying={isPlaying}
          isLive={isLive}
          timelineIndex={timelineIndex}
          siriHistory={siriHistory}
          playbackSpeed={playbackSpeed}
          onPlayPause={handlePlayPause}
          onTimelineChange={handleTimelineChange}
          onSpeedChange={handleSpeedChange}
        />
      )}
    </div>
  );
}
