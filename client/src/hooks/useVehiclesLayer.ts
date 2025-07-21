import { useEffect, useRef } from "react";
import L from "leaflet";
import type { VehicleType } from "../types/vehicle";
import { busIcon, selectedBusIcon } from "../constants/icons";
import moment from "moment";
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  MultiPolygon,
  Polygon,
} from "geojson";
import * as turf from "@turf/turf";

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
  const markersRef = useRef<
    Record<string, { current: VehicleMarker; popup: L.Popup }>
  >({});

  useEffect(() => {
    if (!mapRef.current || !vehiclesLayerRef.current || !mapBounds) return;

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

    vehiclesLayerRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        const vehicleRef = (layer.options as VehicleMarkerOptions).vehicleRef;

        if (!filteredVehicles.some((v) => v.VehicleRef === vehicleRef)) {
          vehiclesLayerRef.current?.removeLayer(layer);
          delete markersRef.current[vehicleRef];
        }
      }
    });

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

function createVehicleMarker(
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

  marker.on("click", () => {
    layerGroup.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer !== marker) {
        layer.closePopup();
      }
    });

    onSelectVehicle(VehicleRef ?? null);
    markerRef.current.openPopup();
  });

  marker.on("popupclose", () => {
    onSelectVehicle(null);
  });

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

  if (VehicleRef === selectedVehicleRef) {
    setTimeout(() => {
      markerRef.current.openPopup();
    }, 100);
  }

  layerGroup.addLayer(marker);
  return markerRef;
}

function createVehiclePopupContent(vehicle: VehicleType): string {
  const {
    LineRef = "לא ידוע",
    VehicleRef = "לא ידוע",
    RecordedAtTime,
    OperatorRef = "לא ידוע",
    OriginAimedDepartureTime,
    Bearing = "לא ידוע",
    Velocity = "לא ידוע",
    StopPointRef = "לא ידוע",
    DistanceFromStop = "לא ידוע",
    Order = "לא ידוע",
  } = vehicle;

  const formattedRecordedTime = RecordedAtTime
    ? moment(RecordedAtTime).format("DD/MM/YYYY HH:mm:ss")
    : "לא ידוע";

  const formattedDepartureTime = OriginAimedDepartureTime
    ? moment(OriginAimedDepartureTime).format("DD/MM/YYYY HH:mm:ss")
    : "לא ידוע";

  const velocityKmh =
    Velocity !== "לא ידוע"
      ? (parseFloat(String(Velocity)) * 3.6).toFixed(1)
      : "לא ידוע";

  let formattedDistance = "לא ידוע";
  if (DistanceFromStop !== "לא ידוע") {
    const distanceNum = parseFloat(String(DistanceFromStop));
    formattedDistance =
      distanceNum >= 1000
        ? `${(distanceNum / 1000).toFixed(2)} ק"מ`
        : `${distanceNum.toFixed(0)} מטר`;
  }

  return `
    <div dir="rtl" style="text-align:right; font-size: 14px; line-height: 1.4;">
      <p><strong>🔢 מספר קו:</strong> ${LineRef}</p>
      <p><strong>🚌 מזהה רכב:</strong> ${VehicleRef}</p>
      <p><strong>🕒 זמן עדכון אחרון:</strong> ${formattedRecordedTime}</p>
      <p><strong>🏢 מפעיל הקו:</strong> ${OperatorRef}</p>
      <p><strong>🚦 שעת יציאה מתוכננת:</strong> ${formattedDepartureTime}</p>
      <p><strong>🧭 כיוון נסיעה:</strong> ${Bearing}°</p>
      <p><strong>💨 מהירות נוכחית:</strong> ${velocityKmh} קמ"ש</p>
      <p><strong>📍 קוד תחנה קרובה:</strong> ${StopPointRef}</p>
      <p><strong>↔️ מרחק מהתחנה:</strong> ${formattedDistance}</p>
      <p><strong>🔢 מיקום התחנה במסלול:</strong> מספר ${Order}</p>
    </div>
  `;
}

function isInAnyMunicipality(
  lat: number,
  lng: number,
  municipalities: FeatureCollection
): boolean {
  const point = turf.point([lng, lat]);

  return municipalities.features.some((feature) => {
    const geometry = feature.geometry;
    if (
      geometry &&
      (geometry.type === "Polygon" || geometry.type === "MultiPolygon")
    ) {
      return turf.booleanPointInPolygon(
        point,
        feature as Feature<Polygon | MultiPolygon>
      );
    }
    return false;
  });
}
