"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import authService from "../services/auth/authService";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { encryptRequest } from "../utils/encryption";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const [step, setStep] = useState<"CREDENTIALS" | "OTP">("CREDENTIALS");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const credentialsFormik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        let userType: "HOTEL" | "POLICE" | "ADMIN" = "HOTEL";
        if (user?.role === "POLICE_STATION") {
          userType = "POLICE";
        } else if (user?.role === "SUPER_ADMIN") {
          userType = "ADMIN";
        }

        // 1. Check Credentials
        await authService.checkLoginCredentials(values, userType);

        // 2. Send OTP
        await authService.sendOtp(values.email, userType);

        toast.success("Credentials verified. OTP sent to your email.");
        setStep("OTP");
      } catch (error: any) {
        toast.error(error.message || "Failed to verify credentials");
      } finally {
        setIsLoading(false);
      }
    },
  });

  const otpFormik = useFormik({
    initialValues: {
      otp: "",
    },
    validationSchema: Yup.object({
      otp: Yup.string()
        .length(6, "OTP must be 6 digits") // Assuming 6 digits
        .required("OTP is required"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        let userType: "HOTEL" | "POLICE" | "ADMIN" = "HOTEL";
        if (user?.role === "POLICE_STATION") {
          userType = "POLICE";
        } else if (user?.role === "SUPER_ADMIN") {
          userType = "ADMIN";
        }

        // 3. Verify OTP
        await authService.verifyOtp(
          credentialsFormik.values.email,
          values.otp,
          userType,
        );

        toast.success("OTP verified successfully");
        onClose(); // Close modal

        // 4. Redirect to Reset Password
        // Pass email and role to the reset password page if needed, or rely on them being logged in?
        // The reset password page seems to expect query params based on earlier analysis.
        // Assuming current logic: ResetPasswordScreen decrypts 'email' query param.

        // NOTE: The ResetPasswordScreen usually is for "Forgot Password" flow where user is NOT logged in.
        // Here user IS logged in. However, the requirement says "redirect to reset-password screen".
        // We will pass the email in query param as expected by the existing page.
        // We might need to encrypt it if the page expects encrypted email, but let's try raw first or check providing encryption util.
        // The page attempts to decrypt, if fails it falls back to raw value. So raw email should work.

        const encryptedEmail = encryptRequest(credentialsFormik.values.email);
        router.push(
          `/reset-password?email=${encodeURIComponent(encryptedEmail)}&role=${userType}`,
        );
      } catch (error: any) {
        toast.error(error.message || "Failed to verify OTP");
      } finally {
        setIsLoading(false);
      }
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-[scaleIn_0.3s_ease-out]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Change Password</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        <div className="p-6">
          {step === "CREDENTIALS" && (
            <form
              onSubmit={credentialsFormik.handleSubmit}
              className="flex flex-col gap-4"
            >
              <p className="text-sm text-gray-500 mb-2">
                Please enter your current email and password to proceed.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    credentialsFormik.touched.email &&
                    credentialsFormik.errors.email
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 focus:border-pathik-primary focus:ring-2 focus:ring-pathik-primary/20"
                  } outline-none transition-all`}
                  onChange={credentialsFormik.handleChange}
                  onBlur={credentialsFormik.handleBlur}
                  value={credentialsFormik.values.email}
                  placeholder="Enter your email"
                />
                {credentialsFormik.touched.email &&
                  credentialsFormik.errors.email && (
                    <div className="text-red-500 text-xs mt-1">
                      {credentialsFormik.errors.email}
                    </div>
                  )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="password"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    credentialsFormik.touched.password &&
                    credentialsFormik.errors.password
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 focus:border-pathik-primary focus:ring-2 focus:ring-pathik-primary/20"
                  } outline-none transition-all`}
                  onChange={credentialsFormik.handleChange}
                  onBlur={credentialsFormik.handleBlur}
                  value={credentialsFormik.values.password}
                  placeholder="Enter current password"
                />
                {credentialsFormik.touched.password &&
                  credentialsFormik.errors.password && (
                    <div className="text-red-500 text-xs mt-1">
                      {credentialsFormik.errors.password}
                    </div>
                  )}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 rounded-xl bg-pathik-primary text-white font-medium hover:bg-pathik-primary-dark transition-colors shadow-lg shadow-pathik-primary/30 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    "Verify"
                  )}
                </button>
              </div>
            </form>
          )}

          {step === "OTP" && (
            <form
              onSubmit={otpFormik.handleSubmit}
              className="flex flex-col gap-4"
            >
              <p className="text-sm text-gray-500 mb-2">
                An OTP has been sent to{" "}
                <strong>{credentialsFormik.values.email}</strong>. Please enter
                it below.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter OTP
                </label>
                <input
                  type="text"
                  name="otp"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    otpFormik.touched.otp && otpFormik.errors.otp
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 focus:border-pathik-primary focus:ring-2 focus:ring-pathik-primary/20"
                  } outline-none transition-all text-center text-2xl tracking-widest`}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      otpFormik.setFieldValue("otp", value);
                    }
                  }}
                  onBlur={otpFormik.handleBlur}
                  value={otpFormik.values.otp}
                  placeholder="------"
                  maxLength={6}
                />
                {otpFormik.touched.otp && otpFormik.errors.otp && (
                  <div className="text-red-500 text-xs mt-1 text-center">
                    {otpFormik.errors.otp}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setStep("CREDENTIALS")}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 rounded-xl bg-pathik-primary text-white font-medium hover:bg-pathik-primary-dark transition-colors shadow-lg shadow-pathik-primary/30 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    "Verify & Proceed"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
