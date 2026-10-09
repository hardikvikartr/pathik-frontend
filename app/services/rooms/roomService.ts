import { API_METHODS, ApiResponse } from "@/app/types";
import serviceAdapter from "../serviceAdapter";
import { ENDPOINTS } from "@/app/constants/endpoints";
import { toast } from "react-toastify";
import { decryptResponse } from "@/app/utils/encryption";

export interface AddRoomPayload {
  address_id: number;
  wing: string;
  floor_no: number;
  room_type: string;
  start_room_no: number;
  end_room_no: number;
}

export interface GetRoomsPayload {
  address_id: number;
  page: number;
  record_count: number;
}

class RoomService {
  async getAddresses(): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.GET,
        ENDPOINTS.GET_ADDRESSES,
        null,
        { useToken: true, isEncrypted: true },
      );
      return response;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data).message);
      throw error;
    }
  }
  async addRoom(
    payload: AddRoomPayload,
  ): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.POST,
        ENDPOINTS.ADD_ROOM,
        payload,
        { useToken: true, isEncrypted: true },
      );
      return response;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data).message);
      throw error;
    }
  }

  async getRooms(
    payload: GetRoomsPayload,
  ): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.POST,
        ENDPOINTS.GET_ROOMS,
        payload,
        { useToken: true, isEncrypted: true },
      );
      return response;
    } catch (error) {
      if ((error as Error).cause === "404") {
        toast.error("No rooms found");
      }
      throw error;
    }
  }

  async getRoomTypes(): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.GET,
        ENDPOINTS.GET_ROOM_TYPES,
        null,
        { useToken: true, isEncrypted: true },
      );
      return response;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data).message);
      throw error;
    }
  }
}

export default new RoomService();
