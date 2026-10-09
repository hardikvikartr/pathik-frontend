"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePermission } from "../../hooks/usePermission";
import { toast } from "react-toastify";
import { Guest, Booking } from "@/app/types";
import { useAuth } from "@/app/context/AuthContext";
import hotelService from "@/app/services/hotel/hotelService";
import Loader from "@/app/components/Loader";
import Pagination from "@/app/components/Pagination";

interface PendingCheckoutItem {
  bookingId: number;
  checkInDate: string;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  guestId: number;
  mobile: string;
  noOfAdults: number;
  noOfChildren: number;
  roomNumber: string;
  email: string | null;
  isOverdue: boolean;
  isToday: boolean;
  daysRemaining: number;
  profileImage: string;
}

interface ToastState {
  active: boolean;
  type: string; // success, error, info
  icon: string;
  title: string;
  message: string;
}

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

export default function PendingCheckoutPage() {
  const router = useRouter();
  const { checkPermission } = usePermission();

  const [pendingCheckouts, setPendingCheckouts] = useState<
    PendingCheckoutItem[]
  >([]);
  const [filteredCheckouts, setFilteredCheckouts] = useState<
    PendingCheckoutItem[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 10;

  // UI State
  const [toastState, setToast] = useState<ToastState>({
    active: false,
    type: "",
    icon: "",
    title: "",
    message: "",
  });
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

  // Load Data
  const fetchPendingCheckouts = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const hotel_id = (user as any).id || 1;
      const payload = {
        hotel_id: Number(hotel_id),
        page: currentPage,
        record_count: itemsPerPage,
      };

      const response = await hotelService.getPendingCheckouts(payload);
      if (response && response.code === 200 && response.data) {
        // console.log(response);
        const apiData = Array.isArray(response.data?.result)
          ? response.data?.result
          : (response.data as any).data || [];
        const items: PendingCheckoutItem[] = apiData.map((item: any) => {
          return {
            bookingId: Number(item.booking_id),
            checkInDate: item.check_in_date,
            firstName:
              item.guest_data[0].first_name ||
              item?.guest_data?.[0]?.resident_name?.split(" ")[0],
            lastName:
              item.guest_data[0].last_name ||
              item?.guest_data?.[0]?.resident_name?.split(" ")[2],
            guestId: Number(item.guest_data[0].guest_id),
            mobile: item.guest_data[0].mobile,
            noOfAdults: item.no_of_adults,
            noOfChildren: item.no_of_children,
            roomNumber: String(item.room_no),
            email: item.email,
            profileImage: item?.guest_data?.[0]?.profile_image || "",
            middleName:
              item?.guest_data?.[0]?.resident_name?.split(" ")[1] || "",
          };
        });

        setPendingCheckouts(items);
        setFilteredCheckouts(items);

        const total =
          (response as any).data.totalRecords ||
          (response as any).total ||
          items.length;
        setTotalRecords(total);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCheckouts();
  }, [user, currentPage]);

  // Search Filter
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCheckouts(pendingCheckouts);
      return;
    }

    const lower = searchTerm.toLowerCase();
    const filtered = pendingCheckouts.filter(
      (item) =>
        item.roomNumber.toLowerCase().includes(lower) ||
        (item.firstName && item.firstName.toLowerCase().includes(lower)) ||
        (item.lastName && item.lastName.toLowerCase().includes(lower)) ||
        (item.mobile && item.mobile.includes(lower)),
    );
    setFilteredCheckouts(filtered);
  }, [searchTerm, pendingCheckouts]);

  const showToast = (
    type: string,
    icon: string,
    title: string,
    message: string,
  ) => {
    setToast({ active: true, type, icon, title, message });
    setTimeout(() => setToast((prev) => ({ ...prev, active: false })), 3000);
  };

  const handleCheckout = (item: PendingCheckoutItem) => {
    setConfirmModal({
      active: true,
      type: "warning",
      icon: "fa-door-open",
      title: "Checkout Room",
      message: `Are you sure you want to checkout Room ${item.roomNumber} for ${item.firstName || "Guest"} ${item.middleName || ""} ${item.lastName || ""}?`,
      confirmType: "primary",
      confirmIcon: "fa-check",
      confirmText: "Process Checkout",
      onConfirm: async () => {
        try {
          setIsLoading(true);
          const response = await hotelService.checkoutGuest({
            booking_id: item.bookingId,
          });

          if (response && response.code === 200) {
            showToast(
              "success",
              "fa-check-circle",
              "Checkout Successful",
              `Room ${item.roomNumber} has been checked out`,
            );
            // Refresh list
            fetchPendingCheckouts();
          } else {
            // Toast handled by service usually, but fallback here
          }
        } catch (error) {
        } finally {
          setIsLoading(false);
          setConfirmModal((prev) => ({ ...prev, active: false }));
        }
      },
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-9xl mx-auto animate-[fadeIn_0.5s_ease-out] min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-pathik-text-dark m-0">
            Pending Checkouts
          </h1>
          <p className="text-pathik-text-light text-sm mt-1">
            Manage active bookings and process checkouts
          </p>
        </div>
      </div>

      {/* Content */}
      {isLoading && pendingCheckouts.length === 0 ? (
        <div className="py-20 flex justify-center">
          <Loader message="Fetching pending checkouts..." />
        </div>
      ) : filteredCheckouts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-pathik-border">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 text-3xl">
            <i className="fas fa-clipboard-check"></i>
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">
            No Pending Checkouts
          </h3>
          <p className="text-gray-400">
            All caught up! No active checkouts match your criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-pathik-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4 border-b border-pathik-border text-center w-24">
                    Room
                  </th>
                  <th className="p-4 border-b border-pathik-border">
                    Guest Details
                  </th>
                  <th className="p-4 border-b border-pathik-border text-center">
                    Contact
                  </th>
                  <th className="p-4 border-b border-pathik-border text-center">
                    Occupancy
                  </th>
                  <th className="p-4 border-b border-pathik-border text-center">
                    Check-In Date
                  </th>
                  <th className="p-4 border-b border-pathik-border text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pathik-border">
                {filteredCheckouts.map((item) => (
                  <tr
                    key={item.bookingId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 text-center">
                      <span className="inline-block px-3 py-1 bg-pathik-primary/10 text-pathik-primary rounded-lg font-bold text-sm">
                        {item.roomNumber}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-18 h-18 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden text-gray-500 font-bold shrink-0">
                          <img
                            className="w-full h-full object-cover"
                            src={item.profileImage}
                            alt=""
                          />
                        </div>
                        <div>
                          <div className="font-bold text-pathik-text-dark">
                            {item.firstName} {item.middleName} {item.lastName}
                          </div>
                          {/* <div className="text-xs text-gray-400">
                            ID: {item.firstName}
                          </div> */}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center text-sm text-pathik-text-medium">
                      <div className="flex flex-col gap-1">
                        <span>{item.mobile}</span>
                        {/* {item.email && <span className="text-xs text-gray-400">{item.email}</span>} */}
                      </div>
                    </td>
                    <td className="p-4 text-center text-sm text-pathik-text-medium">
                      {item.noOfAdults} Adult(s), {item.noOfChildren} Child(ren)
                    </td>
                    <td className="p-4 text-center text-sm text-pathik-text-medium">
                      {formatDate(item.checkInDate)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() =>
                          checkPermission("update_guest", () =>
                            handleCheckout(item),
                          )
                        }
                        className="py-2 px-4 bg-white border border-pathik-primary text-pathik-primary rounded-lg text-sm font-bold shadow-xs hover:bg-pathik-primary hover:text-white transition-all flex items-center gap-2 ml-auto"
                        disabled={isLoading}
                      >
                        <i className="fas fa-sign-out-alt"></i> Checkout
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoading && filteredCheckouts.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalRecords}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Custom Toast */}
      {toastState.active && (
        <div className="fixed bottom-6 right-6 z-9999 animate-[slideInRight_0.3s_ease]">
          <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-pathik-primary flex items-start gap-4 min-w-[320px]">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                toastState.type === "success"
                  ? "text-green-500 bg-green-50"
                  : toastState.type === "error"
                    ? "text-red-500 bg-red-50"
                    : "text-blue-500 bg-blue-50"
              }`}
            >
              <i className={`fas ${toastState.icon}`}></i>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm mb-0.5">
                {toastState.title}
              </h4>
              <p className="text-sm text-gray-500 m-0">{toastState.message}</p>
            </div>
          </div>
        </div>
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
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Processing...
                  </>
                ) : (
                  <>
                    <i className={`fas ${confirmModal.confirmIcon}`}></i>{" "}
                    {confirmModal.confirmText}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
