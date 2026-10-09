'use client'
import React, { useState, useRef, useEffect } from 'react';
import { useField } from 'formik';

interface Option {
  label: string;
  value: string | number;
}

interface FormSelectProps {
  label: string;
  name: string;
  placeholder?: string;
  options: Option[];
  required?: boolean;
  disabled?: boolean;
  className?: string;
  icon?: string;
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  options,
  className,
  icon,
  placeholder = "Select Option",
  ...props
}) => {
  const [field, meta, helpers] = useField(props);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasError = meta.touched && meta.error;

  const handleSelect = (value: string | number) => {
    if (!props.disabled) {
      helpers.setValue(value);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (isOpen) {
          helpers.setTouched(true);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, helpers]);

  const selectedOption = options.find(opt => opt.value == field.value);

  return (
    <div className={`relative ${className || ''}`} ref={containerRef}>
      <label className="font-medium text-pathik-text-dark mb-1.5 block text-sm">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>

      <div
        className={`relative w-full p-2.5 ${icon ? 'pl-9' : 'pl-3'} pr-10 border-[1.5px] rounded-lg text-sm bg-pathik-bg-light outline-none transition-all cursor-pointer flex items-center
            ${hasError
            ? 'border-red-300 ring-2 ring-red-200'
            : isOpen
              ? 'border-pathik-primary bg-white shadow-[0_0_0_3px_rgba(102,126,234,0.1)]'
              : 'border-pathik-border hover:border-pathik-primary/50'
          }
            ${props.disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-75' : 'text-gray-900'}
        `}
        onClick={() => !props.disabled && setIsOpen(!isOpen)}
      >
        <span className={`block truncate ${!selectedOption ? 'text-gray-400' : 'text-gray-900'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {icon && (
          <i className={`fas ${icon} absolute left-3 top-1/2 -translate-y-1/2 text-pathik-text-light text-xs pointer-events-none transition-colors ${hasError ? 'text-red-400' : ''}`}></i>
        )}

        <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-pathik-text-light transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <i className="fas fa-chevron-down text-xs"></i>
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && !props.disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-pathik-border rounded-lg shadow-lg max-h-60 overflow-auto animate-[fadeIn_0.2s_ease-out]">
          {options.length > 0 ? (
            options.map((option) => (
              <div
                key={option.value + 'opt'}
                className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-pathik-bg-light transition-colors
                            ${field.value == option.value ? 'bg-pathik-primary/5 text-pathik-primary font-medium' : 'text-pathik-text-dark'}
                        `}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-400 text-center">No options available</div>
          )}
        </div>
      )}

      {hasError && (
        <div className="text-red-500 text-xs mt-1 animate-[fadeIn_0.3s_ease-out] flex items-center gap-1">
          <i className="fas fa-exclamation-circle"></i>
          {meta.error}
        </div>
      )}
    </div>
  );
};

export default FormSelect;
 