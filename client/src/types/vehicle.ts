export interface VehicleType {
  RecordedAtTime: string | null;
  LineRef: string | null;
  VehicleRef: string | null;
  OperatorRef: string | null;
  OriginAimedDepartureTime: string | null;
  Bearing: number | null;
  Velocity: number | null;
  Latitude: number | null;
  Longitude: number | null;
  StopPointRef: string | null;
  DistanceFromStop: number | null;
  Order: number | null;
}
