import { useEffect } from "react";
import { FEATURE_ZOOM, FLY_TO_DURATION } from "../constants/mapConstants";

// Automatically fly to the selected municipality center unless the user has already interacted with the map
export default function useSelectedFeatureCenterEffect(
  mapRef: React.RefObject<L.Map | null>,
  selectedFeatureCenter: [number, number] | null | undefined,
  userInteracted: boolean
) {
  useEffect(() => {
    if (!mapRef.current || !selectedFeatureCenter || userInteracted) return;

    // Smoothly fly to the selected municipality's center
    mapRef.current.flyTo(selectedFeatureCenter, FEATURE_ZOOM, {
      duration: FLY_TO_DURATION,
    });
  }, [mapRef, selectedFeatureCenter, userInteracted]);
}
