"use client";

import { useState, useRef, useEffect } from "react";

interface OTPScreenProps {
  onVerify: (otp: string) => Promise<void> | void;
  onResend?: () => Promise<void> | void;
  email?: string;
}

export default function OTPScreen({
  onVerify,
  onResend,
  email,
}: OTPScreenProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Start countdown timer
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedValue = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedValue.forEach((char, i) => {
        if (index + i < 6 && /^\d$/.test(char)) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      // Focus next empty input or last input
      const nextIndex = Math.min(index + pastedValue.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    if (!/^\d$/.test(value) && value !== "") return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every((digit) => digit !== "") && index === 5) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpValue?: string) => {
    const otpString = otpValue || otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await onVerify(otpString);
    } catch (err: any) {
      setError(err?.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setIsLoading(true);
    try {
      if (onResend) {
        await onResend();
      }
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setTimer(60);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    } catch (error) {
      // Error handled by parent or service
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-pathik-primary/10 flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-lock text-pathik-primary text-2xl"></i>
        </div>
        <h3 className="text-2xl font-bold text-pathik-text-dark mb-2">
          Enter Verification Code
        </h3>
        <p className="text-sm text-pathik-text-light">
          We've sent a 6-digit code to
        </p>
        {email && (
          <p className="text-sm font-semibold text-pathik-text-dark mt-1">
            {email}
          </p>
        )}
      </div>

      {/* OTP Input Fields */}
      <div className="flex justify-center md:gap-3 gap-2 mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg transition-all duration-200 focus:outline-none ${error
                ? "border-red-500 bg-red-50"
                : digit
                  ? "border-pathik-primary bg-pathik-primary/5"
                  : "border-pathik-border focus:border-pathik-primary focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
              }`}
            disabled={isLoading}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 animate-[fadeIn_0.3s_ease-out]">
          <i className="fas fa-exclamation-circle text-red-500"></i>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Timer and Resend */}
      <div className="text-center mb-6">
        {!canResend ? (
          <p className="text-sm text-pathik-text-light">
            Resend code in{" "}
            <span className="font-semibold text-pathik-primary">{timer}s</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="text-sm text-pathik-primary hover:text-pathik-primary-dark font-semibold transition-colors duration-300"
          >
            <i className="fas fa-redo mr-1"></i>
            Resend Code
          </button>
        )}
      </div>

      {/* Verify Button */}
      <button
        type="button"
        onClick={() => handleVerify()}
        disabled={isLoading || otp.some((digit) => !digit)}
        className="w-full py-3 bg-linear-to-r from-pathik-primary to-pathik-secondary text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <i className="fas fa-spinner fa-spin"></i>
            <span>Verifying...</span>
          </>
        ) : (
          <>
            <i className="fas fa-check-circle"></i>
            <span>Verify OTP</span>
          </>
        )}
      </button>

      {/* Help Text */}
      <p className="text-xs text-pathik-text-light text-center mt-4">
        Didn't receive the code? Check your spam folder or{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend}
          className="text-pathik-primary hover:text-pathik-primary-dark font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          resend
        </button>
      </p>
    </div>
  );
}
 