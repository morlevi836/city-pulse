// hooks/useTimeline.ts
import { useState, useEffect } from "react";
import type { VehicleType } from "../types/vehicle";

export function useTimeline(
  siriHistory: {
    timestamp: number;
    vehicles: VehicleType[];
  }[]
) {
  const [timelineIndex, setTimelineIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const isLive =
    timelineIndex === null || timelineIndex === siriHistory.length - 1;

  useEffect(() => {
    if (!isPlaying || isLive || !siriHistory.length) return;

    const interval = setInterval(() => {
      setTimelineIndex((prev) => {
        if (prev === null || prev >= siriHistory.length - 1) {
          setIsPlaying(false);
          return null;
        }
        return prev + 1;
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, isLive, siriHistory.length, playbackSpeed]);

  return {
    timelineIndex,
    setTimelineIndex,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    isLive,
  };
}
