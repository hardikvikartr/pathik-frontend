"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { PoliceStation } from "../../types";
import PoliceTable from "./PoliceTable";
import Pagination from "@/app/components/Pagination";
import policeStationService from "../../services/policeStation/policeStationService";
import Loader from "@/app/components/Loader";

export default function PoliceStationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stations, setStations] = useState<PoliceStation[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;

  // Redirect if not Super Admin
  useEffect(() => {
    if (user && user.role !== "SUPER_ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Fetch police stations from API
  const fetchPoliceStations = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await policeStationService.getPoliceStationList({
        page: page,
        record_count: itemsPerPage,
      });

      if (response && response.data) {
        const apiData = Array.isArray(response.data.data) ? response.data.data : [];

        const mappedStations: PoliceStation[] = apiData.map((station: any) => ({
          id: station.id || station.station_id || "",
          district: station.district || "",
          name: station.police_station || station.station_name || "",
          sector: station.sector || "",
          zone: station.zone || "",
          division: station.division || "",
          email: station.email || "",
          mobile: station.mobile || station.phone || "",
          createdAt: station.created_at || station.createdAt || new Date().toISOString(),
          roleId: station.role_id || station.roleId || "",
          status: station.status === 1 || station.is_active ? "active" : "inactive",
          isDeleted: station.is_deleted || false,
        }));

        setStations(mappedStations);
        setTotalItems((response as any)?.data?.totalRecords || mappedStations.length);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when component mounts or page changes
  useEffect(() => {
    if (user && user.role === "SUPER_ADMIN") {
      fetchPoliceStations(currentPage);
    }
  }, [user, currentPage]);

  // ✅ UPDATED - Call API to update status
  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus: "active" | "inactive" = currentStatus === "active" ? "inactive" : "active";
    const isActive = newStatus === "active";

    try {
      // Call API to update status
      const response = await policeStationService.changePoliceStationStatus(
        parseInt(id), // Convert string ID to number
        isActive
      );

      if (response && response.data) {
        // Update local state on success
        const updated = stations.map((s: PoliceStation) =>
          s.id === id ? { ...s, status: newStatus } : s
        );
        setStations(updated);

        toast.success(
          `Police station ${newStatus === "active" ? "activated" : "deactivated"} successfully`
        );
      }
    } catch (error) {
      toast.error("Failed to update police station status");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!user || user.role !== "SUPER_ADMIN") return null;

  return (
    <>
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm flex md:flex-row flex-col justify-between md:items-center items-start gap-y-2 animate-[fadeInDown_0.5s_ease-out]">
        <div>
          <h1 className="text-2xl font-bold text-pathik-text-dark mb-1">
            Police Stations
          </h1>
          <p className="text-pathik-text-light text-sm">
            Manage and onboard police stations
          </p>
        </div>
        <Link
          href="/dashboard/police-stations/add"
          className="bg-linear-to-r from-pathik-primary to-pathik-secondary text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex items-center gap-2 no-underline"
        >
          <i className="fas fa-plus"></i>
          Onboard Police Station
        </Link>
      </div>

      {isLoading ? (
        <Loader message="Loading police stations..." />
      ) : (
        <>
          <PoliceTable
            stations={stations}
            onStatusToggle={handleStatusToggle}
          />

          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </>
  );
}