"use client";

import { useRef } from "react";

interface Props {
  length?: number;
  onChange: (otp: string) => void;
}

export default function OtpInput({ length = 6, onChange }: Props) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    inputs.current[index]!.value = value;

    // Move to next input
    if (value && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    const otp = inputs.current.map((input) => input?.value || "").join("");
    onChange(otp);
  };

  const handleBackspace = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !inputs.current[index]?.value && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-3">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleBackspace(e, index)}
          className="w-12 h-12 text-center text-xl font-bold border-2 border-pathik-border rounded-lg focus:border-pathik-primary focus:outline-none transition-all"
        />
      ))}
    </div>
  );
}
 