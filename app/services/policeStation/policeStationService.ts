import { ENDPOINTS } from "@/app/constants/endpoints";
import { API_METHODS, ApiResponse } from "../../types";
import serviceAdapter from "../serviceAdapter";
import { toast } from "react-toastify";
import { decryptResponse } from "@/app/utils/encryption";

interface PoliceStationListPayload {
  page: number;
  record_count: number;
}

interface PoliceStationListResponse {
  data: any[];
  total: number;
  page: number;
  record_count: number;
}

export interface AddPolicePayload {
  state_id: number;
  district_id: number;
  district: string;
  police_station: string;
  sector: string;
  zone: string;
  division: string;
  email: string;
  mobile: number;
  role_id: number;
  password: string;
}

interface ChangeStatusPayload {
  police_station_id: number;
  is_active: boolean;
}

interface PoliceStationDetailsPayload {
  police_station_id: number;
}

interface UpdatePoliceStationPayload {
  police_station_id: number;
  state_id?: number;
  district_id?: number;
  police_station?: string;
  district?: string;
  name?: string;
  sector?: string;
  zone?: string;
  division?: string;
  email?: string;
  mobile?: string;
  role_id?: number;
}

class PoliceStationService {
  async getPoliceStationList(
    payload: PoliceStationListPayload,
  ): Promise<ApiResponse<PoliceStationListResponse> | undefined> {
    try {
      const response = await serviceAdapter<
        ApiResponse<PoliceStationListResponse>
      >(API_METHODS.POST, ENDPOINTS.GET_POLICE_STATIONS, payload, {
        useToken: true,
        isEncrypted: true,
      });
      return response;
    } catch (error) {
      toast.error((decryptResponse((error as any).response.data).message) || "Failed to get police station list");
      // throw error;
    }
  }

  async addPoliceStation(
    payload: AddPolicePayload,
  ): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter(
        API_METHODS.POST,
        ENDPOINTS.ADD_POLICE_STATION,
        payload,
        { isEncrypted: true, useToken: true },
      );
      return response as any;
    } catch (error) {
      toast.error(
        (decryptResponse((error as any).response.data).message) ||
        "Something went wrong while adding police station",
      );
      return undefined;
    }
  }

  async changePoliceStationStatus(
    policeStationId: number,
    isActive: boolean,
  ): Promise<ApiResponse<any> | undefined> {
    try {
      const payload: ChangeStatusPayload = {
        police_station_id: policeStationId,
        is_active: isActive,
      };

      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.POST,
        ENDPOINTS.CHANGE_POLICE_STATION_STATUS,
        payload,
        {
          useToken: true,
          isEncrypted: true,
        },
      );
      return response;
    } catch (error) {
      toast.error((error as Error)?.message || "Failed to change police station status");
      throw error;
    }
  }

  async getPoliceStationDetails(
    policeStationId: number,
  ): Promise<ApiResponse<any> | undefined> {
    try {
      const payload: PoliceStationDetailsPayload = {
        police_station_id: policeStationId,
      };

      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.POST,
        ENDPOINTS.GET_POLICE_STATION_DETAILS,
        payload,
        {
          useToken: true,
          isEncrypted: true,
        },
      );

      return response;
    } catch (error) {
      toast.error((error as Error)?.message || "Failed to get police station details");
      throw error;
    }
  }

  async updatePoliceStation(
    payload: UpdatePoliceStationPayload,
  ): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.POST,
        ENDPOINTS.UPDATE_POLICE_STATION,
        payload,
        {
          useToken: true,
          isEncrypted: true,
        },
      );

      return response;
    } catch (error) {
      toast.error((error as Error)?.message || "Failed to update police station");
      throw error;
    }
  }

  async getRegisteredHotels(payload: any): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.POST,
        ENDPOINTS.GET_REGISTERED_HOTELS,
        payload,
        {
          useToken: true,
          isEncrypted: true,
        },
      );
      return response;
    } catch (error) {
      toast.error((error as Error)?.message || "Failed to get registered hotels");
      throw error;
    }
  }
}

export default new PoliceStationService();
