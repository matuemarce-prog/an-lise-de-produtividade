
import React from 'react';

interface ResultCardProps {
  title: string;
  value: string;
  description: string;
  isHighlighted?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({ title, value, description, isHighlighted = false }) => {
  return (
    <div className={`p-5 bg-white rounded-lg shadow-md border ${isHighlighted ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200'}`}>
      <h3 className="text-sm font-semibold text-gray-600 truncate">{title}</h3>
      <p className={`my-2 text-3xl font-bold ${isHighlighted ? 'text-indigo-600' : 'text-slate-800'}`}>{value}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
};
