
import app from "./app";
import gameRoutes from "./routes/game-routes";
const PORT = 5000;
// Add before app.listen
console.log("Registered routes:");
gameRoutes.stack.forEach((layer: any) => {
  if (layer.route) {
    console.log(`${layer.route.path} - ${Object.keys(layer.route.methods)}`);
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});