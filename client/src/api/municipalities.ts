import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { FeatureCollection } from "geojson";

export const useMunicipalities = () => {
  return useQuery({
    queryKey: ["municipalities"],
    queryFn: async () => {
      const response = await axios.get<FeatureCollection>("api/municipalities");

      return response.data;
    },
  });
};
