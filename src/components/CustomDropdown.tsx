import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface CustomDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  accentColor?: 'emerald' | 'blue';
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({ 
  label, 
  value, 
  options, 
  onChange,
  accentColor = 'emerald'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ringColor = accentColor === 'emerald' ? 'focus:ring-emerald-500/30 border-emerald-500/50' : 'focus:ring-blue-500/30 border-blue-500/50';
  const textColor = accentColor === 'emerald' ? 'text-emerald-400' : 'text-blue-400';
  const hoverBg = accentColor === 'emerald' ? 'hover:bg-emerald-500/10' : 'hover:bg-blue-500/10';

  return (
    <div className="space-y-1.5" ref={dropdownRef}>
      <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-[#1E2030] border ${isOpen ? ringColor : 'border-border'} text-text-primary text-sm font-semibold transition-all shadow-inner focus:outline-none`}
        >
          <span className="truncate pr-4">{value || 'Select an option...'}</span>
          <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 top-full mt-2 w-full rounded-xl bg-[#1E2030] border border-border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
              {options.length === 0 ? (
                <div className="p-3 text-sm text-text-muted text-center">No options available</div>
              ) : (
                options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                      value === opt 
                        ? `bg-surface-muted ${textColor}` 
                        : `text-text-primary ${hoverBg}`
                    }`}
                  >
                    <span className="truncate pr-2">{opt}</span>
                    {value === opt && <Check className="w-4 h-4 shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
