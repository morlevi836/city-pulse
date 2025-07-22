import L from "leaflet";
import type { VehicleType } from "../types/vehicle";
import { busIcon, selectedBusIcon } from "../constants/icons";
import { createVehiclePopupContent } from "./popupUtils";

interface VehicleMarkerOptions extends L.MarkerOptions {
  vehicleRef: string;
}

type VehicleMarker = L.Marker & { options: VehicleMarkerOptions };

export function createVehicleMarker(
  vehicle: VehicleType,
  selectedVehicleRef: string | null,
  onSelectVehicle: (vehicleRef: string | null) => void,
  layerGroup: L.LayerGroup,
  mapRef: React.RefObject<L.Map | null>
) {
  const { Latitude: lat, Longitude: lng, VehicleRef } = vehicle;
  if (lat == null || lng == null) return;

  const marker = L.marker([lat, lng], {
    icon: VehicleRef === selectedVehicleRef ? selectedBusIcon : busIcon,
    vehicleRef: VehicleRef ?? "",
  } as VehicleMarkerOptions) as VehicleMarker;

  const popup = L.popup({
    autoClose: false,
    closeOnClick: false,
    closeOnEscapeKey: true,
    autoPan: true,
    className: "bus-popup",
    closeButton: true,
  }).setContent(createVehiclePopupContent(vehicle));

  marker.bindPopup(popup);
  const markerRef = { current: marker, popup };

  // Handle marker click
  marker.on("click", () => {
    // Close other popups
    layerGroup.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer !== marker) {
        layer.closePopup();
      }
    });

    onSelectVehicle(VehicleRef ?? null);
    markerRef.current.openPopup();
  });

  // Handle popup close event
  marker.on("popupclose", () => {
    onSelectVehicle(null);
  });

  // Close popups when clicking outside markers
  if (mapRef.current) {
    mapRef.current.on("click", (e) => {
      if (
        !(
          e.originalEvent.target &&
          (e.originalEvent.target as Element).closest &&
          (e.originalEvent.target as Element).closest(".leaflet-marker-icon")
        )
      ) {
        layerGroup.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            layer.closePopup();
          }
        });
        onSelectVehicle(null);
      }
    });
  }

  // Open popup if this is the selected vehicle
  if (VehicleRef === selectedVehicleRef) {
    setTimeout(() => {
      markerRef.current.openPopup();
    }, 100);
  }

  layerGroup.addLayer(marker);
  return markerRef;
}
