import express from "express";
import { files } from "../constants/files";
import { fetchAndParseSiriData } from "../services/siriService";

const router = express.Router();

router.get("/api/siri/:index", async (req, res) => {
  const idx = parseInt(req.params.index, 10);
  if (isNaN(idx) || idx < 0 || idx >= files.length) {
    return res.status(400).json({ message: "Invalid index" });
  }

  try {
    const data = await fetchAndParseSiriData(idx);
    res.json(data);
  } catch (err) {
    console.error("Error fetching/parsing SIRI file:", err);
    res.status(500).json({ message: "Failed to fetch or parse file" });
  }
});

export default router;
