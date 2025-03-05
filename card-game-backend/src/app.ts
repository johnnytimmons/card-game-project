import express from "express";
import cors from "cors";
import cardRoutes from "./routes/card-routes"; // Assuming cardRoutes is defined in the routes folder

const app = express();

app.use(cors());
app.use(express.json());

// Define your API routes and use the cardRoutes for the '/api' path
app.use("/api", cardRoutes);

// A default route to check if the server is running
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

export default app;
