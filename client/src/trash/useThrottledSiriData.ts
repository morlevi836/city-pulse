import { useEffect, useRef, useState } from "react";
import type { VehicleType } from "../types/vehicle";

export function useThrottledSiriData(rawData: VehicleType[], delay = 1000) {
  const rawDataRef = useRef<VehicleType[]>([]);
  const [throttledData, setThrottledData] = useState<VehicleType[]>([]);

  useEffect(() => {
    rawDataRef.current = rawData;
  }, [rawData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setThrottledData(rawDataRef.current);
    }, delay);

    return () => clearInterval(interval);
  }, [delay]);

  return throttledData;
}
