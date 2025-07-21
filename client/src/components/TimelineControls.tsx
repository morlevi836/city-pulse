import { Pause, Play } from "lucide-react";
import type { VehicleType } from "../types/vehicle";

interface TimelineControlsProps {
  isPlaying: boolean;
  isLive: boolean;
  timelineIndex: number | null;
  siriHistory: {
    timestamp: number;
    vehicles: VehicleType[];
  }[];
  playbackSpeed: number;
  onPlayPause: () => void;
  onTimelineChange: (index: number | null) => void;
  onSpeedChange: (speed: number) => void;
}

export function TimelineControls({
  isPlaying,
  isLive,
  timelineIndex,
  siriHistory,
  playbackSpeed,
  onPlayPause,
  onTimelineChange,
  onSpeedChange,
}: TimelineControlsProps) {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-11/12 z-[1000] px-4">
      <div className="flex flex-col gap-2 bg-white/90 backdrop-blur-md shadow-lg rounded-xl p-4">
        <div className="flex items-center gap-4 w-full">
          <button
            onClick={onPlayPause}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause strokeWidth={1.5} />
            ) : (
              <Play strokeWidth={1.5} />
            )}
          </button>

          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={siriHistory.length - 1}
              value={timelineIndex ?? siriHistory.length - 1}
              onChange={(e) => {
                const index = Number(e.target.value);
                onTimelineChange(
                  index === siriHistory.length - 1 ? null : index
                );
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="min-w-[100px] text-sm font-medium text-gray-800 text-center whitespace-nowrap">
            {new Date(
              siriHistory[timelineIndex ?? siriHistory.length - 1].timestamp
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>

          <div className="flex items-center gap-1">
            {[0.5, 1, 2, 4].map((speed) => (
              <button
                key={speed}
                onClick={() => onSpeedChange(speed)}
                className={`text-xs px-2 py-1 rounded ${
                  playbackSpeed === speed
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              onTimelineChange(null);
            }}
            className={`ml-2 text-xs px-3 py-1 w-24 rounded transition ${
              isLive
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {isLive ? "חי" : "חזור לחי"}
          </button>
        </div>
      </div>
    </div>
  );
}
