"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useFormik } from "formik";
import * as Yup from "yup";
import authService from "../services/auth/authService";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { decryptResponse, decryptText } from "../utils/encryption";

export default function ResetPasswordScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const roleParam = searchParams.get("role") || "HOTEL";

  // Decrypt email if present
  const [decryptedEmail, setDecryptedEmail] = useState("");

  useEffect(() => {
    if (emailParam) {
      try {
        // Replacing spaces with + which sometimes happens in URL encoding
        const normalizedEmail = emailParam.replace(/ /g, "+");
        const decryptedValue = decryptText(normalizedEmail);

        if (decryptedValue) {
          // Check if it's a JSON string by mistake
          if (
            decryptedValue.startsWith("{") ||
            decryptedValue.startsWith('"')
          ) {
            try {
              const parsed = JSON.parse(decryptedValue);
              setDecryptedEmail(
                typeof parsed === "string"
                  ? parsed
                  : parsed.email || decryptedValue,
              );
            } catch {
              setDecryptedEmail(decryptedValue);
            }
          } else {
            setDecryptedEmail(decryptedValue);
          }
        } else {
          setDecryptedEmail(emailParam);
        }
      } catch (error) {
        // console.error("Decryption failed", error);
        setDecryptedEmail(emailParam);
      }
    }
  }, [emailParam]);

  const formik = useFormik({
    initialValues: {
      password: "",
      confirm_password: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      confirm_password: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Confirm password is required"),
    }),
    onSubmit: async (values) => {
      if (!decryptedEmail) {
        toast.error("Invalid or missing email in reset link");
        return;
      }
      setIsLoading(true);
      try {
        await authService.resetPassword(
          {
            email: decryptedEmail,
            password: values.password,
            confirm_password: values.confirm_password,
          },
          roleParam,
        );
        toast.success("Password reset successfully!");
        router.push(`/dashboard`);
      } catch (err: any) {
        toast.error(err.message || "Failed to reset password");
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="flex h-screen w-full bg-pathik-bg-light overflow-hidden shadow-2xl">
      {/* Left Branding Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-linear-to-r from-pathik-primary via-pathik-primary-dark to-pathik-secondary items-center justify-center p-12 text-center text-white z-10 transition-all duration-300">
        <div className="absolute inset-0 z-0">
          <div className="absolute w-[400px] height-[400px] border-50 border-white/5 rounded-full top-[-100px] left-[-100px] animate-[float_6s_ease-in-out_infinite]"></div>
          <div className="absolute w-[300px] height-[300px] border-30 border-white/5 rounded-full bottom-[-50px] right-[-50px] animate-[float_8s_ease-in-out_infinite_2s]"></div>
          <div className="absolute w-[150px] height-[150px] border-20 border-white/5 rounded-full top-[20%] right-[20%] animate-[float_7s_ease-in-out_infinite_4s]"></div>
        </div>

        <div className="relative z-10 animate-[scaleIn_0.8s_ease-out_0.2s_both] flex flex-col items-center">
          <Image
            src={"/PATHIK_LOGO.png"}
            width={200}
            height={200}
            alt="Pathik Logo"
            className="mb-4"
          />
          <p className="text-[1.1rem] font-light tracking-[1px] opacity-90 max-w-[80%] mx-auto mb-4">
            Program for Analysis of Traveller and Hotel Informatiks
          </p>

          {/* UI IDENTIFIER FOR ROLE */}
          <div className="mt-4 px-5 py-2 border border-white/30 bg-white/10 backdrop-blur-sm rounded-full animate-[fadeIn_0.5s_ease-out_0.5s_both]">
            <span className="text-sm font-semibold tracking-wider uppercase">
              RESET PASSWORD
            </span>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
        <div className="w-full max-w-[450px]">
          <div className="bg-white rounded-[40px] p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100">
            <div className="mb-10">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
                Reset Password
              </h2>
              <p className="text-gray-500 text-lg">Create your new password</p>
            </div>

            <form
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-8"
            >
              {/* Password Input */}
              <div className="group">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className={`w-full py-5 px-6 border rounded-2xl text-lg transition-all duration-300 outline-none ${
                      formik.touched.password && formik.errors.password
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 focus:border-[#627EF2] focus:shadow-[0_0_0_4px_rgba(98,126,242,0.1)] focus:bg-white"
                    }`}
                    placeholder="New Password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.password}
                  />
                  <button
                    type="button"
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#627EF2] transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i
                      className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} text-xl`}
                    ></i>
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <div className="text-red-500 text-sm mt-2 font-medium">
                    {formik.errors.password}
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="group">
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirm_password"
                    className={`w-full py-5 px-6 border rounded-2xl text-lg transition-all duration-300 outline-none ${
                      formik.touched.confirm_password &&
                      formik.errors.confirm_password
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 focus:border-[#627EF2] focus:shadow-[0_0_0_4px_rgba(98,126,242,0.1)] focus:bg-white"
                    }`}
                    placeholder="Confirm Password"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.confirm_password}
                  />
                  <button
                    type="button"
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#627EF2] transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i
                      className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"} text-xl`}
                    ></i>
                  </button>
                </div>
                {formik.touched.confirm_password &&
                  formik.errors.confirm_password && (
                    <div className="text-red-500 text-sm mt-2 font-medium">
                      {formik.errors.confirm_password}
                    </div>
                  )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-[#627EF2] text-white rounded-2xl text-xl font-bold shadow-[0_12px_30px_-10px_rgba(98,126,242,0.5)] transition-all duration-300 hover:bg-[#526CDB] hover:shadow-[0_15px_40px_-10px_rgba(98,126,242,0.6)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-4"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-3">
                    <i className="fas fa-spinner fa-spin"></i> Processing...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
