import { API_METHODS, ApiResponse, Permission } from "@/app/types";
import serviceAdapter from "../serviceAdapter";
import { ENDPOINTS } from "@/app/constants/endpoints";
import { toast } from "react-toastify";
import { decryptResponse } from "@/app/utils/encryption";

export interface AdminSearchPayload {
  name?: string;
  mobile?: string;
  email?: string;
  enrollment_number?: string;
  address?: string;
  hotel_name?: string;
  hotel_address?: string;
  state?: string;
  is_check_in_date?: 0 | 1;
  is_check_out_date?: 0 | 1;
  start_date?: string;
  end_date?: string;
  page: number;
  record_count: number;
}

class AdminService {
  async getRolesWithPermissions(): Promise<ApiResponse<any>> {
    try {
      const response = await serviceAdapter(
        API_METHODS.GET,
        ENDPOINTS.GET_ROLES,
        {},
        { isEncrypted: true, useToken: true },
      );
      return response as ApiResponse<any>;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data.message));
      throw error;
    }
  }

  async fetchPermissions(): Promise<ApiResponse<Permission[]>> {
    try {
      const response = await serviceAdapter(
        API_METHODS.GET,
        ENDPOINTS.GET_PERMISSIONS,
        {},
        { isEncrypted: true, useToken: true },
      );
      return response as ApiResponse<Permission[]>;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data.message));
      throw error;
    }
  }
  async addRole(payload: {
    role_name: string;
    permission_ids: number[];
  }): Promise<ApiResponse<any>> {
    try {
      const response = await serviceAdapter(
        API_METHODS.POST,
        ENDPOINTS.ADD_ROLE,
        payload,
        { isEncrypted: true, useToken: true },
      );
      return response as ApiResponse<any>;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data.message));
      throw error;
    }
  }

  async addSystemSetting(payload: {
    settings_name: string;
    settings_lable: string;
    settings_value: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await serviceAdapter(
        API_METHODS.POST,
        ENDPOINTS.ADD_SETTING,
        payload,
        { isEncrypted: true, useToken: true },
      );
      return response as ApiResponse<any>;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data.message));
      throw error;
    }
  }

  async getSystemSettings(payload: {
    page: number;
    record_count: number;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await serviceAdapter(
        API_METHODS.POST,
        ENDPOINTS.GET_SETTINGS,
        payload,
        { isEncrypted: true, useToken: true },
      );
      return response as ApiResponse<any>;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data.message));
      throw error;
    }
  }

  async updateSystemSetting(payload: {
    setting_id: number;
    settings_name: string;
    settings_lable: string;
    settings_value: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await serviceAdapter(
        API_METHODS.POST,
        ENDPOINTS.UPDATE_SETTING,
        payload,
        { isEncrypted: true, useToken: true },
      );
      return response as ApiResponse<any>;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data.message));
      throw error;
    }
  }

  async searchGuests(payload: AdminSearchPayload): Promise<ApiResponse<any>> {
    try {
      const response = await serviceAdapter(
        API_METHODS.POST,
        ENDPOINTS.ADMIN_SEARCH,
        payload,
        { isEncrypted: true, useToken: true },
      );
      return response as ApiResponse<any>;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data.message));
      throw error;
    }
  }
}

export default new AdminService();
