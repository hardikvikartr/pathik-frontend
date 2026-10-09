"use client";

import { useState } from "react";
import { useAuth, UserRole } from "../context/AuthContext";
import { Role, Permission, PoliceStation, Hotel } from "../types";
import Modal from "./Modal";
import ImageCaptcha from "./ImageCaptcha";
import OTPScreen from "./OTPScreen";
import Image from "next/image";
import { useFormik } from "formik";
import * as Yup from "yup";
import authService from "../services/auth/authService";
import { toast } from "react-toastify";
import { SecureStorage } from "../utils/secureStorage";
import { useRouter } from "next/navigation";

type PortalType = "ADMIN" | "HOTEL" | "POLICE";

interface LoginScreenProps {
  portalType: PortalType;
}

export default function LoginScreen({ portalType }: LoginScreenProps) {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const router = useRouter()
  // Default value based on Portal Type for convenience
  const getDefaultEmail = () => {
    switch (portalType) {
      case "ADMIN":
        return "";
      case "POLICE":
        return "";
      case "HOTEL":
        return "";
      default:
        return "";
    }
  };

  const getPortalTitle = () => {
    switch (portalType) {
      case "ADMIN":
        return "Administration";
      case "POLICE":
        return "Police Portal";
      case "HOTEL":
        return "Hotel Partner";
      default:
        return "";
    }
  };

  // Formik Configuration
  const formik = useFormik({
    initialValues: {
      email: getDefaultEmail(),
      password: "",
      rememberMe: false,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: async (values) => {
      // Proceed to Captcha
      setShowCaptchaModal(true);
    },
  });

  // Store pending login data
  const [pendingLoginData, setPendingLoginData] = useState<any>(null);
  const [pendingToken, setPendingToken] = useState<string>("");

  const handleCaptchaVerify = async (verified: boolean) => {
    setCaptchaVerified(verified);
    const payload = {
      email: formik.values.email,
      password: formik.values.password,
    };

    if (verified) {
      if (portalType === "ADMIN") {
        setIsLoading(true);
        try {
          const response = await authService.handleLogin(payload, portalType);

          if (response && response.data) {
            setPendingLoginData(response.data.user);
            setPendingToken(response.data.token);

            // Call Send OTP
            await authService.sendOtp(formik.values.email, portalType);

            // Show OTP Modal without calling API
            setShowCaptchaModal(false);
            setShowOTPModal(true);
          }
        } catch (error) {
          toast.error((error as Error)?.message || "Failed to login");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(true);
        // return new Promise((res, rej) => setTimeout(() => {
        //   setIsLoading(false);
        //   setShowCaptchaModal(false);
        //   setShowOTPModal(true);
        //   res(true);
        // }, 500));
        try {
          const response = await authService.handleLogin(payload, portalType);

          if (response && response.data) {
            setPendingLoginData(response.data.user);
            setPendingToken(response.data.token);

            // Call Send OTP
            await authService.sendOtp(formik.values.email, portalType);

            // Show OTP Modal without calling API
            setShowCaptchaModal(false);
            setShowOTPModal(true);
          }
        } catch (error) {
          toast.error((error as Error)?.message || "Failed to login");
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handleOTPVerify = async (otp: string) => {
    setIsLoading(true);

    // Simulate delay
    // await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const response = await authService.verifyOtp(formik.values.email, otp, portalType);
      if (response && response.data) {
        const apiUser = pendingLoginData;
        const apiToken = pendingToken;

        if (apiUser && apiToken) {
          // Map API role ID to App Role String
          let role: UserRole = "HOTEL";
          if (portalType === "ADMIN") role = "SUPER_ADMIN";
          else if (portalType === "POLICE") role = "POLICE_STATION";
          else role = "HOTEL";

          // Map permissions
          let permissions: string[] = [];
          if (role === "SUPER_ADMIN") permissions = ["*"];
          else if (role === "POLICE_STATION")
            permissions = ["read_hotel", "read_guest", "create_hotel", "update_hotel"];
          else permissions = ["create_guest", "read_guest", "update_guest", "delete_guest"];

          let name;
          if (portalType === 'ADMIN') {
            name = apiUser.name || apiUser.fname + " " + apiUser.lname;
          } else if (portalType === 'POLICE') {
            name = apiUser.name || apiUser.full_name || apiUser.fname + " " + apiUser.lname;
          } else {
            name = apiUser.hotel_name;
          }
          login(
            {
              ...apiUser,
              name: name,
              role: role,
              permissions: permissions,
            },
            apiToken,
          );

          setShowOTPModal(false);
        }
      }
    } catch (error) {
      // console.error("OTP Verification Failed:", error);
      toast.error("Invalid OTP");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex h-screen w-full bg-pathik-bg-light overflow-hidden shadow-2xl animate-[fadeIn_0.5s_ease-in-out]">
        {/* Left Side - Branding */}
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
                {getPortalTitle()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
          <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-pathik-primary/5 rounded-full blur-[60px] animate-[pulse_4s_ease-in-out_infinite]"></div>

          <div className="w-full max-w-[420px] relative z-10">
            <div className="bg-white rounded-[24px] p-10 shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-pathik-border transition-all duration-300 hover:translate-y-[-5px] hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
              <h2 className="text-[2rem] font-bold text-pathik-text-dark mb-2 tracking-[-0.5px]">
                Sign In
              </h2>
              <p className="text-pathik-text-light text-[0.95rem] mb-8">
                Welcome to <strong>{getPortalTitle()}</strong>. Please login.
              </p>

              <form
                onSubmit={formik.handleSubmit}
                className="flex flex-col gap-6"
                noValidate
              >
                <div className="group">
                  <label className="block text-[0.9rem] font-semibold text-pathik-text-dark mb-2 ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-pathik-text-light text-[1.1rem] transition-colors duration-300 group-focus-within:text-pathik-primary z-10"></i>
                    <input
                      type="email"
                      name="email"
                      className={`w-full py-[12px] pl-[50px] pr-[15px] border-2 rounded-[12px] text-[1rem] bg-white transition-all duration-300 focus:outline-none focus:shadow-[0_0_0_4px_rgba(102,126,234,0.1)] placeholder:text-pathik-text-light/60 ${formik.touched.email && formik.errors.email
                        ? "border-red-500 focus:border-red-500"
                        : "border-pathik-border focus:border-pathik-primary"
                        }`}
                      placeholder="Enter your email"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.email}
                    />
                  </div>
                  {formik.touched.email && formik.errors.email ? (
                    <div className="text-red-500 text-xs mt-1 ml-1">
                      {formik.errors.email}
                    </div>
                  ) : null}
                </div>

                <div className="group">
                  <label className="block text-[0.9rem] font-semibold text-pathik-text-dark mb-2 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-pathik-text-light text-[1.1rem] transition-colors duration-300 group-focus-within:text-pathik-primary z-10"></i>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className={`w-full py-[12px] pl-[50px] pr-[50px] border-2 rounded-[12px] text-[1rem] bg-white transition-all duration-300 focus:outline-none focus:shadow-[0_0_0_4px_rgba(102,126,234,0.1)] placeholder:text-pathik-text-light/60 ${formik.touched.password && formik.errors.password
                        ? "border-red-500 focus:border-red-500"
                        : "border-pathik-border focus:border-pathik-primary"
                        }`}
                      id="passwordInput"
                      placeholder="Enter your password"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.password}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none text-pathik-text-light cursor-pointer transition-colors duration-300 hover:text-pathik-primary p-0 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i
                        className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                      ></i>
                    </button>
                  </div>
                  {formik.touched.password && formik.errors.password ? (
                    <div className="text-red-500 text-xs mt-1 ml-1">
                      {formik.errors.password}
                    </div>
                  ) : null}
                </div>

                <div className="flex justify-between items-center text-[0.9rem]">
                  <div className="flex items-center gap-2">
                    {/* <input
                      className="w-[18px] h-[18px] border-2 border-pathik-border rounded transition-all cursor-pointer checked:bg-pathik-primary checked:border-pathik-primary focus:ring-2 focus:ring-pathik-primary/20 accent-pathik-primary"
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      onChange={formik.handleChange}
                      checked={formik.values.rememberMe}
                    />
                    <label
                      className="text-pathik-text-medium cursor-pointer select-none"
                      htmlFor="rememberMe"
                    >
                      Remember me
                    </label> */}
                  </div>
                  {portalType !== "ADMIN" && (
                    <button
                      type="button"
                      onClick={() => router.push(`/forgot-password?role=${portalType}`)}
                      className="font-semibold text-pathik-primary hover:text-pathik-primary-dark transition-colors"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-[14px] bg-linear-to-r from-pathik-primary to-pathik-secondary text-white border-none rounded-[12px] text-[1rem] font-bold cursor-pointer shadow-[0_4px_15px_rgba(102,126,234,0.4)] transition-all duration-300 mt-2 hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(102,126,234,0.5)] active:translate-y-0 active:shadow-[0_2px_10px_rgba(102,126,234,0.3)] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fas fa-spinner fa-spin"></i>Signing in...
                    </span>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showCaptchaModal}
        onClose={() => {
          setShowCaptchaModal(false);
          setCaptchaVerified(false);
        }}
        title="Security Verification"
      >
        <ImageCaptcha onVerify={handleCaptchaVerify} />
      </Modal>

      <Modal
        isOpen={showOTPModal}
        onClose={() => {
          setShowOTPModal(false);
          setCaptchaVerified(false);
        }}
        title="Two-Factor Authentication"
      >
        <OTPScreen
          onVerify={handleOTPVerify}
          email={formik.values.email}
          onResend={async () => {
            try {
              await authService.sendOtp(formik.values.email, portalType);
              toast.success("OTP resent successfully");
            } catch (error) {
              // Error handled in service
            }
          }}
        />
      </Modal>
    </>
  );
}
