"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Modal from "../../components/Modal";
import { toast } from "react-toastify";
import { Hotel } from "../../types";
import { usePermission } from "../../hooks/usePermission";
import HotelsTable from "./HotelsTable";
import Pagination from "@/app/components/Pagination";
import hotelService from "@/app/services/hotel/hotelService";
import Loader from "@/app/components/Loader";

export default function HotelsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { checkPermission } = usePermission();

  // State
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Redirect if not Police Station
  useEffect(() => {
    if (user && user.role !== "POLICE_STATION" && user.role !== "SUPER_ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  const fetchHotels = async () => {
    try {
      setIsLoading(true);
      const payload = {
        page: currentPage,
        record_count: itemsPerPage,
      };

      const response = await hotelService.getHotels(payload);
      if (response && response.data) {
        const apiData = Array.isArray(response.data) ? response.data : (response.data as any).data || [];
        const mappedHotels: Hotel[] = apiData.map((h: any) => ({  
          id: h.id || "",
          hotel_name: h.hotel_name || "",
          address: h.address || "",
          owner_name: h.owner_name || "",
          owner_phone: h.owner_phone?.toString() || "",
          owner_email: h.owner_email || "",
          accommodation_type: h.accommodation_type || "HOTEL",
          status: (h.status === 1 || h.status === 'active') ? 'active' : 'pending',
        }));

        setHotels(mappedHotels);
        const total = (response as any).data.totalRecords || (response as any).total || mappedHotels.length;
        setTotalRecords(total);
      }
    } catch (error) {
      toast.error("Failed to fetch hotels");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [currentPage]);

  const handleCreate = () => {
    checkPermission("create_hotel", () => setIsTypeModalOpen(true));
  };

  const handleTypeSelect = (typeId: number) => {
    setIsTypeModalOpen(false);
    router.push(`/dashboard/hotels/onboard?type=${typeId}`);
  };

  const handleView = (id: string) => {
    checkPermission("read_hotel", () => {
      router.push(`/dashboard/hotels/${id}`);
    });
  };

  const handleEdit = (id: string) => {
    checkPermission("update_hotel", () => {
      router.push(`/dashboard/hotels/${id}/edit`);
    });
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus: "active" | "pending" = currentStatus === "active" ? "pending" : "active";
    const isActive = newStatus === "active";

    try {
      const response = await hotelService.changeHotelStatus({
        hotel_id: parseInt(id),
        is_active: isActive,
      });

      if (response && response.code === 200) {
        const updated = hotels.map((h: Hotel) =>
          h.id === id ? { ...h, status: newStatus } : h
        );
        setHotels(updated);

        toast.success(
          `Hotel ${newStatus === "active" ? "activated" : "deactivated"} successfully`
        );
      }
    } catch (error) {
      toast.error("Failed to update hotel status");
    }
  };

  if (!user || (user.role !== "POLICE_STATION" && user.role !== "SUPER_ADMIN")) return null;

  return (
    <>
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm flex md:flex-row flex-col gap-y-2 justify-between items-center animate-[fadeInDown_0.5s_ease-out]">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-pathik-text-dark mb-1">
            Hotels Under Jurisdiction
          </h1>
          <p className="text-pathik-text-light text-sm">
            Manage hotels in {user.name} area
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-linear-to-r from-pathik-primary to-pathik-secondary text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          Onboard New Hotel
        </button>
      </div>

      {/* Type Selection Modal */}
      <Modal
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        title="Select Accommodation Type"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleTypeSelect(1)}
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-100 rounded-xl hover:border-pathik-primary hover:bg-blue-50 transition-all gap-4 group"
          >
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              <i className="fas fa-hotel"></i>
            </div>
            <span className="font-bold text-gray-700 group-hover:text-pathik-primary">
              Hotel
            </span>
          </button>
          <button
            onClick={() => handleTypeSelect(2)}
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-100 rounded-xl hover:border-pathik-primary hover:bg-blue-50 transition-all gap-4 group"
          >
            <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              <i className="fas fa-home"></i>
            </div>
            <span className="font-bold text-gray-700 group-hover:text-pathik-primary">
              PG / Guest House
            </span>
          </button>
          <button
            onClick={() => handleTypeSelect(3)}
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-100 rounded-xl hover:border-pathik-primary hover:bg-blue-50 transition-all gap-4 group"
          >
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              <i className="fas fa-tree"></i>
            </div>
            <span className="font-bold text-gray-700 group-hover:text-pathik-primary">
              Home Stay
            </span>
          </button>
        </div>
      </Modal>

      {isLoading ? (
        <Loader message="Loading hotels..." />
      ) : (
        <>
          <HotelsTable
            hotels={hotels}
            onView={handleView}
            onEdit={handleEdit}
            onStatusToggle={handleStatusToggle}
          />

          <Pagination
            currentPage={currentPage}
            totalItems={totalRecords}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </>
  );
}