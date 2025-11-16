import React from 'react';

interface ResultCardProps {
  title: string;
  value: string;
  description: string;
  isHighlighted?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({ title, value, description, isHighlighted = false }) => {
  return (
    <div className={`p-5 bg-white/10 backdrop-blur-md rounded-lg shadow-lg border ${isHighlighted ? 'border-white ring-2 ring-white/30' : 'border-white/20'}`}>
      <h3 className="text-sm font-semibold text-slate-200 truncate [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">{title}</h3>
      <p className={`my-2 text-3xl font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]`}>{value}</p>
      <p className="text-xs text-slate-400 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">{description}</p>
    </div>
  );
};