// backend/src/routes/mapRoutes.ts
import express from "express";
import { mapService } from "../services/map.services";

const router = express.Router();

// Get all maps
router.get("/", async (req, res) => {
  try {
    const maps = await mapService.findAll();
    res.json(maps);
  } catch (error) {
    console.error("Error fetching maps:", error);
    res.status(500).json({ message: "Error fetching maps" });
  }
});

// Get map metadata by ID
router.get("/:id", async (req, res) => {
  try {
    const map = mapService.findById(req.params.id);
    if (map) {
      res.json(map);
    } else {
      res.status(404).json({ message: "Map not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching map" });
  }
});

// Generate map spaces
router.get("/:id/generate", async (req, res) => {
  try {
    const spaces = await mapService.generateMapSpaces(req.params.id);
    res.json(spaces);
  } catch (error) {
    console.error("Error generating map spaces:", error);
    res.status(500).json({ message: "Error generating map spaces" });
  }
});

// Create a new map
router.post("/", async (req, res) => {
  try {
    const newMap = await mapService.create(req.body);
    res.status(201).json(newMap);
  } catch (error) {
    res.status(500).json({ message: "Error creating map" });
  }
});

export default router;
