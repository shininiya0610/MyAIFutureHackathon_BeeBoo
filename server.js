import express from "express";
import path from "path";

const app = express();

// Serve static files from public folder
app.use(express.static('public'));

// Always return index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// IMPORTANT: Cloud Run port
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
