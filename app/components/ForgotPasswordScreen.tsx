"use client";

import { useState } from "react";
import Image from "next/image";
import { useFormik } from "formik";
import * as Yup from "yup";
import authService from "../services/auth/authService";
import { toast } from "react-toastify";

// ✅ ADD THIS
type PortalType = "POLICE" | "HOTEL";

interface Props {
  portalType: PortalType;
}

export default function ForgotPasswordScreen({ portalType }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Email is required"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        await authService.forgotPassword(values.email, portalType);
        toast.success("Password reset link sent to your email");
      } catch (err: any) {
        toast.error(err.message || "Failed to send reset link");
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="flex h-screen w-full bg-pathik-bg-light overflow-hidden shadow-2xl">

      {/* Left Branding Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-linear-to-r from-pathik-primary via-pathik-primary-dark to-pathik-secondary items-center justify-center p-12 text-white">
        <div className="relative flex flex-col items-center text-center">
          <Image
            src={"/PATHIK_LOGO.png"}
            width={200}
            height={200}
            alt="Pathik Logo"
            className="mb-4"
          />
          <p className="text-[1.1rem] font-light tracking-[1px] opacity-90 max-w-[80%] mx-auto">
            Program for Analysis of Traveller and Hotel Informatiks
          </p>

          <div className="mt-4 px-5 py-2 border border-white/30 bg-white/10 backdrop-blur-sm rounded-full">
            <span className="text-sm font-semibold tracking-wider uppercase">
              {portalType} Forgot Password
            </span>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-[420px]">
          <div className="bg-white rounded-[24px] p-10 shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-pathik-border">

            <h2 className="text-[2rem] font-bold text-pathik-text-dark mb-2">
              Forgot Password
            </h2>
            <p className="text-pathik-text-light text-[0.95rem] mb-8">
              Enter your registered email to receive a reset link.
            </p>

            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-6">

              {/* Email Input */}
              <div className="group">
                <label className="block text-[0.9rem] font-semibold text-pathik-text-dark mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-pathik-text-light"></i>
                  <input
                    type="email"
                    name="email"
                    className={`w-full py-[12px] pl-[50px] pr-[15px] border-2 rounded-[12px] text-[1rem] transition-all ${formik.touched.email && formik.errors.email
                      ? "border-red-500"
                      : "border-pathik-border focus:border-pathik-primary"
                      }`}
                    placeholder="Enter your email"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                  />
                </div>

                {formik.touched.email && formik.errors.email && (
                  <div className="text-red-500 text-xs mt-1 ml-1">
                    {formik.errors.email}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-[14px] bg-linear-to-r from-pathik-primary to-pathik-secondary text-white rounded-[12px] font-bold shadow-md transition-all hover:-translate-y-[2px]"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>

              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => window.location.href = "/"}
                  className="text-sm font-semibold text-pathik-primary hover:text-pathik-primary-dark transition-colors"
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Back to Login
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
 