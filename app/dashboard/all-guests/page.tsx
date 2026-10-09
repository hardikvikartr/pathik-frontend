"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePermission } from "../../hooks/usePermission";
import { toast } from "react-toastify";
import { Guest } from "@/app/types";
import { useAuth } from "@/app/context/AuthContext";
import adminService, {
  AdminSearchPayload,
} from "@/app/services/admin/adminService";
import Loader from "@/app/components/Loader";
import Pagination from "@/app/components/Pagination";
import { encryptId } from "@/app/utils/encryption";

export default function AllGuestsPage() {
  const router = useRouter();
  const { checkPermission } = usePermission();

  // State
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Guests per page
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch Data from API
  const fetchGuests = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      if (user.role === "SUPER_ADMIN" || user.role === "POLICE_STATION") {
        // ADMIN FLOW
        const payload: AdminSearchPayload = {
          page: currentPage,
          record_count: itemsPerPage,
        };
        const response = await adminService.searchGuests(payload);
        // console.log("response", response);
        if (response && response.code === 200 && response.data) {
          const apiData = Array.isArray(response.data.result)
            ? response.data.result
            : [];
          // console.log("apiData", apiData);
          const mappedGuests: Guest[] = apiData.map((g: any) => ({
            id: g.guest_id || g.id,
            firstName: g.first_name || g?.resident_name?.split(" ")[0] || "",
            lastName: g.last_name || g?.resident_name?.split(" ")[2] || "",
            middleName: g.middle_name || g?.resident_name?.split(" ")[1] || "",
            email: g.email || "",
            mobileNo: g.mobile || "",
            status: g.booking_status || "active",
            checkInDate: g.check_in_date || "",
            checkOutDate: g.check_out_date || "",
            profileImage: g.profile_image || "",
            checkInType: g.guest_check_in_type || "-",
            hotelName: g.hotel_name || "-",
            hotelId: g.hotel_id,
          }));

          setGuests(mappedGuests);
          setTotalRecords(response.data.totalRecords || mappedGuests.length);
        }
      } else {
        // Fallback or Redirect if accessed by non-admin (Should be protected by middleware/layout but good safety)
        toast.error("Access Denied");
        router.push("/dashboard");
      }
    } catch (error) {
      // Error handled by service toast usually
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [user, currentPage, searchTerm]);

  // Pagination
  const paginatedGuests = guests;
  const totalPages = Math.ceil(totalRecords / itemsPerPage);

  if (
    !user ||
    (user.role !== "SUPER_ADMIN" && user.role !== "POLICE_STATION")
  ) {
    return <div className="p-8 text-center text-gray-500">Access Denied</div>;
  }

  return (
    <>
      <div className="bg-white rounded-xl p-5 mb-6 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-pathik-text-dark m-0">
            All Guests
          </h1>
          <span className="bg-pathik-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
            {totalRecords} Guests
          </span>
        </div>
      </div>

      {/* Table View (Flat) */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader message="Fetching guests..." />
        </div>
      ) : (
        viewMode === "table" &&
        guests.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-pathik-border overflow-hidden animate-[fadeIn_0.3s_ease]">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse m-0 text-left min-w-[1000px]">
                <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500 tracking-wider">
                  <tr>
                    <th className="p-4 border-b border-pathik-border">
                      Guest Name
                    </th>
                    <th className="p-4 border-b border-pathik-border">
                      Hotel Name
                    </th>
                    <th className="p-4 border-b border-pathik-border text-center">
                      Mobile
                    </th>
                    <th className="p-4 border-b border-pathik-border text-center">
                      Check In Type
                    </th>
                    <th className="p-4 border-b border-pathik-border text-center">
                      Status
                    </th>
                    <th className="p-4 border-b border-pathik-border text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pathik-border">
                  {paginatedGuests.map((guest) => {
                    const fullName = `${guest.firstName} ${guest.middleName || ""} ${guest.lastName}`;

                    return (
                      <tr
                        key={guest.id}
                        className={`transition-all duration-200 hover:bg-gray-50`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {guest.profileImage ? (
                              <div className="w-18 h-18 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                <img
                                  src={guest.profileImage}
                                  alt={fullName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 bg-gray-400`}
                              >
                                {guest.firstName?.[0]}
                                {guest.lastName?.[0]}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <div className="font-semibold text-pathik-text-dark text-sm">
                                {fullName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-pathik-text-dark">
                          {guest.hotelName}
                        </td>
                        <td className="p-4 text-sm text-pathik-text-dark text-center">
                          {guest.mobileNo}
                        </td>
                        <td className="p-4 text-sm text-pathik-text-dark text-center">
                          {guest.checkInType}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${
                              guest.status === "active" ||
                              !guest.status ||
                              guest.status === "CONFIRMED" ||
                              guest.status === "CHECKED_IN"
                                ? "bg-green-100 text-green-700"
                                : guest.status === "checked-out" ||
                                    guest.status === "CHECKED_OUT"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {guest.status?.replace("_", " ") || "Active"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                router.push(
                                  `/dashboard/all-guests/${encryptId(guest.id)}?hotel_id=${encryptId(guest.hotelId)}`,
                                )
                              }
                              className="text-gray-400 hover:text-pathik-primary hover:bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center transition-all ml-auto"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Empty State */}
      {!isLoading && guests.length === 0 && (
        <div className="text-center py-12 px-8 bg-white rounded-xl shadow-sm">
          <div className="w-[100px] h-[100px] bg-pathik-bg-light rounded-full flex items-center justify-center mx-auto mb-6 text-pathik-text-light text-4xl">
            <i className="fas fa-users"></i>
          </div>
          <h2 className="text-xl font-bold text-pathik-text-dark mb-2">
            No Guests Found
          </h2>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && guests.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalRecords}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </>
  );
}
