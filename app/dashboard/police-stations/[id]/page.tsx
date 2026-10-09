"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { PoliceStation, Hotel, Role } from "../../../types";
import policeStationService from "../../../services/policeStation/policeStationService";
import hotelService from "../../../services/hotel/hotelService";
import { toast } from "react-toastify";
import { log } from "console";
import Pagination from "@/app/components/Pagination";

export default function ViewPoliceStationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [station, setStation] = useState<PoliceStation | null>(null);
  const [associatedHotels, setAssociatedHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Pagination State for Hotels
  const [currentHotelPage, setCurrentHotelPage] = useState(1);
  const [totalHotelItems, setTotalHotelItems] = useState(0);
  const itemsPerPage = 10;

  // Redirect if not Super Admin
  useEffect(() => {
    if (user && user.role !== "SUPER_ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  // ✅ Fetch police station details from API
  useEffect(() => {
    const fetchStationDetails = async () => {
      const stationId = parseInt(id);
      if (isNaN(stationId)) {
        toast.error("Invalid Station ID");
        return;
      }

      setIsLoading(true);
      try {
        const response =
          await policeStationService.getPoliceStationDetails(stationId);

        if (response && response.data) {
          const stationData = response.data;

          // Map API response to PoliceStation type
          const mappedStation: PoliceStation = {
            id:
              stationData.id?.toString() ||
              stationData.station_id?.toString() ||
              "",
            district: stationData.district || "",
            name: stationData.name || stationData.station_name || "",
            // Use role_name from response directly
            role_name: stationData.role_name || "",
            sector: stationData.sector || "",
            zone: stationData.zone || "",
            division: stationData.division || "",
            email: stationData.email || "",
            mobile: stationData.mobile || stationData.phone || "",
            createdAt:
              stationData.created_at ||
              stationData.createdAt ||
              new Date().toISOString(),
            roleId:
              stationData.role_id?.toString() ||
              stationData.roleId?.toString() ||
              "",
            status:
              stationData.status === "active" ||
                stationData.is_active === true ||
                stationData.status === 1
                ? "active"
                : "inactive",
            isDeleted: stationData.is_deleted || false,
          };

          setStation(mappedStation);
        } else {
          toast.error("Police station not found");
          router.push("/dashboard/police-stations");
        }
      } catch (error) {
        toast.error("Failed to load police station details");
        router.push("/dashboard/police-stations");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchRegisteredHotels = async () => {
      const stationId = parseInt(id);
      if (isNaN(stationId)) return;
      const response = await policeStationService.getRegisteredHotels({
        police_station_id: stationId,
        record_count: itemsPerPage,
        page: currentHotelPage,
      });

      if (response && response.data) {
        const apiList = response.data.list || response.data.data || [];
        if (Array.isArray(apiList)) {
          const hotelsList = apiList.map(
            (h: any) =>
              ({
                id: h.id?.toString() || "",
                hotel_name: h.hotel_name || h.name || h.hotelName || "",
                email: h.email || h.hotel_email || "",
                owner_name: h.owner_name || h.ownerName || "",
                owner_email: h.owner_email || h.ownerEmail || "",
                status:
                  h.status === "active" || h.status === 1 || h.is_active
                    ? "active"
                    : "inactive",
                police_station: station?.name || "",
                address: h.address || "",
              }) as Hotel,
          );

          setAssociatedHotels(hotelsList);
          setTotalHotelItems(
            response.data.total_count ||
            response.data.total_records ||
            response.data.totalRecords ||
            hotelsList.length,
          );
        }
      } else {
        setAssociatedHotels([]);
        setTotalHotelItems(0);
      }
    };

    if (user && user.role === "SUPER_ADMIN") {
      fetchStationDetails();
      fetchRegisteredHotels();
    }
  }, [id, user, router, currentHotelPage]);

  const permissionLabels: Record<string, string> = {
    "police_station:read": "View Police Stations",
    "hotel:create": "Onboard Hotels",
    "hotel:read": "View Hotels",
    "hotel:update": "Edit Hotel Details",
    "hotel:delete": "Remove Hotels",
    "guest:read": "View Guest Lists",
  };

  if (!user || user.role !== "SUPER_ADMIN") return null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="flex flex-col items-center gap-3">
          <i className="fas fa-spinner fa-spin text-4xl text-pathik-primary"></i>
          <p className="text-pathik-text-light">
            Loading police station details...
          </p>
        </div>
      </div>
    );
  }

  if (!station) return null;

  return (
    <div className="max-w-6xl mx-auto animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/police-stations"
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-pathik-text-light hover:text-pathik-primary transition-colors"
          >
            <i className="fas fa-arrow-left"></i>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-pathik-text-dark">
              {station.name}
            </h1>
            <div className="flex items-center gap-2 text-sm text-pathik-text-light">
              <span>
                <i className="fas fa-map-marker-alt mr-1"></i>
                {station.district}
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span>ID: {station.id}</span>
            </div>
          </div>
        </div>
        <Link
          href={`/dashboard/police-stations/${station.id}/edit`}
          className="bg-pathik-bg-light text-pathik-primary border border-pathik-primary px-5 py-2.5 rounded-lg font-semibold hover:bg-pathik-primary hover:text-white transition-all duration-300 flex items-center gap-2 no-underline"
        >
          <i className="fas fa-edit"></i>
          Edit Details
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Permissions */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-pathik-text-dark mb-4 pb-2 border-b border-gray-100">
              Contact Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-uppercase text-gray-500 font-semibold tracking-wider">
                  OFFICIAL EMAIL
                </label>
                <p className="font-medium text-pathik-text-dark mt-1 flex items-center gap-2">
                  <i className="fas fa-envelope text-gray-400"></i>{" "}
                  {station.email}
                </p>
              </div>
              <div>
                <label className="text-xs text-uppercase text-gray-500 font-semibold tracking-wider">
                  CONTACT NUMBER
                </label>
                <p className="font-medium text-pathik-text-dark mt-1 flex items-center gap-2">
                  <i className="fas fa-phone text-gray-400"></i>{" "}
                  {station.mobile}
                </p>
              </div>
            </div>
          </div>

          {/* Jurisdiction Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-pathik-text-dark mb-4 pb-2 border-b border-gray-100">
              Jurisdiction
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-uppercase text-gray-500 font-semibold tracking-wider">
                    SECTOR
                  </label>
                  <p className="font-medium text-pathik-text-dark mt-1">
                    {station.sector}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-uppercase text-gray-500 font-semibold tracking-wider">
                    ZONE
                  </label>
                  <p className="font-medium text-pathik-text-dark mt-1">
                    {station.zone}
                  </p>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <i className="fas fa-building text-gray-400 w-5"></i>
                  <span className="font-semibold text-gray-700">Division:</span>
                  <span className="text-gray-600">{station.division}</span>
                </div>
              </div>
            </div>

            {/* Access Control Information */}
            <div className="md:col-span-2 mt-4 pt-6 border-t border-pathik-border">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                Access Control
              </h3>
              <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg">
                  <i className="fas fa-user-shield"></i>
                </div>
                <div>
                  <p className="text-xs text-blue-500 font-bold uppercase mb-0.5">
                    Assigned Role
                  </p>
                  <p className="font-bold text-gray-800 text-lg">
                    {(() => {
                      return station ? station.role_name : "Unknown Role";
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Associated Hotels */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-pathik-text-dark">
                Registered Hotels
              </h3>
              <span className="bg-pathik-bg-light text-pathik-primary px-3 py-1 rounded-full text-sm font-bold">
                {associatedHotels.length}
              </span>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Hotel Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {associatedHotels.map((hotel) => (
                    <tr
                      key={hotel.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-pathik-text-dark">
                          {hotel.hotel_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {hotel.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-pathik-text-medium">
                          {hotel.owner_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {hotel.owner_email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${hotel.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                        >
                          {hotel.status === "active" ? "Active" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-pathik-text-light hover:text-pathik-primary transition-colors">
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {associatedHotels.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center">
                          <i className="fas fa-hotel text-4xl mb-3 opacity-20"></i>
                          <p>No hotels registered under this station yet.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalHotelItems > 0 && (
              <div className="p-4 border-t border-gray-100">
                <Pagination
                  currentPage={currentHotelPage}
                  totalItems={totalHotelItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentHotelPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
