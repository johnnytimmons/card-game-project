import express from "express";
import cors from "cors";
import cardRoutes from "./routes/card-routes"; // Existing import
import gameRoutes from "./routes/game-routes"; // Add this line

const app = express();

app.use(cors());
app.use(express.json());

// Define your API routes
app.use("/api/card", cardRoutes);
app.use("/api/game", gameRoutes); // Added game routes with /api/game prefix

// A default route to check if the server is running

app.get("/", (req, res) => {
  res.send("Backend is running...");
});

export default app;
