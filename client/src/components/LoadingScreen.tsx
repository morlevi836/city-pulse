import React from "react";
import type { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";

type LoadingScreenProps = {
  municipalitiesData:
    | FeatureCollection<Geometry, GeoJsonProperties>
    | undefined;
};

export default function LoadingScreen({
  municipalitiesData,
}: LoadingScreenProps) {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (!municipalitiesData) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 250);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
    }
  }, [municipalitiesData]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white text-center px-4">
      <div className="mb-12">
        <div className="w-32 h-32 border-8 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>

      <h1 className="text-4xl font-bold mb-6 drop-shadow-lg select-none">
        ...טוען מפה
      </h1>

      <div className="w-96 max-w-full bg-white/30 rounded-full h-8 overflow-hidden shadow-lg">
        <div
          className="bg-white h-8 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-4 text-xl font-semibold drop-shadow-md select-none">
        {progress}%
      </p>

      <p className="mt-8 max-w-lg text-lg italic opacity-90">
        📍 כמעט שם! תודה על הסבלנות — המפה תופיע ממש בקרוב! 🚍
      </p>
    </div>
  );
}
