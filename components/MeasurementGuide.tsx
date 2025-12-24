import React, { useState } from 'react';

interface MeasurementGuideProps {
  label: string;
  field: string;
  value: number;
  onChange: (val: number) => void;
  disabled?: boolean;
}

const INSTRUCTIONS: Record<string, string> = {
  chest: "Wrap the tape measure around the fullest part of your chest, under your armpits. Keep the tape parallel to the floor.",
  waist: "Measure around your natural waistline, slightly above your belly button. Keep the tape comfortable, not tight.",
  inseam: "Measure from the crotch seam down to the bottom of the ankle bone on the inside of the leg.",
  shoulders: "Measure across the back from the tip of one shoulder bone to the other.",
  sleeve: "Measure from the tip of the shoulder down to your wrist bone, with your arm slightly bent."
};

const ICONS: Record<string, string> = {
  chest: "fa-child",
  waist: "fa-arrows-alt-h",
  inseam: "fa-arrows-alt-v",
  shoulders: "fa-text-width",
  sleeve: "fa-hand-point-right"
};

export const MeasurementGuide: React.FC<MeasurementGuideProps> = ({ label, field, value, onChange, disabled }) => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="relative">
      <div className="flex justify-between items-end mb-1">
        <label className="text-xs font-bold uppercase text-gray-500">{label} (Inches)</label>
        <button 
          onClick={() => setShowGuide(!showGuide)}
          className="text-xs text-brand-600 hover:text-brand-800 focus:outline-none flex items-center gap-1"
          tabIndex={-1}
        >
          <i className="fas fa-question-circle"></i>
          {showGuide ? 'Hide Guide' : 'How to measure'}
        </button>
      </div>
      
      {showGuide && (
        <div className="mb-3 p-3 bg-brand-50 border border-brand-100 rounded-lg text-sm text-brand-900 flex gap-3 items-start animate-fade-in">
          <div className="w-8 h-8 rounded-full bg-brand-200 flex items-center justify-center flex-shrink-0 text-brand-700">
             <i className={`fas ${ICONS[field] || 'fa-ruler'}`}></i>
          </div>
          <p className="flex-1">{INSTRUCTIONS[field] || "Use a flexible tape measure."}</p>
        </div>
      )}

      <div className="relative">
        <input 
          type="number"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className={`block w-full px-4 py-3 rounded-lg border ${
            !disabled ? 'border-brand-400 bg-white ring-2 ring-brand-100' : 'border-gray-200 bg-gray-50 text-gray-500'
          } focus:outline-none transition-all`}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-gray-400 text-sm">in</span>
        </div>
      </div>
    </div>
  );
};