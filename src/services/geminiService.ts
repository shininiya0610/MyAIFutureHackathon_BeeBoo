import { HealthVitals } from "../types";

export async function analyzeHealthData(vitals: HealthVitals) {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vitals })
    });

    if (!response.ok) throw new Error('API error');
    return await response.json();
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
