import React from "react";
import { useField } from "formik";

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  icon?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  className?: string;
  isTextArea?: boolean;
  rows?: number;
  restrict?: "digitsOnly" | "alphaOnly" | "alphaNumeric";
  onIconClick?: () => void;
  maxLength?: number;
  onKeyDown?: React.KeyboardEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  >;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  icon,
  isTextArea,
  restrict,
  className,
  onIconClick,
  ...props
}) => {
  const [field, meta, helpers] = useField(props);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    let value = e.target.value;

    if (restrict === "digitsOnly") {
      value = value.replace(/[^0-9]/g, "");
    } else if (restrict === "alphaOnly") {
      value = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (restrict === "alphaNumeric") {
      value = value.replace(/[^a-zA-Z0-9]/g, "");
    }

    helpers.setValue(value);
  };

  const InputComponent = isTextArea ? "textarea" : "input";
  const hasError = meta.touched && meta.error;

  return (
    <div className={`relative ${className || ""}`}>
      <label className="font-medium text-pathik-text-dark mb-1.5 block text-sm">
        {label} {props.required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <InputComponent
          {...field}
          {...props}
          value={field.value ?? ""}
          onChange={handleChange}
          className={`w-full p-2.5 pl-3 ${icon ? "pr-9" : "pr-3"} border-[1.5px] rounded-lg text-sm bg-pathik-bg-light outline-none transition-all placeholder:text-gray-400
            ${
              hasError
                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-pathik-border focus:border-pathik-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
            }
            ${props.disabled || props.readOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}
            ${isTextArea ? "min-h-[100px] resize-y" : ""}
          `}
        />
        {icon && !isTextArea && (
          <i
            onClick={onIconClick}
            className={`fas ${icon} absolute right-3 top-1/2 -translate-y-1/2 text-pathik-text-light text-xs transition-colors ${hasError ? "text-red-400" : ""} ${onIconClick ? "cursor-pointer hover:text-pathik-primary" : "pointer-events-none"}`}
          ></i>
        )}
      </div>
      {hasError && (
        <div className="text-red-500 text-xs mt-1 animate-[fadeIn_0.3s_ease-out] flex items-center gap-1">
          <i className="fas fa-exclamation-circle"></i>
          {meta.error}
        </div>
      )}
    </div>
  );
};

export default FormInput;
