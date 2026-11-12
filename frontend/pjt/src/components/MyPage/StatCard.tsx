import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
  <div className="p-6 card-standard">
    <div className={`mb-3 ${color}`}>{icon}</div>
    <div className="text-2xl font-black tracking-tighter text-text-main uppercase">{value}</div>
    <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{label}</div>
  </div>
);

export default StatCard;
