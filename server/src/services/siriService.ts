import axios from "axios";
import { VehicleType } from "../types/vehicle";
import { files } from "../constants/files";

const BASE_URL =
  process.env.SIRI_BASE_URL ||
  "https://eliabs-siri-ex.s3.amazonaws.com/siri-data/";

export async function fetchAndParseSiriData(
  index: number
): Promise<VehicleType[]> {
  if (index < 0 || index >= files.length) return [];

  const fileName = files[index];
  const url = `${BASE_URL}${fileName}`;

  try {
    const response = await axios.get(url);
    return parseSiriData(response.data);
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    } else {
      console.error("Error fetching SIRI data:", error);
      throw error;
    }
  }
}

function parseSiriData(data: any): VehicleType[] {
  const visits =
    data?.Siri?.ServiceDelivery?.StopMonitoringDelivery?.[0]
      ?.MonitoredStopVisit ?? [];

  return visits.map((visit: any) => {
    const journey = visit.MonitoredVehicleJourney ?? {};
    const location = journey.VehicleLocation ?? {};
    const monitoredCall = journey.MonitoredCall ?? {};

    return {
      RecordedAtTime: visit.RecordedAtTime ?? null,
      LineRef: journey.LineRef ?? null,
      VehicleRef: journey.VehicleRef ?? null,
      OperatorRef: journey.OperatorRef ?? null,
      OriginAimedDepartureTime: journey.OriginAimedDepartureTime ?? null,
      Bearing: journey.Bearing ? parseFloat(journey.Bearing) : null,
      Velocity: journey.Velocity ? parseFloat(journey.Velocity) : null,
      Latitude: location.Latitude ? parseFloat(location.Latitude) : null,
      Longitude: location.Longitude ? parseFloat(location.Longitude) : null,
      StopPointRef: monitoredCall.StopPointRef ?? null,
      DistanceFromStop: monitoredCall.DistanceFromStop
        ? parseFloat(monitoredCall.DistanceFromStop)
        : null,
      Order: monitoredCall.Order ? parseInt(monitoredCall.Order) : null,
    };
  });
}
