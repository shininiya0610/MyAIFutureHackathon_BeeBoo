import express from "express";
import path from "path";

const app = express();

// Serve static files from Vite build
const __dirname = new URL('.', import.meta.url).pathname;
app.use(express.static(path.join(__dirname, "dist")));

// Handle React routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// IMPORTANT: Cloud Run port
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
