import React from 'react';
import { useFormikContext } from 'formik';
import { GuestWizardValues } from '@/app/types';

const residencyOptions = [
  { id: 'Indian', label: 'Indian Resident', icon: 'fa-flag-checkered' },
  // { id: 'NRI', label: 'NRI', icon: 'fa-plane' },
  { id: 'Foreign', label: 'Foreign National', icon: 'fa-globe-americas' },
];

const Step2Residency: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<GuestWizardValues>();

  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <h2 className="text-xl font-bold text-pathik-text-dark mb-6 flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-pathik-primary text-white flex items-center justify-center text-sm">2</span>
        Select Residency Type
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {residencyOptions.map((option) => (
          <div 
            key={option.id}
            onClick={() => setFieldValue('residencyType', option.id)}
            className={`
              cursor-pointer rounded-xl p-6 text-center border-2 transition-all duration-300
              ${values.residencyType === option.id 
                ? 'border-pathik-primary bg-pathik-primary/5 shadow-md transform -translate-y-1' 
                : 'border-gray-200 hover:border-pathik-primary/50 hover:bg-gray-50'}
            `}
          >
            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl
              ${values.residencyType === option.id ? 'bg-pathik-primary text-white' : 'bg-gray-100 text-gray-400'}
            `}>
              <i className={`fas ${option.icon}`}></i>
            </div>
            <h3 className={`font-bold text-lg ${values.residencyType === option.id ? 'text-pathik-primary' : 'text-gray-700'}`}>
              {option.label}
            </h3>
          </div>
        ))}
      </div>
      
      {/* Error message if touched and not selected (handled by parent validation usually, but visual cue here) */}
      {!values.residencyType && (
         <p className="text-center text-gray-500 mt-8 text-sm italic">Please select your residency status to proceed.</p>
      )}
    </div>
  );
};

export default Step2Residency;
