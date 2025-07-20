import { Router } from "express";
import axios from "axios";

const router = Router();

router.get("/api/municipalities", async (req, res) => {
  try {
    const url =
      process.env.MUNICIPALITIES_URL ||
      "https://eliabs-siri-ex.s3.eu-west-3.amazonaws.com/municipalities_multi.geojson";

    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
