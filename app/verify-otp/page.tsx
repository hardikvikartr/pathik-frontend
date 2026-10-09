"use client";

import { useState } from "react";
import authService from "@/app/services/auth/authService";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "../components/AuthLayout";
import OtpInput from "../components/OtpInput";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const role = searchParams.get("role") || "HOTEL";

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Enter full 6 digit OTP");
      return;
    }

    if (!email) {
      toast.error("Email not found");
      return;
    }

    setLoading(true);
    try {
      await authService.verifyOtp(email, otp, role);
      toast.success("OTP Verified");
      router.push("/reset-password");
    } catch {
      toast.error("Invalid OTP");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="OTP Verification"
      subtitle="Enter the 6-digit OTP sent to your email"
    >
      <OtpInput onChange={setOtp} />

      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full mt-6 py-3 bg-pathik-primary text-white rounded-lg font-bold shadow-md hover:-translate-y-1 transition-all"
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      <p className="text-center text-sm mt-4 text-gray-500">
        Didn’t receive OTP? <span className="text-pathik-primary font-semibold cursor-pointer">Resend</span>
      </p>
    </AuthLayout>
  );
}
