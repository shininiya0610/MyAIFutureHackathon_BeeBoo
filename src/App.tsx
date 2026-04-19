import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Bell, Hospital, User, ShieldAlert, Activity, Watch, Navigation, Info, ListFilter, AlertCircle, CheckCircle2 } from 'lucide-react';
import { VitalsCard } from './components/VitalsCard';
import { AlertSystem } from './components/AlertSystem';
import { HealthChart } from './components/HealthChart';
import { PatientSetup } from './components/PatientSetup';
import { useHealthSimulation } from './hooks/useHealthSimulation';
import { analyzeHealthData } from './services/geminiService';
import { PatientInfo, HospitalInfo, Alert, HealthVitals } from './types';

export default function App() {
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [hospital, setHospital] = useState<HospitalInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'alerts' | 'hospital'>('dashboard');
  const [alertsHistory, setAlertsHistory] = useState<Alert[]>([]);
  const [currentAlert, setCurrentAlert] = useState<Alert | null>(null);
  const [vitalsHistory, setVitalsHistory] = useState<Partial<HealthVitals>[]>([]);
  const [aiSummary, setAiSummary] = useState<{status: string, message: string, analysis: string} | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { vitals, triggerEmergency, resetNormal, isAbnormal } = useHealthSimulation();

  // Load from local storage on mount
  useEffect(() => {
    const savedPatient = localStorage.getItem('guardian_patient');
    const savedHospital = localStorage.getItem('guardian_hospital');
    if (savedPatient && savedHospital) {
      setPatient(JSON.parse(savedPatient));
      setHospital(JSON.parse(savedHospital));
    }
  }, []);

  const handleSetupComplete = (p: PatientInfo, h: HospitalInfo) => {
    setPatient(p);
    setHospital(h);
    localStorage.setItem('guardian_patient', JSON.stringify(p));
    localStorage.setItem('guardian_hospital', JSON.stringify(h));
  };

  // Record vitals history
  useEffect(() => {
    setVitalsHistory(prev => {
      const next = [...prev, { heartRate: vitals.heartRate, systolic: vitals.systolic, timestamp: vitals.timestamp }];
      return next.slice(-30); // Keep last 30 readings
    });
  }, [vitals.timestamp]);

  // AI Analysis every 10 seconds or when abnormal
  useEffect(() => {
    if (!patient) return;

    const runAnalysis = async () => {
      setIsAnalyzing(true);
      const result = await analyzeHealthData(vitals);
      setAiSummary(result);
      setIsAnalyzing(false);

      if (result.status !== 'normal' && !currentAlert) {
        const newAlert: Alert = {
          id: Math.random().toString(36).substr(2, 9),
          type: result.status as any,
          message: result.message,
          vitalsSnapshot: { ...vitals },
          timestamp: new Date().toISOString(),
          status: 'pending'
        };
        setCurrentAlert(newAlert);
        setAlertsHistory(prev => [newAlert, ...prev]);
      }
    };

    if (isAbnormal || Math.random() > 0.85) {
      runAnalysis();
    }
  }, [vitals.timestamp, isAbnormal]);

  const acknowledgeAlert = () => {
    if (currentAlert) {
      const updated = { ...currentAlert, status: 'acknowledged' as const };
      setCurrentAlert(updated);
      setAlertsHistory(prev => prev.map(a => a.id === updated.id ? updated : a));
    }
  };

  const resolveAlert = () => {
    if (currentAlert) {
      const updated = { ...currentAlert, status: 'resolved' as const };
      setAlertsHistory(prev => prev.map(a => a.id === updated.id ? updated : a));
      setCurrentAlert(null);
      resetNormal();
    }
  };

  if (!patient || !hospital) {
    return <PatientSetup onComplete={handleSetupComplete} />;
  }

  return (
    <div className="min-h-screen bg-natural-bg pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-natural-border px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-natural-olive rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">S</div>
            <div>
              <h1 className="text-xl font-bold text-natural-olive tracking-tight leading-none hover:opacity-80 transition-opacity cursor-default">SafePath Care</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-natural-sage rounded-full animate-pulse" />
                <p className="text-[10px] text-natural-muted font-bold uppercase tracking-widest">Network Secure</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-natural-bg px-4 py-2 border border-natural-border rounded-full shadow-inner">
            <div className="w-8 h-8 bg-white border border-natural-border rounded-full flex items-center justify-center font-bold text-natural-olive text-xs">
              {patient.name.split(' ').map(n => n[0]).join('') || 'P'}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-natural-text leading-tight">{patient.name || 'Patient'}</p>
              <p className="text-[9px] text-natural-muted font-bold uppercase tracking-tight">{patient.relation} | Area 2</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 pt-10 pb-12">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {/* Vitals Grid - Card Left */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <VitalsCard 
                  title="Heart Rate" 
                  value={vitals.heartRate} 
                  unit="bpm" 
                  icon={Activity} 
                  status={vitals.heartRate > 100 || vitals.heartRate < 50 ? 'danger' : 'normal'}
                />
                <VitalsCard 
                  title="Blood Pressure" 
                  value={`${vitals.systolic}/${vitals.diastolic}`} 
                  unit="mmHg" 
                  icon={Watch} 
                  status={vitals.systolic > 140 || vitals.systolic < 90 ? 'warning' : 'normal'}
                />
                <VitalsCard 
                  title="Oxygen Rate" 
                  value={vitals.oxygenLevel} 
                  unit="%" 
                  icon={Activity} 
                  status={vitals.oxygenLevel < 94 ? 'danger' : 'normal'}
                />
                <VitalsCard 
                  title="Body Temperature" 
                  value={vitals.temperature} 
                  unit="°C" 
                  icon={Activity} 
                  status={vitals.temperature > 38 || vitals.temperature < 35.5 ? 'warning' : 'normal'}
                />
              </div>

              {/* AI Analysis - Card Right */}
              <div className="bg-white rounded-[24px] p-8 border border-natural-border flex flex-col h-full">
                <h2 className="text-[14px] font-bold text-natural-muted uppercase tracking-widest mb-6">AI Health Summary</h2>
                <div className="flex-1">
                  <div className={`status-badge mb-4 ${aiSummary?.status === 'normal' ? 'bg-natural-badge-bg text-natural-badge-text' : 'bg-natural-warm/10 text-natural-warm'}`}>
                    {aiSummary ? (aiSummary.status === 'normal' ? 'Patient in Good Condition' : 'Anomaly Detected') : 'Processing Analysis...'}
                  </div>
                  <h3 className="text-lg font-bold text-natural-olive mb-2 leading-tight">
                    {aiSummary?.message || "Analyzing band data..."}
                  </h3>
                  <p className="text-[14px] leading-relaxed text-natural-text opacity-80">
                    {aiSummary?.analysis || "Integrating real-time vitals to assess overall physical condition. No immediate risks flagged."}
                  </p>
                  <div className="mt-8 pt-6 border-t border-natural-border">
                    <p className="text-[10px] font-bold text-natural-muted uppercase tracking-widest mb-2">Recommended Action</p>
                    <p className="text-[13px] font-medium text-natural-olive italic">
                      "{aiSummary?.recommendedAction || "Monitoring active. No action required at this time."}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-white rounded-[24px] p-8 border border-natural-border">
                <h2 className="text-[14px] font-bold text-natural-muted uppercase tracking-widest mb-6">Movement & Location</h2>
                <div className="map-container aspect-video w-full mb-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[#EAE8E4] flex items-center justify-center">
                    {/* Simplified map look */}
                    <div className="w-full h-full opacity-20 bg-[radial-gradient(#5a5a40_1px,transparent_1px)] [background-size:20px_20px]" />
                    
                    {/* Marker with Label */}
                    <div className="absolute left-[55%] top-[40%] flex flex-col items-center">
                      <div className="mb-2 bg-white px-2 py-1 rounded-md shadow-sm border border-natural-border">
                        <span className="text-[8px] font-bold text-natural-olive uppercase tracking-tight whitespace-nowrap">Current Location</span>
                      </div>
                      <div className="w-5 h-5 bg-natural-warm border-4 border-white rounded-full shadow-lg animate-bounce" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[13px] text-natural-text"><strong>Last Location:</strong> {vitals.location.address.split(',')[0]}</p>
                  <p className="text-[13px] text-natural-muted">Stationary for 24 mins</p>
                </div>
              </div>

              {/* Hospital Summary */}
              <div className="bg-white rounded-[24px] p-8 border border-natural-border">
                <h2 className="text-[14px] font-bold text-natural-muted uppercase tracking-widest mb-6">Hospital Connection</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-bottom border-natural-vital pb-2 border-b">
                    <span className="text-[13px] text-natural-muted">ER Unit Status</span>
                    <span className="text-[13px] font-bold text-natural-sage">Connected</span>
                  </div>
                  <div className="flex justify-between items-center border-bottom border-natural-vital pb-2 border-b">
                    <span className="text-[13px] text-natural-muted">Nearest Dispatch</span>
                    <span className="text-[13px] font-bold text-natural-text">{hospital.distance}</span>
                  </div>
                  <div className="flex justify-between items-center border-bottom border-natural-vital pb-2 border-b">
                    <span className="text-[13px] text-natural-muted">Guardian Link</span>
                    <span className="text-[13px] font-bold text-natural-text">Active (Primary)</span>
                  </div>
                </div>
              </div>

              {/* Simulation Card (Theme override) */}
              <div className="bg-natural-olive text-white rounded-[24px] p-8 border border-natural-border shadow-lg">
                <h2 className="text-[14px] font-bold opacity-60 uppercase tracking-widest mb-6">System Controls</h2>
                <p className="text-[13px] leading-snug mb-6 opacity-80">Manual testing for the emergency auto-link protocol and guardian notification system.</p>
                {!isAbnormal ? (
                  <button onClick={triggerEmergency} className="w-full btn-natural-primary">Simulate Alert</button>
                ) : (
                  <button onClick={resetNormal} className="w-full btn-natural-outline">Reset System</button>
                )}
              </div>

              {/* Restore Charts in full-width row */}
              <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-[24px] p-6 border border-natural-border">
                  <HealthChart 
                    data={vitalsHistory} 
                    dataKey="heartRate" 
                    color="#D48C70" 
                    title="Heart Rate History" 
                  />
                </div>
                <div className="bg-white rounded-[24px] p-6 border border-natural-border">
                  <HealthChart 
                    data={vitalsHistory} 
                    dataKey="systolic" 
                    color="#8E927A" 
                    title="Systolic History" 
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'alerts' && (
            <motion.div 
              key="alerts"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Activity Log</h2>
                  <p className="text-slate-400">History of all alerts and AI observations</p>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-100 flex gap-2">
                  <button className="p-2 bg-slate-100 rounded-lg text-slate-600"><ListFilter size={20} /></button>
                </div>
              </div>

              {alertsHistory.length === 0 ? (
                <div className="health-card py-32 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-4">
                    <Bell size={32} />
                  </div>
                  <h3 className="text-slate-900 font-bold text-lg">System All Clear</h3>
                  <p className="text-slate-400">No alerts have been recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alertsHistory.map((alert) => (
                    <div key={alert.id} className="health-card p-6 flex items-center gap-6">
                      <div className={`p-4 rounded-2xl ${alert.type === 'critical' || alert.type === 'emergency' ? 'bg-medical-danger/10 text-medical-danger' : 'bg-medical-warning/10 text-medical-warning'}`}>
                        <Bell size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-slate-900">{alert.message}</h4>
                          <span className="text-xs text-slate-400 font-medium">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="flex gap-4 text-xs font-semibold uppercase tracking-wider">
                          <span className={alert.status === 'resolved' ? 'text-medical-success' : 'text-medical-warning'}>
                            Status: {alert.status}
                          </span>
                          <span className="text-slate-400">Type: {alert.type}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900">HR: {alert.vitalsSnapshot.heartRate}</p>
                        <p className="text-xs text-slate-400">BP: {alert.vitalsSnapshot.bloodPressure}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'hospital' && (
            <motion.div 
              key="hospital"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Emergency Links</h2>
                <p className="text-slate-400 tracking-wide">Direct connection status to your medical network</p>
              </div>

              <div className="health-card p-8 bg-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Hospital size={160} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-medical-primary text-white rounded-2xl shadow-lg shadow-medical-primary/20">
                      <Hospital size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-slate-900">Primary Medical Provider</h3>
                      <p className="text-sm text-slate-400">Regular specialist hospital</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Hospital Name</span>
                      <p className="text-lg font-bold text-slate-800">{hospital.preferredHospital}</p>
                    </div>
                    <div className="flex gap-8">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Emergency Contact</span>
                        <p className="text-lg font-bold text-medical-primary">{hospital.emergencyPhone}</p>
                      </div>
                       <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Response Speed</span>
                        <p className="text-lg font-bold text-slate-800">4-8 min Avg</p>
                      </div>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Address</span>
                      <p className="text-slate-600 italic">"{hospital.preferredHospitalAddress || 'Kuala Lumpur Metro Area'}"</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="health-card p-8">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-medical-danger text-white rounded-2xl shadow-lg shadow-medical-danger/20">
                      <ShieldAlert size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-slate-900">Active Emergency ED</h3>
                      <p className="text-sm text-slate-400">Nearest point of care</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                       <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">ED Facility</h4>
                       <p className="text-lg font-bold text-slate-800">{hospital.emergencyDept}</p>
                       <div className="mt-4 flex items-center gap-2 text-medical-success font-bold text-xs">
                          <Activity size={14} />
                          <span>ED Status: Rapid Intake Available</span>
                       </div>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                       <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">Escalation Protocol</h4>
                       <p className="text-sm text-slate-600 leading-relaxed">
                         Hospital ED is automatically contacted and GPS coordinates sent if guardian response is not received within <strong className="text-slate-900">5 minutes</strong> of a critical alert.
                       </p>
                    </div>
                  </div>
              </div>

              <div className="health-card p-8 border-dashed border-2 bg-transparent text-center">
                <Info className="mx-auto text-slate-300 mb-4" size={32} />
                <h4 className="font-bold text-slate-400 uppercase tracking-widest text-sm mb-2">How it works</h4>
                <p className="text-slate-400 text-sm max-w-lg mx-auto">
                  The GuardianLink band creates a triangular sync between Patient (Wearer), YOU (Guardian), and Response Network (Hospital). 
                  Encrypted health data is analyzed by Medical AI in real-time.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Alert Overlay */}
      <AlertSystem 
        currentAlert={currentAlert} 
        hospital={hospital}
        vitals={vitals}
        onAcknowledge={acknowledgeAlert}
        onResolve={resolveAlert}
      />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-natural-border px-6 py-4 flex justify-around items-center z-50">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dashboard' ? 'text-natural-olive' : 'text-natural-muted hover:text-natural-olive'}`}
        >
          <div className={`p-2 rounded-xl ${activeTab === 'dashboard' ? 'bg-natural-olive/5' : ''}`}>
            <LayoutDashboard size={22} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Dashboard</span>
        </button>
        <button 
          onClick={() => setActiveTab('alerts')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'alerts' ? 'text-natural-olive' : 'text-natural-muted hover:text-natural-olive'}`}
        >
          <div className="relative">
            <div className={`p-2 rounded-xl ${activeTab === 'alerts' ? 'bg-natural-olive/5' : ''}`}>
              <Bell size={22} />
            </div>
            {alertsHistory.some(a => a.status === 'pending') && (
              <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-natural-warm border-2 border-white rounded-full" />
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Alerts</span>
        </button>
        <button 
          onClick={() => setActiveTab('hospital')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'hospital' ? 'text-natural-olive' : 'text-natural-muted hover:text-natural-olive'}`}
        >
          <div className={`p-2 rounded-xl ${activeTab === 'hospital' ? 'bg-natural-olive/5' : ''}`}>
            <Hospital size={22} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Hospital</span>
        </button>
      </nav>
    </div>
  );
}
