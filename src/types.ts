export interface PatientInfo {
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  relation: string;
  photoUrl?: string;
}

export interface HospitalInfo {
  preferredHospital: string;
  preferredHospitalAddress: string;
  emergencyDept: string;
  emergencyPhone: string;
  distance: string;
}

export interface HealthVitals {
  heartRate: number;      // bpm
  bloodPressure: string;  // systolic/diastolic e.g. "120/80"
  systolic: number;
  diastolic: number;
  oxygenLevel: number;    // %
  temperature: number;    // °C
  steps: number;
  movementStatus: 'active' | 'sedentary' | 'sleeping' | 'fall_detected';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  timestamp: string;
}

export interface Alert {
  id: string;
  type: 'warning' | 'critical' | 'emergency';
  message: string;
  vitalsSnapshot: HealthVitals;
  timestamp: string;
  status: 'pending' | 'acknowledged' | 'escalated' | 'resolved';
  escalationTimer?: number; // seconds remaining
}

export type UserRole = 'guardian' | 'emergency_dept' | 'patient';
