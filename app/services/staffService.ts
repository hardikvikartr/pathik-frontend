import { toast } from "react-toastify";
import { decryptResponse } from "@/app/utils/encryption";
import axiosInstance from "../lib/axiosInstance";
import { Staff } from "../types";

// Toggle this to switch between Mock (localStorage) and Real API
const USE_MOCK_API = true;

class StaffService {
  // GET ALL STAFF
  async getAllStaff(): Promise<Staff[]> {
    if (USE_MOCK_API) {
      // Server-side check: LocalStorage is not available on the server
      if (typeof window === "undefined") {
        return [];
      }

      return new Promise((resolve) => {
        setTimeout(() => {
          const savedStaff = localStorage.getItem("pathikStaff");
          resolve(savedStaff ? JSON.parse(savedStaff) : []);
        }, 500); // Simulate network delay
      });
    }

    try {
      const response = await axiosInstance.get("/staff");
      return response.data;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data.message));
      throw error;
    }
  }

  // GET STAFF BY ID
  async getStaffById(id: string): Promise<Staff | null> {
    if (USE_MOCK_API) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const savedStaff = localStorage.getItem("pathikStaff");
          if (savedStaff) {
            const staffList: Staff[] = JSON.parse(savedStaff);
            const staff = staffList.find((s) => s.id === id);
            resolve(staff || null);
          } else {
            resolve(null);
          }
        }, 300);
      });
    }

    try {
      const response = await axiosInstance.get(`/staff/${id}`);
      return response.data;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data.message));
      throw error;
    }
  }

  // CREATE STAFF
  async createStaff(staff: Staff): Promise<Staff> {
    if (USE_MOCK_API) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const savedStaff = localStorage.getItem("pathikStaff");
          const staffList: Staff[] = savedStaff ? JSON.parse(savedStaff) : [];
          const newStaffList = [...staffList, staff];
          localStorage.setItem("pathikStaff", JSON.stringify(newStaffList));
          resolve(staff);
        }, 500);
      });
    }

    try {
      const response = await axiosInstance.post("/staff", staff);
      return response.data;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data.message));
      throw error;
    }
  }

  // UPDATE STAFF
  async updateStaff(id: string, staffData: Partial<Staff>): Promise<Staff> {
    if (USE_MOCK_API) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const savedStaff = localStorage.getItem("pathikStaff");
          if (!savedStaff) return reject("No staff found");

          const staffList: Staff[] = JSON.parse(savedStaff);
          const index = staffList.findIndex((s) => s.id === id);

          if (index !== -1) {
            const updatedStaff = { ...staffList[index], ...staffData };
            staffList[index] = updatedStaff;
            localStorage.setItem("pathikStaff", JSON.stringify(staffList));
            resolve(updatedStaff);
          } else {
            reject("Staff not found");
          }
        }, 500);
      });
    }

    try {
      const response = await axiosInstance.put(`/staff/${id}`, staffData);
      return response.data;
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data.message));
      throw error;
    }
  }

  // DELETE STAFF
  async deleteStaff(id: string): Promise<void> {
    if (USE_MOCK_API) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const savedStaff = localStorage.getItem("pathikStaff");
          if (savedStaff) {
            const staffList: Staff[] = JSON.parse(savedStaff);
            const filteredList = staffList.filter((s) => s.id !== id);
            localStorage.setItem("pathikStaff", JSON.stringify(filteredList));
          }
          resolve();
        }, 500);
      });
    }

    try {
      await axiosInstance.delete(`/staff/${id}`);
    } catch (error) {
      toast.error(decryptResponse((error as any).response.data.message));
      throw error;
    }
  }
}

export const staffService = new StaffService();
