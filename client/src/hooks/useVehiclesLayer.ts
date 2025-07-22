import { useEffect, useRef } from "react";
import L from "leaflet";
import type { VehicleType } from "../types/vehicle";
import { busIcon, selectedBusIcon } from "../constants/icons";
import type { FeatureCollection, Geometry, GeoJsonProperties } from "geojson";
import { isInAnyMunicipality } from "../utils/geoUtils";
import { createVehicleMarker } from "../utils/markerUtils";
import { createVehiclePopupContent } from "../utils/popupUtils";

interface VehicleMarkerOptions extends L.MarkerOptions {
  vehicleRef: string;
}

type VehicleMarker = L.Marker & { options: VehicleMarkerOptions };

export default function useVehiclesLayer(
  mapRef: React.RefObject<L.Map | null>,
  vehiclesLayerRef: React.RefObject<L.LayerGroup | null>,
  siriData: VehicleType[],
  selectedVehicleRef: string | null,
  onSelectVehicle: (vehicleRef: string | null) => void,
  mapBounds: L.LatLngBounds | null,
  municipalitiesData: FeatureCollection<Geometry, GeoJsonProperties>
) {
  // Store markers for vehicles keyed by vehicleRef
  const markersRef = useRef<
    Record<string, { current: VehicleMarker; popup: L.Popup }>
  >({});

  useEffect(() => {
    if (!mapRef.current || !vehiclesLayerRef.current || !mapBounds) return;

    // Filter vehicles inside map bounds and municipalities
    const filteredVehicles = siriData.filter((vehicle) => {
      if (
        vehicle.Latitude == null ||
        vehicle.Longitude == null ||
        !mapBounds.contains(L.latLng(vehicle.Latitude, vehicle.Longitude))
      ) {
        return false;
      }

      return isInAnyMunicipality(
        vehicle.Latitude,
        vehicle.Longitude,
        municipalitiesData
      );
    });

    // Remove markers for vehicles no longer visible
    vehiclesLayerRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        const vehicleRef = (layer.options as VehicleMarkerOptions).vehicleRef;

        if (!filteredVehicles.some((v) => v.VehicleRef === vehicleRef)) {
          vehiclesLayerRef.current?.removeLayer(layer);
          delete markersRef.current[vehicleRef];
        }
      }
    });

    // Add or update markers for filtered vehicles
    filteredVehicles.forEach((vehicle) => {
      const existingMarker = markersRef.current[vehicle.VehicleRef ?? ""];

      if (existingMarker) {
        existingMarker.current.setLatLng([
          vehicle.Latitude!,
          vehicle.Longitude!,
        ]);

        existingMarker.popup.setContent(createVehiclePopupContent(vehicle));

        if (vehicle.VehicleRef === selectedVehicleRef) {
          existingMarker.current.setIcon(selectedBusIcon);
          existingMarker.current.openPopup();
        } else {
          existingMarker.current.setIcon(busIcon);
        }
      } else {
        const markerRef = createVehicleMarker(
          vehicle,
          selectedVehicleRef,
          onSelectVehicle,
          vehiclesLayerRef.current!,
          mapRef
        );
        if (markerRef && vehicle.VehicleRef) {
          markersRef.current[vehicle.VehicleRef] = markerRef;
          (markerRef.current.options as VehicleMarkerOptions).vehicleRef =
            vehicle.VehicleRef ?? "";
        }
      }
    });
  }, [
    siriData,
    selectedVehicleRef,
    mapBounds,
    mapRef,
    vehiclesLayerRef,
    onSelectVehicle,
    municipalitiesData,
  ]);
}
