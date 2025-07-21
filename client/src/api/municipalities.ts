import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { FeatureCollection } from "geojson";

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

export const useMunicipalities = () => {
  return useQuery({
    queryKey: ["municipalities"],
    queryFn: async () => {
      const response = await axios.get<FeatureCollection>(
        `${baseUrl}/api/municipalities`
      );
      return response.data;
    },
  });
};
