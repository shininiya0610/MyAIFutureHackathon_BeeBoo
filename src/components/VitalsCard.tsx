import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface VitalsCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  status: 'normal' | 'warning' | 'danger';
  trend?: 'up' | 'down' | 'stable';
}

export const VitalsCard: React.FC<VitalsCardProps> = ({ 
  title, value, unit, icon: Icon, status, trend 
}) => {
  const statusColors = {
    normal: 'text-natural-sage bg-natural-sage/10',
    warning: 'text-natural-warm bg-natural-warm/10',
    danger: 'text-natural-warm bg-natural-warm/10',
  };

  const borderColors = {
    normal: 'border-natural-border',
    warning: 'border-natural-warm/30',
    danger: 'border-natural-warm/50',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-natural-card border ${borderColors[status]} rounded-[24px] p-6 shadow-[0_4px_12px_rgba(90,90,64,0.04)] flex flex-col justify-between`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${statusColors[status]}`}>
          <Icon size={18} />
        </div>
        <div className="text-[10px] font-bold text-natural-muted uppercase tracking-widest">
          Live
        </div>
      </div>
      
      <div className="bg-natural-vital rounded-2xl p-4 mt-auto">
        <p className="text-natural-muted text-[11px] font-bold uppercase tracking-wider mb-1 line-clamp-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-natural-olive tracking-tight">
            {value}
          </span>
          {unit && (
            <span className="text-natural-muted text-xs font-normal lowercase">{unit}</span>
          )}
        </div>
      </div>
      
      {status !== 'normal' && (
        <motion.div 
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="mt-3 flex items-center gap-2 px-2 py-1 bg-natural-warm/10 rounded-lg w-fit"
        >
          <div className="status-pulse bg-natural-warm ring-2 ring-natural-warm/20" />
          <span className="text-natural-warm text-[9px] font-bold uppercase tracking-wider">
            {status === 'danger' ? 'Critical' : 'Caution'}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};
