import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // AI Setup
  const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || "");

  // Add JSON parsing middleware
  app.use(express.json());

  // API routes
  app.post("/api/analyze", async (req, res) => {
    try {
      const { vitals } = req.body;
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        Analyze the following elderly patient health vitals and determine if the patient is in "Good Condition" or if there's an "Anomaly Detected" that requires attention.
        Vitals:
        - Heart Rate: ${vitals.heartRate} bpm
        - Blood Pressure: ${vitals.systolic}/${vitals.diastolic}
        - Oxygen level: ${vitals.oxygenLevel}%
        - Temperature: ${vitals.temperature}°C
        - Movement Status: ${vitals.movementStatus}
        
        Classification Rules:
        - Good Condition: Vitals are within normal ranges (HR 60-100, BP ~120/80, Oxygen >95, Temp 36-37.5) and movement is stable.
        - Anomaly Detected: Any vital significantly outside range or a fall detected.
        
        Response must be in JSON.
      `;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING, enum: ['normal', 'warning', 'critical'] },
              message: { type: Type.STRING },
              analysis: { type: Type.STRING },
              recommendedAction: { type: Type.STRING }
            },
            required: ["status", "message", "analysis", "recommendedAction"]
          }
        }
      });

      res.json(JSON.parse(result.response.text()));
    } catch (error) {
      console.error("AI Analysis Error:", error);
      res.status(500).json({
        status: 'normal',
        message: 'Analysis unavailable.',
        analysis: 'Error processing vitals.',
        recommendedAction: 'Continue observation.'
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the built files from 'dist'
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // Fallback for SPA routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
