import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface VehicleData {
  RecordedAtTime: string;
  MonitoredVehicleJourney: {
    LineRef: string;
    OperatorRef: string;
    VehicleLocation: { Longitude: string; Latitude: string };
    Bearing: string;
    Velocity: string;
    VehicleRef: string;
    MonitoredCall: {
      StopPointRef: string;
      DistanceFromStop: string;
    };
  };
}

export const useSiriData = () => {
  return useQuery({
    queryKey: ["siriData"],
    queryFn: async () => {
      const res = await axios.get("/api/siri");
      const visits =
        res.data.Siri.ServiceDelivery.StopMonitoringDelivery[0]
          .MonitoredStopVisit;

      return visits as VehicleData[];
    },
  });
};
