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
  // Fetch municipalities and real-time vehicle data
  const { data: municipalitiesData } = useMunicipalities();
  const siriHistory = useSiriWebSocket();

  // Timeline-related state from custom hook
  const {
    timelineIndex,
    setTimelineIndex,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    isLive,
  } = useTimeline(siriHistory);

  // UI state
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [selectedVehicleRef, setSelectedVehicleRef] = useState<string | null>(
    null
  );
  const [userInteracted, setUserInteracted] = useState(false);

  // Determine which vehicles to show based on timeline
  const siriData = useMemo(() => {
    if (!siriHistory.length) return [];
    if (timelineIndex === null || timelineIndex >= siriHistory.length) {
      return siriHistory[siriHistory.length - 1].vehicles;
    }
    return siriHistory[timelineIndex]?.vehicles || [];
  }, [siriHistory, timelineIndex]);

  // Filter vehicles based on selected municipality
  const { filteredSiriData, selectedMunicipalityCenter } =
    useMunicipalityFilter(selectedMunicipality, siriData, municipalitiesData);

  // Extract municipality names for selector
  const municipalityOptions = useMemo(() => {
    if (!municipalitiesData) return [];
    return municipalitiesData.features
      .map(
        (f: Feature<Geometry, GeoJsonProperties>) => f.properties?.LocNameHeb
      )
      .filter(Boolean) as string[];
  }, [municipalitiesData]);

  // Handlers for user interaction
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

  // Timeline control handlers
  const handlePlayPause = useCallback(() => {
    if (isLive) {
      setTimelineIndex(0); // Restart playback from beginning if in live mode
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

  // Show loading screen until municipality data is loaded
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
