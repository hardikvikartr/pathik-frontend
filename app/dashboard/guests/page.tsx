"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePermission } from "../../hooks/usePermission";
import { toast } from "react-toastify";
import { TOAST_MESSAGES } from "../../utils/messages";
import { Guest, Booking } from "@/app/types";
import { useAuth } from "@/app/context/AuthContext";
import hotelService from "@/app/services/hotel/hotelService";
import Loader from "@/app/components/Loader";
import Pagination from "@/app/components/Pagination";
import { encryptId } from "@/app/utils/encryption";

interface ConfirmModalState {
  active: boolean;
  type: string;
  icon: string;
  title: string;
  message: string;
  confirmType: string;
  confirmIcon: string;
  confirmText: string;
  onConfirm: () => void;
}

interface GuestGroup {
  bookingId: string;
  roomNumber: string;
  primaryGuestId?: string;
  guests: Guest[];
  checkInDate: string;
  checkOutDate: string;
  status: string;
}

export default function GuestsPage() {
  const router = useRouter();
  const { checkPermission } = usePermission();

  // State
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Guests per page
  const [sortConfig, setSortConfig] = useState<{
    column: string | null;
    direction: "asc" | "desc";
  }>({ column: "checkin", direction: "desc" });
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  // UI State
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    active: false,
    type: "warning",
    icon: "",
    title: "",
    message: "",
    confirmType: "primary",
    confirmIcon: "",
    confirmText: "",
    onConfirm: () => {},
  });

  // Fetch Data from API
  const fetchGuests = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const hotel_id = (user as any).id || 1;

      const payload = {
        hotel_id: Number(hotel_id),
        page: currentPage,
        record_count: itemsPerPage,
      };
      const response = await hotelService.getGuestListing(payload);
      if (response && response.code === 200 && response.data) {
        const apiData = Array.isArray(response.data)
          ? (response.data as any).result
          : (response.data as any).result || [];
        const mappedGuests: Guest[] = apiData.map((g: any) => ({
          id: g.id,
          firstName: g.first_name || g?.resident_name?.split(" ")[0] || "",
          lastName: g.last_name || g?.resident_name?.split(" ")[2] || "",
          middleName: g.middle_name || g?.resident_name?.split(" ")[1] || "",
          email: g.email || "",
          mobileNo: g.mobile || "",
          status: g.status === "active" ? "active" : "checked-out",
          checkInDate: g.check_in_date || "",
          checkOutDate: g.check_out_date || "",
          profileImage: g.profile_image || "",
          checkInType: g.guest_check_in_type || "",
        }));

        setGuests(mappedGuests);
        const total =
          (response as any).data.totalRecords ||
          (response as any).total ||
          mappedGuests.length;
        setTotalRecords(total);
      }
    } catch (error) {
      // toast.error("Failed to load guests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [user, currentPage]);

  // Filter & Sort Guests
  const filteredGuests = useMemo(() => {
    let result = [...guests];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (guest) =>
          `${guest.firstName} ${guest.lastName}`
            .toLowerCase()
            .includes(lower) ||
          (guest.mobileNo || "").includes(lower) ||
          (guest.email || "").toLowerCase().includes(lower),
      );
    }

    if (sortConfig.column) {
      result.sort((a, b) => {
        let aVal: any = "",
          bVal: any = "";

        switch (sortConfig.column) {
          case "name":
            aVal = `${a.firstName} ${a.lastName}`.toLowerCase();
            bVal = `${b.firstName} ${b.lastName}`.toLowerCase();
            break;
          case "checkin":
            aVal = new Date(a.checkInDate || "").getTime();
            bVal = new Date(b.checkInDate || "").getTime();
            break;
          case "checkout":
            aVal = new Date(a.checkOutDate || "").getTime();
            bVal = new Date(b.checkOutDate || "").getTime();
            break;
          case "status":
            aVal = a.status || "";
            bVal = b.status || "";
            break;
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [guests, searchTerm, sortConfig]);

  // Pagination
  const paginatedGuests = filteredGuests;

  const totalPages = Math.ceil(totalRecords / itemsPerPage);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(filteredGuests.map((g) => String(g.id)));
      setSelectedGuests(newSelected);
    } else {
      setSelectedGuests(new Set());
    }
  };

  const toggleGuestSelection = (id: string | number) => {
    const idStr = String(id);
    const newSelected = new Set(selectedGuests);
    if (newSelected.has(idStr)) {
      newSelected.delete(idStr);
    } else {
      newSelected.add(idStr);
    }
    setSelectedGuests(newSelected);
  };

  const deleteGuests = () => {
    if (selectedGuests.size === 0) {
      toast.info("Please select at least one guest to delete");
      return;
    }

    setConfirmModal({
      active: true,
      type: "danger",
      icon: "fa-trash-alt",
      title: "Delete Guests",
      message: `Are you sure you want to delete ${selectedGuests.size} guest(s)? This action cannot be undone.`,
      confirmType: "danger",
      confirmIcon: "fa-trash",
      confirmText: "Delete",
      onConfirm: async () => {
        try {
          // Convert string IDs to numbers as expected by API
          const guestIds = Array.from(selectedGuests).map((id) => Number(id));

          const response = await hotelService.deleteGuests({
            guest_ids: guestIds,
          });

          if (response && response.code === 200) {
            toast.success("Guests deleted successfully");
            setSelectedGuests(new Set());
            // Refresh list
            fetchGuests();
          }
        } catch (error) {
          // console.error("Delete failed", error);
          // Toast handled by service
        } finally {
          setConfirmModal((prev) => ({ ...prev, active: false }));
        }
      },
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="bg-white rounded-xl p-5 mb-6 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-pathik-text-dark m-0">
            Guest List
          </h1>
          <span className="bg-pathik-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
            {totalRecords} Guests
          </span>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={() =>
              checkPermission("create_guest", () =>
                router.push("/dashboard/add-guest"),
              )
            }
            className="bg-linear-to-br from-pathik-primary to-pathik-secondary text-white border-none py-2.5 px-5 rounded-lg font-semibold text-sm cursor-pointer transition-all duration-300 flex items-center gap-2 shadow-sm hover:-translate-y-0.5 hover:shadow-md"
          >
            <i className="fas fa-plus"></i>
            Add Guest
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      {/* <div className="bg-white rounded-xl p-5 mb-6 shadow-sm">
        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
          <div className="flex-1 md:min-w-[300px] relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-pathik-text-light"></i>
            <input
              type="text"
              placeholder="Search by name, mobile, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2.5 px-4 pl-11 border-2 border-pathik-border rounded-lg text-sm transition-all duration-300 bg-pathik-bg-light focus:outline-none focus:border-pathik-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
            />
          </div>
        </div>
      </div> */}

      {/* Bulk Actions */}
      {selectedGuests.size > 0 && (
        <div className="bg-white rounded-xl p-3 px-5 mb-6 shadow-sm flex items-center justify-between gap-4 animate-[fadeIn_0.3s_ease]">
          <div className="font-semibold text-pathik-text-dark text-sm">
            {selectedGuests.size} guest{selectedGuests.size !== 1 ? "s" : ""}{" "}
            selected
          </div>
          {/* <button
            className="py-1.5 px-3 border-none rounded-md text-xs font-semibold cursor-pointer transition-all duration-300 inline-flex items-center gap-1.5 bg-pathik-coral text-white hover:bg-red-600 hover:-translate-y-px"
            onClick={() => checkPermission("delete_guest", deleteGuests)}
          >
            <i className="fas fa-trash"></i>
            Delete Selected
          </button> */}
        </div>
      )}

      {/* Table View (Flat) */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader message="Fetching guests..." />
        </div>
      ) : (
        viewMode === "table" &&
        filteredGuests.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-pathik-border overflow-hidden animate-[fadeIn_0.3s_ease]">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse m-0 text-left min-w-[1000px]">
                <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500 tracking-wider">
                  <tr>
                    <th className="p-4 pl-6 border-b border-pathik-border w-12">
                      <input
                        type="checkbox"
                        className="w-[16px] h-[16px] cursor-pointer accent-pathik-primary"
                        onChange={(e) => toggleSelectAll(e.target.checked)}
                        checked={
                          filteredGuests.length > 0 &&
                          filteredGuests.every((g) =>
                            selectedGuests.has(String(g.id)),
                          )
                        }
                      />
                    </th>
                    <th className="p-4 border-b border-pathik-border">
                      Guest Name
                    </th>
                    {/* <th className="p-4 border-b border-pathik-border">
                      Contact
                    </th> */}
                    <th className="p-4 border-b border-pathik-border text-center">
                      Mobile
                    </th>
                    {/* <th className="p-4 border-b border-pathik-border text-center">
                      Check In
                    </th>
                    <th className="p-4 border-b border-pathik-border text-center">
                      Check Out
                    </th> */}
                    <th className="p-4 border-b border-pathik-border text-center">
                      Guest Check In Type
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
                    const isSelected = selectedGuests.has(String(guest.id));

                    return (
                      <tr
                        key={guest.id}
                        className={`transition-all duration-200 hover:bg-gray-50 ${isSelected ? "bg-pathik-primary/5" : ""}`}
                      >
                        <td className="p-4 pl-6">
                          <input
                            type="checkbox"
                            className="w-[16px] h-[16px] cursor-pointer accent-pathik-primary"
                            checked={isSelected}
                            onChange={() => toggleGuestSelection(guest.id)}
                          />
                        </td>
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
                        {/* <td className="p-4 text-sm text-pathik-text-dark">
                          {guest.email || (
                            <span className="text-gray-400 italic text-xs">
                              No Email
                            </span>
                          )}
                        </td> */}
                        <td className="p-4 text-sm text-pathik-text-dark text-center">
                          {guest.mobileNo}
                        </td>
                        {/* <td className="p-4 text-sm text-pathik-text-dark text-center">
                          {formatDate(guest.checkInDate)}
                        </td>
                        <td className="p-4 text-sm text-pathik-text-dark text-center">
                          {formatDate(guest.checkOutDate)}
                        </td> */}
                        <td className="p-4 text-sm text-pathik-text-dark text-center">
                          {guest.checkInType}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${
                              guest.status === "active" || !guest.status
                                ? "bg-green-100 text-green-700"
                                : guest.status === "checked-out"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {guest.status || "Active"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="text-gray-400 hover:text-pathik-primary hover:bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                              onClick={() =>
                                checkPermission("read_guest", () =>
                                  router.push(
                                    `/dashboard/guests/${encryptId(guest.id)}`,
                                  ),
                                )
                              }
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

      {/* Card View */}
      {viewMode === "card" && filteredGuests.length > 0 && (
        <div className="text-center py-10 text-gray-500">
          <i className="fas fa-hammer text-2xl mb-2"></i>
          <p>Card view is coming soon. Please use Table view.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredGuests.length === 0 && (
        <div className="text-center py-12 px-8 bg-white rounded-xl shadow-sm">
          <div className="w-[100px] h-[100px] bg-pathik-bg-light rounded-full flex items-center justify-center mx-auto mb-6 text-pathik-text-light text-4xl">
            <i className="fas fa-users"></i>
          </div>
          <h2 className="text-xl font-bold text-pathik-text-dark mb-2">
            No Guests Found
          </h2>
          <p className="text-pathik-text-light mb-6">
            Start by adding your first guest to the system.
          </p>
          <Link href="/dashboard/add-guest">
            <button
              onClick={(e) => {
                e.preventDefault();
                checkPermission("create_guest", () =>
                  router.push("/dashboard/add-guest"),
                );
              }}
              className="bg-linear-to-br from-pathik-primary to-pathik-secondary text-white border-none py-2.5 px-5 rounded-lg font-semibold text-sm cursor-pointer transition-all duration-300 flex items-center gap-2 shadow-sm hover:-translate-y-0.5 hover:shadow-md mx-auto"
            >
              <i className="fas fa-plus"></i>
              Add Guest
            </button>
          </Link>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && filteredGuests.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalRecords}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Confirm Modal */}
      {confirmModal.active && (
        <div
          className="fixed inset-0 z-10000 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease]"
          onClick={() =>
            setConfirmModal((prev) => ({ ...prev, active: false }))
          }
        >
          <div
            className="bg-white rounded-[20px] p-0 max-w-[480px] w-[90%] shadow-2xl animate-[slideUp_0.3s_ease] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 pb-4 text-center border-b border-pathik-bg-light">
              <div
                className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-[2.5rem] text-white animate-[pulse_0.6s_ease] ${
                  confirmModal.type === "danger"
                    ? "bg-linear-to-br from-pathik-coral to-red-500"
                    : confirmModal.type === "warning"
                      ? "bg-linear-to-br from-orange-400 to-orange-500"
                      : "bg-linear-to-br from-pathik-primary to-pathik-secondary"
                }`}
              >
                <i className={`fas ${confirmModal.icon}`}></i>
              </div>
              <h2 className="text-2xl font-bold text-pathik-text-dark mb-2">
                {confirmModal.title}
              </h2>
            </div>
            <div className="p-6 px-8 text-center">
              <p className="text-base text-pathik-text-medium leading-relaxed m-0">
                {confirmModal.message}
              </p>
            </div>
            <div className="p-6 px-8 pb-8 flex gap-4 justify-center">
              <button
                className="py-3 px-8 border-2 border-pathik-border bg-pathik-bg-light text-pathik-text-dark rounded-[10px] font-semibold text-[0.95rem] cursor-pointer transition-all duration-300 min-w-[120px] flex justify-center items-center gap-2 hover:bg-white hover:border-pathik-primary hover:text-pathik-primary"
                onClick={() =>
                  setConfirmModal((prev) => ({ ...prev, active: false }))
                }
              >
                <i className="fas fa-times"></i>
                Cancel
              </button>
              <button
                className={`py-3 px-8 border-none text-white rounded-[10px] font-semibold text-[0.95rem] cursor-pointer transition-all duration-300 min-w-[120px] flex justify-center items-center gap-2 shadow-sm hover:-translate-y-0.5 hover:shadow-md ${
                  confirmModal.confirmType === "danger"
                    ? "bg-linear-to-br from-pathik-coral to-red-500 shadow-red-200"
                    : "bg-linear-to-br from-pathik-primary to-pathik-secondary shadow-blue-200"
                }`}
                onClick={confirmModal.onConfirm}
              >
                <i className={`fas ${confirmModal.confirmIcon}`}></i>
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
