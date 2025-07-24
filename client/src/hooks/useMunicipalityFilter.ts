import React from "react";
import * as turf from "@turf/turf";
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
  MultiPolygon,
  Polygon,
} from "geojson";
import type { VehicleType } from "../types/vehicle";

export default function useMunicipalityFilter(
  selectedMunicipality: string,
  siriData: VehicleType[],
  municipalitiesData?: FeatureCollection<Geometry, GeoJsonProperties>
) {
  const [filteredSiriData, setFilteredSiriData] = React.useState(siriData);
  const [selectedMunicipalityCenter, setSelectedMunicipalityCenter] =
    React.useState<[number, number] | null>(null);

  React.useEffect(() => {
    if (!municipalitiesData || !selectedMunicipality) {
      setFilteredSiriData(siriData);
      setSelectedMunicipalityCenter(null);
      return;
    }

    const timer = setTimeout(() => {
      const { filteredData, center } = filterVehiclesByMunicipality(
        selectedMunicipality,
        siriData,
        municipalitiesData
      );

      setFilteredSiriData(filteredData);
      setSelectedMunicipalityCenter(center);
    }, 50);

    return () => clearTimeout(timer);
  }, [selectedMunicipality, siriData, municipalitiesData]);

  return { filteredSiriData, selectedMunicipalityCenter };
}

// Pure function for filtering logic
function filterVehiclesByMunicipality(
  selectedMunicipality: string,
  siriData: VehicleType[],
  municipalitiesData: FeatureCollection<Geometry, GeoJsonProperties>
) {
  const municipalityFeature = municipalitiesData.features.find(
    (f: Feature<Geometry, GeoJsonProperties>) =>
      f.properties?.LocNameHeb === selectedMunicipality
  );

  if (!municipalityFeature) {
    return { filteredData: siriData, center: null };
  }

  // Type guard to ensure we have a Polygon or MultiPolygon
  const isPolygonFeature = (
    feature: Feature<Geometry, GeoJsonProperties>
  ): feature is Feature<Polygon | MultiPolygon, GeoJsonProperties> => {
    return (
      feature.geometry.type === "Polygon" ||
      feature.geometry.type === "MultiPolygon"
    );
  };

  if (!isPolygonFeature(municipalityFeature)) {
    console.warn(
      `Municipality feature is not a Polygon or MultiPolygon: ${municipalityFeature.geometry.type}`
    );
    return { filteredData: siriData, center: null };
  }

  const centroid = turf.center(municipalityFeature)?.geometry.coordinates;
  const center = centroid
    ? ([centroid[1], centroid[0]] as [number, number])
    : null;

  const filteredData = siriData.filter((vehicle) => {
    if (vehicle.Latitude == null || vehicle.Longitude == null) return false;
    const point = turf.point([vehicle.Longitude, vehicle.Latitude]);
    return turf.booleanPointInPolygon(point, municipalityFeature);
  });

  return { filteredData, center };
}
