import { API_METHODS, ApiResponse } from "@/app/types";
import serviceAdapter from "../serviceAdapter";
import { ENDPOINTS } from "@/app/constants/endpoints";
import { toast } from "react-toastify";
import { decryptResponse } from "@/app/utils/encryption";

export interface AddHotelPayload {
  accommodation_type: "HOTEL" | "PG" | "HOME_STAY";
  username: string;
  password: string;
  hotel_name: string;
  // hotel_code: string;
  email: string;
  phone_no: number;
  website_url: string;
  address: {
    location: string;
    sublocation: string;
    latitude: number;
    longitude: number;
  }[];
  owner_name: string;
  owner_email: string;
  owner_phone: number;
  manager_name: string;
  manager_email: string;
  manager_phone: number;
}

export interface AddHotelResponse {
  hotel_id: string;
  message: string;
}

export interface GetHotelsPayload {
  page: number;
  record_count: number;
}

export interface ChangeHotelStatusPayload {
  hotel_id: number;
  is_active: boolean;
}

export interface GuestCheckInPayload {
  address_id: number;
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  no_of_adults: number;
  no_of_children: number;
  vehicle_details: {
    vehicle_type: string;
    vehicle_number: string;
  };
  guest_ids: number[];
}

export interface GetPendingCheckoutsPayload {
  hotel_id: number;
  page: number;
  record_count: number;
}

export interface GetGuestListingPayload {
  hotel_id: number;
  page: number;
  record_count: number;
}
class HotelService {
  async addHotel(
    payload: AddHotelPayload,
  ): Promise<ApiResponse<AddHotelResponse>> {
    try {
      const response = await serviceAdapter(
        API_METHODS.POST,
        ENDPOINTS.ADD_HOTEL,
        payload,
        { isEncrypted: true, useToken: true },
      );
      return response as ApiResponse<AddHotelResponse>;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data).message);
      throw error;
    }
  }

  async getHotels(
    payload: GetHotelsPayload,
  ): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.POST,
        ENDPOINTS.GET_HOTELS,
        payload,
        { useToken: true, isEncrypted: true },
      );
      return response;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data).message);
      throw error;
    }
  }

  async changeHotelStatus(
    payload: ChangeHotelStatusPayload,
  ): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.POST, // Changed from PUT to POST
        ENDPOINTS.CHANGE_HOTEL_STATUS,
        payload,
        { useToken: true, isEncrypted: true },
      );
      return response;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data).message);
      throw error;
    }
  }

  async getHotelDetails(
    hotelId: string,
  ): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.POST,
        ENDPOINTS.GET_HOTEL_DETAILS,
        { hotel_id: hotelId },
        { useToken: true, isEncrypted: true },
      );
      return response;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data).message);
      throw error;
    }
  }

  async updateHotel(payload: any): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.POST,
        ENDPOINTS.UPDATE_HOTEL,
        payload,
        { useToken: true, isEncrypted: true },
      );
      return response;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data).message);
      throw error;
    }
  }

  async getUserData(payload: {
    transaction_id: string;
  }): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.POST,
        ENDPOINTS.GET_USER_DATA,
        payload,
        { useToken: true, isEncrypted: true },
      );
      return response;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data).message);
      throw error;
    }
  }

  async generateAadharQrVerification(payload: {
    face_verification: 0 | 1;
    adhar_user_type: "GUEST" | "HOTEL_OWNER" | "HOTEL_MANAGER";
  }): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.POST,
        ENDPOINTS.GENERATE_AADHAR_QR_VERIFICATION,
        payload,
        { useToken: true, isEncrypted: true },
      );
      return response;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data).message);
      throw error;
    }
  }

  async getDocumentTypes(): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.GET,
        ENDPOINTS.GET_DOCUMENT_TYPES,
        null,
        { useToken: true, isEncrypted: true },
      );
      return response;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data).message);
      throw error;
    }
  }

  async guestCheckIn(
    payload: GuestCheckInPayload,
  ): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.POST,
        ENDPOINTS.GUEST_CHECK_IN,
        payload,
        { useToken: true, isEncrypted: true },
      );
      return response;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data).message);
      throw error;
    }
  }

  async uploadDocument(
    file: File,
    documentType: string,
  ): Promise<ApiResponse<any> | undefined> {
    try {
      const formData = new FormData();
      formData.append("file_name", file);

      const url = `${ENDPOINTS.UPLOAD_IMAGE}?document_type=${documentType}`;

      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.POST,
        url,
        formData,
        {
          useToken: true,
          isEncrypted: false,
          isMultipart: true,
        },
      );
      return response;
    } catch (error) {
      // const errorMessage = (error as any)?.response?.data
      //   ? decryptResponse((error as any).response.data)?.message ||
      //     "Upload failed"
      //   : (error as Error)?.message || "Upload failed";
      // toast.error(errorMessage);
      throw error;
    }
  }

  async getCountries(): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.GET,
        ENDPOINTS.GET_COUNTRIES,
        null,
        { useToken: true, isEncrypted: true },
      );
      return response;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data).message);
      throw error;
    }
  }
  async completeProfile(payload: any): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.POST,
        ENDPOINTS.HOTEL_COMPLETE_PROFILE,
        payload,
        { useToken: true, isEncrypted: true },
      );
      return response;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data).message);
      throw error;
    }
  }

  async addManualGuest(payload: any): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.POST,
        ENDPOINTS.ADD_MANUAL_GUEST,
        payload,
        { useToken: true, isEncrypted: true },
      );
      return response;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data).message);
      throw error;
    }
  }

  async getPendingCheckouts(
    payload: GetPendingCheckoutsPayload,
  ): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.POST,
        ENDPOINTS.GET_PENDING_CHECKOUTS,
        payload,
        { useToken: true, isEncrypted: true },
      );
      return response;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data).message);
      throw error;
    }
  }

  async getGuestListing(
    payload: GetGuestListingPayload,
  ): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.POST,
        ENDPOINTS.GUEST_LISTING,
        payload,
        { useToken: true, isEncrypted: true },
      );
      return response;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data).message);
      throw error;
    }
  }

  async getGuestDetails(payload: {
    guest_id: number;
    hotel_id?: number | string;
  }): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.POST,
        ENDPOINTS.GUEST_DETAILS,
        payload,
        { useToken: true, isEncrypted: true },
      );
      return response;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data).message);
      throw error;
    }
  }

  async checkoutGuest(payload: {
    booking_id: number;
  }): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.POST,
        ENDPOINTS.CHECKOUT_GUEST,
        payload,
        { useToken: true, isEncrypted: true },
      );
      return response;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data).message);
      throw error;
    }
  }

  async deleteGuests(payload: {
    guest_ids: number[];
  }): Promise<ApiResponse<any> | undefined> {
    try {
      // Assuming endpoint is ENDPOINTS.DELETE_GUESTS (need to add this)
      // If assumed endpoint is /hotel/deleteGuest, I should add it to ENDPOINTS first.
      // But for now I will use the ENDPOINTS.DELETE_GUEST that I will add.
      toast.info("Delete functionality requires API implementation.");
      return undefined;
      // const response = await serviceAdapter<ApiResponse<any>>(
      //   API_METHODS.POST,
      //   ENDPOINTS.DELETE_GUEST,
      //   payload,
      //   { useToken: true, isEncrypted: true },
      // );
      // return response;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data).message);
      throw error;
    }
  }

  async getDashboardCounts(
    payload: any,
    type: "HOTEL" | "POLICE" | "ADMIN",
  ): Promise<ApiResponse<any> | undefined> {
    try {
      const response = await serviceAdapter<ApiResponse<any>>(
        API_METHODS.POST,
        ENDPOINTS.GET_DASHBOARD_COUNTS,
        payload,
        { useToken: true, isEncrypted: true, type },
      );
      return response;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data).message);
      throw error;
    }
  }
}

export default new HotelService();
