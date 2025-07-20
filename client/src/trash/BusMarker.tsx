import React, { useEffect, useRef } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { VehicleType } from "../types/vehicle";

const busIcon = L.icon({
  iconUrl: "/bus-icon.png",
  iconSize: [25, 25],
});

type Props = {
  vehicle: VehicleType;
  isSelected: boolean;
  onSelectVehicle: (vehicleRef: string | null) => void;
};

function BusMarkerComponent({ vehicle, isSelected, onSelectVehicle }: Props) {
  const markerRef = useRef<L.Marker>(null);

  useEffect(() => {
    if (
      markerRef.current &&
      vehicle.Latitude !== null &&
      vehicle.Longitude !== null
    ) {
      markerRef.current.setLatLng([vehicle.Latitude, vehicle.Longitude]);
    }

    if (markerRef.current && isSelected) {
      markerRef.current.openPopup();
    }
  }, [vehicle.Latitude, vehicle.Longitude, isSelected]);

  useEffect(() => {
    const marker = markerRef.current;

    if (!marker) return;

    const handlePopupClose = () => {
      if (isSelected) {
        onSelectVehicle(null);
      }
    };

    marker.on("popupclose", handlePopupClose);

    return () => {
      marker.off("popupclose", handlePopupClose);
    };
  }, [onSelectVehicle, isSelected]);

  if (vehicle.Latitude === null || vehicle.Longitude === null) return null;

  return (
    <Marker
      icon={busIcon}
      position={[vehicle.Latitude, vehicle.Longitude]}
      ref={markerRef}
      key={vehicle.VehicleRef}
      eventHandlers={{
        click: () => {
          onSelectVehicle(vehicle.VehicleRef);
        },
      }}
    >
      <Popup>
        <div dir="rtl" style={{ textAlign: "right" }}>
          <p>
            <strong>🔢 קו:</strong> {vehicle.LineRef ?? "לא ידוע"}
          </p>
          <p>
            <strong>🚌 מזהה רכב:</strong> {vehicle.VehicleRef ?? "לא ידוע"}
          </p>
          <p>
            <strong>🕒 זמן:</strong> {vehicle.RecordedAtTime ?? "לא ידוע"}
          </p>
          <p>
            <strong>🏢 מפעיל:</strong> {vehicle.OperatorRef ?? "לא ידוע"}
          </p>
          <p>
            <strong>🚏 זמן יציאה:</strong>{" "}
            {vehicle.OriginAimedDepartureTime ?? "לא ידוע"}
          </p>
          <p>
            <strong>🧭 כיוון:</strong> {vehicle.Bearing ?? "לא ידוע"}°
          </p>
          <p>
            <strong>💨 מהירות:</strong> {vehicle.Velocity ?? "לא ידוע"} קמ"ש
          </p>
          <p>
            <strong>📍 תחנה קרובה:</strong> {vehicle.StopPointRef ?? "לא ידוע"}
          </p>
          <p>
            <strong>↔️ מרחק מהתחנה:</strong>{" "}
            {vehicle.DistanceFromStop ?? "לא ידוע"} מטר
          </p>
          <p>
            <strong># סדר בקו:</strong> {vehicle.Order ?? "לא ידוע"}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

const BusMarker = React.memo(
  BusMarkerComponent,
  (prevProps, nextProps) =>
    prevProps.vehicle.Latitude === nextProps.vehicle.Latitude &&
    prevProps.vehicle.Longitude === nextProps.vehicle.Longitude
);

export default BusMarker;
