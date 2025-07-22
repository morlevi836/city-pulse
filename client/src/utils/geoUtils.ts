import type {
  FeatureCollection,
  Feature,
  Geometry,
  Polygon,
  MultiPolygon,
  GeoJsonProperties,
} from "geojson";
import * as turf from "@turf/turf";

export function isInAnyMunicipality(
  lat: number,
  lng: number,
  municipalities: FeatureCollection<Geometry, GeoJsonProperties>
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
