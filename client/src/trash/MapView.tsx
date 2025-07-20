import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { useMemo } from "react";
import L from "leaflet";
import type { VehicleType } from "../types/vehicle";
import type {
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  Point,
} from "geojson";
import MapInteractionHandler from "./MapInteractionHandler";
import FlyToLocation from "./FlyToLocation";

type MapViewProps = {
  municipalitiesData: FeatureCollection<Geometry, GeoJsonProperties>;
  siriData: VehicleType[];
  selectedFeatureCenter?: [number, number] | null;
  selectedVehicleRef: string | null;
  onSelectVehicle: (vehicleRef: string | null) => void;
  userInteracted: boolean;
  onUserInteraction: () => void;
};

const busIcon = L.icon({
  iconUrl: "/bus-icon.png",
  iconSize: [25, 25],
});

const selectedBusIcon = L.icon({
  iconUrl: "/bus-icon.png",
  iconSize: [30, 30],
});

export default function MapView({
  municipalitiesData,
  siriData,
  selectedFeatureCenter,
  selectedVehicleRef,
  onSelectVehicle,
  userInteracted,
  onUserInteraction,
}: MapViewProps) {
  const siriFeatureCollection = useMemo<FeatureCollection<Point>>(() => {
    return {
      type: "FeatureCollection",
      features: siriData
        .filter((v) => v.Latitude != null && v.Longitude != null)
        .map((v) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [v.Longitude!, v.Latitude!],
          },
          properties: { ...v },
        })),
    };
  }, [siriData]);

  return (
    <MapContainer
      center={[32.08, 34.78]}
      zoom={10}
      style={{ height: "100vh", width: "100%" }}
      preferCanvas={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <GeoJSON data={municipalitiesData} />

      {selectedFeatureCenter && (
        <FlyToLocation
          center={selectedFeatureCenter}
          userInteracted={userInteracted}
        />
      )}

      <GeoJSON
        key={siriFeatureCollection.features.length}
        data={siriFeatureCollection}
        pointToLayer={(feature, latlng) => {
          const isSelected =
            selectedVehicleRef === feature.properties?.VehicleRef;
          return L.marker(latlng, {
            icon: isSelected ? selectedBusIcon : busIcon,
          });
        }}
        onEachFeature={(feature, layer) => {
          const props = feature.properties;
          const content = `
            <div dir="rtl" style="text-align:right;">
              <p><strong>🔢 קו:</strong> ${props.LineRef ?? "לא ידוע"}</p>
              <p><strong>🚌 מזהה רכב:</strong> ${
                props.VehicleRef ?? "לא ידוע"
              }</p>
              <p><strong>🕒 זמן:</strong> ${
                props.RecordedAtTime ?? "לא ידוע"
              }</p>
              <p><strong>🏢 מפעיל:</strong> ${
                props.OperatorRef ?? "לא ידוע"
              }</p>
              <p><strong>🚏 זמן יציאה:</strong> ${
                props.OriginAimedDepartureTime ?? "לא ידוע"
              }</p>
              <p><strong>🧭 כיוון:</strong> ${props.Bearing ?? "לא ידוע"}°</p>
              <p><strong>💨 מהירות:</strong> ${
                props.Velocity ?? "לא ידוע"
              } קמ"ש</p>
              <p><strong>📍 תחנה קרובה:</strong> ${
                props.StopPointRef ?? "לא ידוע"
              }</p>
              <p><strong>↔️ מרחק מהתחנה:</strong> ${
                props.DistanceFromStop ?? "לא ידוע"
              } מטר</p>
              <p><strong># סדר בקו:</strong> ${props.Order ?? "לא ידוע"}</p>
            </div>
          `;

          layer.bindPopup(content);

          layer.on("click", () => {
            onSelectVehicle(props.VehicleRef ?? null);
          });

          layer.on("popupclose", () => {
            if (selectedVehicleRef === props.VehicleRef) {
              onSelectVehicle(null);
            }
          });
        }}
      />

      <MapInteractionHandler onUserInteraction={onUserInteraction} />
    </MapContainer>
  );
}
