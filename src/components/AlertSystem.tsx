import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Clock, ShieldAlert, PhoneCall, CheckCircle } from 'lucide-react';
import { Alert, HospitalInfo, HealthVitals } from '../types';

interface AlertSystemProps {
  currentAlert: Alert | null;
  hospital: HospitalInfo | null;
  vitals: HealthVitals;
  onAcknowledge: () => void;
  onResolve: () => void;
}

export const AlertSystem: React.FC<AlertSystemProps> = ({ 
  currentAlert, hospital, vitals, onAcknowledge, onResolve 
}) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentAlert && currentAlert.status === 'pending') {
      setTimeLeft(300);
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentAlert]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentAlert) return null;

  const isEscalated = timeLeft === 0 || currentAlert.status === 'escalated';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-natural-olive/30 backdrop-blur-md">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="max-w-2xl w-full bg-natural-olive text-white rounded-[32px] shadow-2xl overflow-hidden border border-white/10"
        >
          <div className="flex flex-col md:flex-row items-center p-8 gap-10">
            <div className="relative">
              <div className="w-32 h-32 border-[6px] border-white/10 border-t-natural-warm rounded-full flex flex-col items-center justify-center animate-[spin_10s_linear_infinite]">
                 {/* This wrapper keeps content static while border spins */}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold font-mono tracking-tighter">{formatTime(timeLeft)}</span>
                <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Minutes</span>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">
                  {isEscalated ? 'Emergency Auto-Link Triggered' : 'Guardian Safety Check'}
                </h2>
                <p className="text-white/70 text-sm leading-relaxed">
                  {isEscalated 
                    ? `Our system is automatically alerting ${hospital?.preferredHospital || 'Emergency Response'} at ${vitals.location.address}.`
                    : `If you do not acknowledge this health alert, the system will automatically notify emergency services in ${formatTime(timeLeft)}.`}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                <button 
                  onClick={onAcknowledge}
                  disabled={currentAlert.status === 'acknowledged'}
                  className="px-8 py-3 bg-white text-natural-olive font-bold rounded-xl hover:bg-white/90 transition-all disabled:opacity-50"
                >
                  I'm Responding
                </button>
                <button 
                  onClick={onResolve}
                  className="px-8 py-3 bg-transparent border border-white/30 text-white font-bold rounded-xl hover:bg-white/5 transition-all"
                >
                  False Alarm
                </button>
              </div>
            </div>
          </div>

          <div className="bg-black/10 px-8 py-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
            <span>Patient: Margaret Henderson</span>
            <span>Ref: {currentAlert.id.slice(0,8)}</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
