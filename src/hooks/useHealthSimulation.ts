import { useState, useEffect } from 'react';
import { HealthVitals } from '../types';

export function useHealthSimulation() {
  const [vitals, setVitals] = useState<HealthVitals>({
    heartRate: 72,
    bloodPressure: "120/80",
    systolic: 120,
    diastolic: 80,
    oxygenLevel: 98,
    temperature: 36.6,
    steps: 1240,
    movementStatus: 'active',
    location: {
      lat: 3.1390,
      lng: 101.6869,
      address: "Bukit Damansara, Kuala Lumpur"
    },
    timestamp: new Date().toISOString()
  });

  const [isAbnormal, setIsAbnormal] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setVitals(prev => {
        // Normal drift
        const hrDrift = Math.floor(Math.random() * 3) - 1; // -1 to +1
        const oxyDrift = Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        
        // If "abnormal" state is triggered, move values to danger zone
        let newHr = prev.heartRate + hrDrift;
        let newOxy = prev.oxygenLevel + oxyDrift;
        let newStatus = prev.movementStatus;
        let newSystolic = prev.systolic;

        if (isAbnormal) {
          // Simulate an emergency: Tachycardia or Fall
          newHr = Math.min(160, Math.max(40, newHr + 5));
          newSystolic = Math.min(190, newSystolic + 2);
          if (newHr > 120) newStatus = 'fall_detected';
        } else {
          // Keep in health range
          newHr = Math.min(100, Math.max(60, newHr));
          newOxy = Math.min(100, Math.max(95, newOxy));
          newSystolic = Math.min(140, Math.max(110, newSystolic));
          newStatus = 'active';
        }

        return {
          ...prev,
          heartRate: newHr,
          oxygenLevel: newOxy,
          systolic: newSystolic,
          bloodPressure: `${newSystolic}/${prev.diastolic}`,
          movementStatus: newStatus as any,
          timestamp: new Date().toISOString(),
          steps: prev.steps + (Math.random() > 0.7 ? 1 : 0)
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isAbnormal]);

  const triggerEmergency = () => setIsAbnormal(true);
  const resetNormal = () => setIsAbnormal(false);

  return { vitals, triggerEmergency, resetNormal, isAbnormal };
}
