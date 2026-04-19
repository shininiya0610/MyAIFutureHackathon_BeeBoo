import { GoogleGenAI, Type } from "@google/genai";
import { HealthVitals } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeHealthData(vitals: HealthVitals) {
  try {
    const prompt = `
      Analyze the following elderly patient health vitals and determine if the patient is in "Good Condition" or if there's an "Anomaly Detected" that requires attention.
      Vitals:
      - Heart Rate: ${vitals.heartRate} bpm
      - Blood Pressure: ${vitals.bloodPressure}
      - Oxygen level: ${vitals.oxygenLevel}%
      - Temperature: ${vitals.temperature}°C
      - Movement Status: ${vitals.movementStatus}
      
      Classification Rules:
      - Good Condition: Vitals are within normal ranges (HR 60-100, BP ~120/80, Oxygen >95, Temp 36-37.5) and movement is stable.
      - Anomaly Detected: Any vital significantly outside range or a fall detected.
      
      Response must be in JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { 
              type: Type.STRING, 
              enum: ['normal', 'warning', 'critical'],
              description: "'normal' for Good Condition, 'warning'/'critical' for Anomaly"
            },
            message: { 
              type: Type.STRING,
              description: "A short status label like 'Patient in Good Condition' or 'Hypertension Detected'"
            },
            analysis: { 
              type: Type.STRING,
              description: "Brief analysis explanation"
            },
            recommendedAction: { 
              type: Type.STRING,
              description: "Immediate action for guardian"
            }
          },
          required: ["status", "message", "analysis", "recommendedAction"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return {
      status: 'normal',
      message: 'Analysis unavailable. Monitoring active.',
      analysis: 'The AI analysis service is currently unavailable.',
      recommendedAction: 'Continue observing patient.'
    };
  }
}
