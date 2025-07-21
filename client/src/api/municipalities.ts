import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { FeatureCollection } from "geojson";

const backendApiUrl = import.meta.env.VITE_BACKEND_API_URL;

export const useMunicipalities = () => {
  return useQuery({
    queryKey: ["municipalities"],
    queryFn: async () => {
      const response = await axios.get<FeatureCollection>(
        `${backendApiUrl}/municipalities`
      );
      return response.data;
    },
  });
};
