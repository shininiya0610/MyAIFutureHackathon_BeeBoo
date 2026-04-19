import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Heart, Building2, MapPin, Phone, ArrowRight, UserCircle } from 'lucide-react';
import { PatientInfo, HospitalInfo } from '../types';

interface PatientSetupProps {
  onComplete: (patient: PatientInfo, hospital: HospitalInfo) => void;
}

export const PatientSetup: React.FC<PatientSetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [patient, setPatient] = useState<Partial<PatientInfo>>({
    name: '',
    age: 70,
    gender: 'Male',
    bloodType: 'O+',
    relation: 'Parent'
  });

  const [hospital, setHospital] = useState<Partial<HospitalInfo>>({
    preferredHospital: '',
    preferredHospitalAddress: '',
    emergencyDept: 'General Hospital ED',
    emergencyPhone: '999',
    distance: '2.5 km'
  });

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
    else onComplete(patient as PatientInfo, hospital as HospitalInfo);
  };

  return (
    <div className="min-h-screen bg-natural-bg flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-white rounded-[32px] shadow-xl overflow-hidden border border-natural-border"
      >
        <div className="p-8 border-b border-natural-border flex justify-between items-center bg-natural-vital/50">
          <div>
            <h1 className="text-2xl font-bold text-natural-olive tracking-tight">Setup Profile</h1>
            <p className="text-natural-muted text-sm font-medium">SafePath Guardian Link</p>
          </div>
          <div className="flex gap-1">
            <div className={`w-8 h-1.5 rounded-full transition-colors ${step >= 1 ? 'bg-natural-olive' : 'bg-natural-border'}`} />
            <div className={`w-8 h-1.5 rounded-full transition-colors ${step >= 2 ? 'bg-natural-olive' : 'bg-natural-border'}`} />
          </div>
        </div>

        <div className="p-8">
          {step === 1 ? (
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4 text-natural-olive font-bold uppercase tracking-widest text-[10px]">
                <User size={14} />
                Patient Personal Details
              </div>

              <div className="space-y-4">
                <div className="vital-item-card">
                  <label className="block text-[10px] font-bold text-natural-muted uppercase tracking-widest mb-2">FullName</label>
                  <input 
                    type="text" 
                    value={patient.name}
                    onChange={(e) => setPatient({...patient, name: e.target.value})}
                    placeholder="e.g. Margaret Henderson"
                    className="w-full bg-transparent border-b border-natural-border py-2 focus:border-natural-olive outline-none transition-colors font-bold text-natural-text"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="vital-item-card">
                    <label className="block text-[10px] font-bold text-natural-muted uppercase tracking-widest mb-2">Age</label>
                    <input 
                      type="number" 
                      value={patient.age}
                      onChange={(e) => setPatient({...patient, age: parseInt(e.target.value)})}
                      className="w-full bg-transparent border-b border-natural-border py-2 focus:border-natural-olive outline-none font-bold text-natural-text"
                    />
                  </div>
                  <div className="vital-item-card">
                    <label className="block text-[10px] font-bold text-natural-muted uppercase tracking-widest mb-2">Gender</label>
                    <select 
                      value={patient.gender}
                      onChange={(e) => setPatient({...patient, gender: e.target.value})}
                      className="w-full bg-transparent border-b border-natural-border py-2 focus:border-natural-olive outline-none font-bold text-natural-text"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="vital-item-card">
                    <label className="block text-[10px] font-bold text-natural-muted uppercase tracking-widest mb-2">Blood Type</label>
                    <select 
                      value={patient.bloodType}
                      onChange={(e) => setPatient({...patient, bloodType: e.target.value})}
                      className="w-full bg-transparent border-b border-natural-border py-2 focus:border-natural-olive outline-none font-bold text-natural-text"
                    >
                      <option>O+</option>
                      <option>O-</option>
                      <option>A+</option>
                      <option>A-</option>
                      <option>B+</option>
                      <option>B-</option>
                      <option>AB+</option>
                      <option>AB-</option>
                    </select>
                  </div>
                  <div className="vital-item-card">
                    <label className="block text-[10px] font-bold text-natural-muted uppercase tracking-widest mb-2">Relation</label>
                    <input 
                      type="text" 
                      value={patient.relation}
                      onChange={(e) => setPatient({...patient, relation: e.target.value})}
                      placeholder="e.g. Mother"
                      className="w-full bg-transparent border-b border-natural-border py-2 focus:border-natural-olive outline-none font-bold text-natural-text"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4 text-natural-olive font-bold uppercase tracking-widest text-[10px]">
                <Building2 size={14} />
                Emergency Network
              </div>

              <div className="space-y-4">
                <div className="vital-item-card">
                  <label className="block text-[10px] font-bold text-natural-muted uppercase tracking-widest mb-2">Preferred Hospital</label>
                  <input 
                    type="text" 
                    value={hospital.preferredHospital}
                    onChange={(e) => setHospital({...hospital, preferredHospital: e.target.value})}
                    placeholder="e.g. St. Jude's Medical Center"
                    className="w-full bg-transparent border-b border-natural-border py-2 focus:border-natural-olive outline-none font-bold text-natural-text"
                  />
                </div>

                <div className="vital-item-card">
                  <label className="block text-[10px] font-bold text-natural-muted uppercase tracking-widest mb-2">Emergency Dept</label>
                  <input 
                    type="text" 
                    value={hospital.emergencyDept}
                    onChange={(e) => setHospital({...hospital, emergencyDept: e.target.value})}
                    className="w-full bg-transparent border-b border-natural-border py-2 focus:border-natural-olive outline-none font-bold text-natural-text"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="vital-item-card">
                    <label className="block text-[10px] font-bold text-natural-muted uppercase tracking-widest mb-2">Emergency Phone</label>
                    <input 
                      type="text" 
                      value={hospital.emergencyPhone}
                      onChange={(e) => setHospital({...hospital, emergencyPhone: e.target.value})}
                      className="w-full bg-transparent border-b border-natural-border py-2 focus:border-natural-olive outline-none font-bold text-natural-text"
                    />
                  </div>
                  <div className="vital-item-card">
                    <label className="block text-[10px] font-bold text-natural-muted uppercase tracking-widest mb-2">Distance</label>
                    <input 
                      type="text" 
                      value={hospital.distance}
                      onChange={(e) => setHospital({...hospital, distance: e.target.value})}
                      className="w-full bg-transparent border-b border-natural-border py-2 focus:border-natural-olive outline-none font-bold text-natural-text"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <button 
            onClick={handleNext}
            disabled={step === 1 && !patient.name}
            className="w-full mt-10 py-4 bg-natural-olive text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-natural-olive/10"
          >
            {step === 1 ? 'Configure Network' : 'Start Secure Monitoring'}
            <ArrowRight size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
