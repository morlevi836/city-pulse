import { useEffect, useState } from "react";
import axios from "axios";
import type { VehicleType } from "../types/vehicle";

export const useSiriLiveData = ({ isMapReady }: { isMapReady: boolean }) => {
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // if (!isMapReady) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/siri/${currentIndex}`);
        const newData: VehicleType[] = res.data || [];

        setVehicles(newData);
        // setCurrentIndex((prev) => prev + 1);
      } catch (err) {
        console.error("No more data or error:", err);
        // clearInterval(interval);
      }
    };

    fetchData(); // טעינה ראשונית

    // const interval = setInterval(fetchData, 5000);

    // return () => clearInterval(interval);
  }, [currentIndex]);

  return vehicles;
};
