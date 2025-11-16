import React from 'react';

interface InputGroupProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  unit?: string;
  prefix?: string;
  type?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({ label, name, value, onChange, unit, prefix, type = 'number' }) => {
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="mb-1.5 text-sm font-medium text-slate-200 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">{label}:</label>
      <div className="relative">
        {prefix && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">{prefix}</span>}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          min="0"
          className={`w-full px-3 py-2 bg-white/5 text-white border border-white/20 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition duration-150 ${prefix ? 'pl-7' : ''} ${unit ? 'pr-12' : ''} [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]`}
        />
        {unit && <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">{unit}</span>}
      </div>
    </div>
  );
};