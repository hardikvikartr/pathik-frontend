import { ENDPOINTS } from "@/app/constants/endpoints";
import { LoginPayload } from "./auth.type";
import { API_METHODS, ApiResponse } from "../../types";
import serviceAdapter from "../serviceAdapter";
import { SecureStorage } from "@/app/utils/secureStorage";
import { toast } from "react-toastify";

interface LoginResponse {
  user: any;
  token: string;
  expires_in: string;
}

interface ForgotPasswordResponse {
  message: string;
}

interface ResetPasswordPayload {
  email: string;
  password: string;
  confirm_password: string;
}

class AuthService {
  async handleLogin(
    payload: LoginPayload,
    portalType: "HOTEL" | "POLICE" | "ADMIN",
  ): Promise<ApiResponse<LoginResponse> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<LoginResponse>>(
        API_METHODS.POST,
        ENDPOINTS.LOGIN,
        payload,
        { type: portalType, useToken: false, isEncrypted: true },
      );
      return response;
    } catch (error) {
      //   console.error("Login Error:", error);
      throw error;
    }
  }

  async checkLoginCredentials(
    payload: LoginPayload,
    userType: string,
  ): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.POST,
        ENDPOINTS.CHECK_LOGIN_CREDENTIALS,
        payload,
        { useToken: true, isEncrypted: true, type: userType as any },
      );
      return {code: 200, data: {}, message: 'Success'};
    } catch (error) {
      toast.error(
        (error as Error)?.message || "Failed to check login credentials",
      );
      throw error;
    }
  }

  async sendOtp(
    email: string,
    userType: string,
  ): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.POST,
        ENDPOINTS.SEND_OTP,
        { email, user_type: userType },
        { useToken: true, isEncrypted: true, type: userType as any },
      );
      return response;
    } catch (error) {
      // console.error("Send OTP Error:", error);
      toast.error((error as Error)?.message || "Failed to send OTP");
      throw error;
    }
  }

  async verifyOtp(
    email: string,
    otp: string,
    userType: string,
  ): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.POST,
        ENDPOINTS.VERIFY_OTP,
        { email, otp },
        { useToken: true, isEncrypted: true, type: userType as any },
      );
      return response;
    } catch (error) {
      toast.error((error as Error)?.message || "Failed to verify OTP");
      throw error;
    }
  }

  async forgotPassword(
    email: string,
    userType: string,
  ): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.POST,
        ENDPOINTS.FORGOT_PASSWORD,
        { email },
        { useToken: false, isEncrypted: true, type: userType as any },
      );
      return response;
    } catch (error) {
      toast.error((error as Error)?.message || "Failed to send OTP");
      throw error;
    }
  }

  async resetPassword(
    payload: ResetPasswordPayload,
    userType: string,
  ): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.POST,
        ENDPOINTS.RESET_PASSWORD,
        payload,
        { useToken: false, isEncrypted: true, type: userType as any },
      );
      return response;
    } catch (error) {
      toast.error((error as Error)?.message || "Failed to reset password");
      throw error;
    }
  }

  async logout(
    userType: "HOTEL" | "POLICE" | "ADMIN",
  ): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.GET,
        ENDPOINTS.LOGOUT,
        {},
        { useToken: true, isEncrypted: true, type: userType },
      );
      return response;
    } catch (error) {
      toast.error((error as Error)?.message || "Failed to logout");
      throw error;
    }
  }

  async getCurrentUser(
    userType: "HOTEL" | "POLICE" | "ADMIN",
  ): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.GET,
        ENDPOINTS.GET_CURRENT_USER,
        {},
        { useToken: true, isEncrypted: true, type: userType },
      );
      return response;
    } catch (error) {
      toast.error((error as Error)?.message || "Failed to get current user");
      throw error;
    }
  }
}

export default new AuthService();
