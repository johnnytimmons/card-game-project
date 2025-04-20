import path from "path";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import moduleAlias from "module-alias";

// Set up module aliases for runtime
moduleAlias.addAliases({
  "@shared": path.resolve(__dirname, "../../shared"),
  // Add other aliases if needed
});

// Now import your routes that use these aliases
import mapRoutes from "./routes/mapRoutes";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
  })
);
app.use(bodyParser.json());

// Routes
app.use("/api/maps", mapRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
