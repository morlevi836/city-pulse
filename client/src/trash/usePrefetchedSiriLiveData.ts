import { useEffect, useState, useRef } from "react";
import axios from "axios";
import type { VehicleType } from "../types/vehicle";

export const usePrefetchedSiriLiveData = ({
  isMapReady,
  maxIndex = 200, // או כמה שיש לך
  prefetchCount = 3,
  interval = 10000, // משך בין פריימים (ms)
}: {
  isMapReady: boolean;
  maxIndex?: number;
  prefetchCount?: number;
  interval?: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentData, setCurrentData] = useState<VehicleType[]>([]);
  const cacheRef = useRef<Map<number, VehicleType[]>>(new Map());
  const isFetchingRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!isMapReady) return;

    const prefetchNext = async () => {
      for (let i = currentIndex; i <= currentIndex + prefetchCount; i++) {
        if (!cacheRef.current.has(i) && !isFetchingRef.current.has(i)) {
          isFetchingRef.current.add(i);

          try {
            const res = await axios.get(`/api/siri/${i}`);
            cacheRef.current.set(i, res.data || []);
          } catch (err) {
            console.error("Error prefetching index", i, err);
          } finally {
            isFetchingRef.current.delete(i);
          }
        }
      }
    };

    prefetchNext();
  }, [currentIndex, prefetchCount, isMapReady]);

  useEffect(() => {
    if (!isMapReady) return;

    const playLoop = setInterval(() => {
      const data = cacheRef.current.get(currentIndex);
      if (data) {
        setCurrentData(data);
        setCurrentIndex((prev) => (prev + 1) % maxIndex);
      } else {
        console.log("Waiting for data to be prefetched...");
      }
    }, interval);

    return () => clearInterval(playLoop);
  }, [currentIndex, isMapReady, interval, maxIndex]);

  return currentData;
};
