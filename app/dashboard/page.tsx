"use client";

import { useState, useEffect } from "react";
import DashboardChart from "@/app/components/charts/DashboardChart";
import Image from "next/image";
import authService from "@/app/services/auth/authService";
import hotelService from "@/app/services/hotel/hotelService";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [stats, setStats] = useState({
    totalGuests: 0,
    totalHotels: 0,
    totalCheckIns: 0,
    pendingCheckouts: 0,
  });
  const { user, setUser } = useAuth()

  useEffect(() => {
    // Check for profile completion and dashboard counts
    const fetchData = async () => {
      if (user?.role) {
        let apiRole: 'HOTEL' | 'POLICE' | 'ADMIN' = 'HOTEL';
        if (user.role === 'SUPER_ADMIN') apiRole = 'ADMIN';
        if (user.role === 'POLICE_STATION') apiRole = 'POLICE';

        try {
          // Fetch profile for HOTEL role
          const profileResponse = await authService.getCurrentUser(apiRole);
          if (profileResponse?.code === 200) {
            setUser({ ...user, ...profileResponse?.data })
            if (user.role === 'HOTEL' && profileResponse?.data?.is_profile_complete == 0) {
              setShowProfileModal(true);
            }
          }

          // Fetch dashboard counts
          const countsResponse = await hotelService.getDashboardCounts({}, apiRole);
          if (countsResponse?.code === 200) {
            const data = countsResponse.data;
            setStats({
              totalGuests: data.totalGuest || 0,
              totalHotels: data.totalHotel || 0,
              totalCheckIns: data.totalCheckin || 0,
              pendingCheckouts: data.totalPendingCheckout || 0,
            });
          }
        } catch (error) {
          // console.error("Error fetching dashboard data:", error);
        }
      }
    };

    fetchData();

  }, [user?.role]);

  const openImageModal = (src: string) => {
    setSelectedImage(src);
    document.body.style.overflow = "hidden";
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = "";
  };

  const isAdmin = user?.role === 'SUPER_ADMIN';
  const isHotel = user?.role === 'HOTEL';
  const isPolice = user?.role === 'POLICE_STATION';

  return (
    <>
      {showProfileModal && (
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 bg-white p-5 rounded-xl border border-red-100 border-l-4 border-l-red-500 shadow-sm animate-[slideDown_0.3s_ease-out]">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-xl shrink-0">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-sm md:text-base">
                Profile Incomplete
              </h3>
              <p className="text-gray-500 text-xs md:text-sm mt-0.5">
                Your hotel profile is missing important compliance details.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowProfileModal(false)}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-colors flex-1 sm:flex-initial"
            >
              Dismiss
            </button>
            <button
              onClick={() => (window.location.href = "/dashboard/profile")}
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-red-500 text-white shadow-md hover:shadow-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial"
            >
              <i className="fas fa-arrow-right"></i> Complete Now
            </button>
          </div>
        </div>
      )}
      <h1 className="text-[1.8rem] font-extrabold text-pathik-text-dark mb-6 tracking-tight animate-[slideDown_0.5s_ease-out]">
        Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-[fadeIn_0.5s_ease-out_0.2s_both]">
        {/* Total Guest - Shown for Admin and Hotel */}
        {(isAdmin || isHotel) && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-pathik-primary transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[0.8rem] text-pathik-text-light uppercase tracking-wider font-semibold">
                Total Guest
              </span>
              <div className="w-[48px] h-[48px] rounded-xl flex items-center justify-center text-[1.25rem] bg-pathik-primary-light/20 text-pathik-primary">
                <i className="fas fa-users"></i>
              </div>
            </div>
            <div className="text-[2rem] font-bold text-pathik-text-dark mb-1">
              {stats.totalGuests}
            </div>
          </div>
        )}

        {/* Total Hotel - Shown for Admin and Police */}
        {(isAdmin || isPolice) && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-pathik-gold transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[0.8rem] text-pathik-text-light uppercase tracking-wider font-semibold">
                Total Hotel
              </span>
              <div className="w-[48px] h-[48px] rounded-xl flex items-center justify-center text-[1.25rem] bg-pathik-gold-light/20 text-pathik-gold">
                <i className="fas fa-hotel"></i>
              </div>
            </div>
            <div className="text-[2rem] font-bold text-pathik-text-dark mb-1">
              {stats.totalHotels}
            </div>
          </div>
        )}

        {/* Total Check-in - Shown for Admin and Hotel */}
        {(isAdmin || isHotel) && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-pathik-teal transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[0.8rem] text-pathik-text-light uppercase tracking-wider font-semibold">
                Total Check-in
              </span>
              <div className="w-[48px] h-[48px] rounded-xl flex items-center justify-center text-[1.25rem] bg-pathik-teal-light/20 text-pathik-teal">
                <i className="fas fa-sign-in-alt"></i>
              </div>
            </div>
            <div className="text-[2rem] font-bold text-pathik-text-dark mb-1">
              {stats.totalCheckIns}
            </div>
          </div>
        )}

        {/* Total Pending Checkout - Shown for Admin and Hotel */}
        {(isAdmin || isHotel) && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-pathik-coral transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[0.8rem] text-pathik-text-light uppercase tracking-wider font-semibold">
                Total Pending Checkout
              </span>
              <div className="w-[48px] h-[48px] rounded-xl flex items-center justify-center text-[1.25rem] bg-pathik-coral-light/20 text-pathik-coral">
                <i className="fas fa-clock"></i>
              </div>
            </div>
            <div className="text-[2rem] font-bold text-pathik-text-dark mb-1">
              {stats.pendingCheckouts}
            </div>
          </div>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-[fadeIn_0.5s_ease-out_0.4s_both]">
        {/* Dashboard Chart */}
        {/* <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
          <div className="p-6 border-b border-pathik-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-[1.2rem] font-bold text-pathik-text-dark m-0">
              Total Guest Entry
            </h2>
            <div
              className="flex bg-pathik-bg-light p-1 rounded-lg"
              role="group"
            >
              <button
                type="button"
                className="py-1.5 px-3 text-[0.85rem] font-medium rounded-md transition-all duration-200 bg-white text-pathik-primary shadow-sm"
              >
                7 Days
              </button>
              <button
                type="button"
                className="py-1.5 px-3 text-[0.85rem] font-medium rounded-md transition-all duration-200 text-pathik-text-light hover:text-pathik-text-dark"
              >
                30 Days
              </button>
              <button
                type="button"
                className="py-1.5 px-3 text-[0.85rem] font-medium rounded-md transition-all duration-200 text-pathik-text-light hover:text-pathik-text-dark"
              >
                90 Days
              </button>
            </div>
          </div>
          <div className="p-6 relative text-black h-[400px]">
            <DashboardChart />
          </div>
        </div> */}

        {/* Notifications */}
        {/* <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col h-full max-h-[500px]">
          <div className="p-6 border-b border-pathik-border flex justify-between items-center sticky top-0 bg-white z-10">
            <h2 className="text-[1.2rem] font-bold text-pathik-text-dark m-0">
              Notifications
            </h2>
            <span className="py-1 px-2.5 rounded-full bg-pathik-primary text-white text-[0.75rem] font-medium">
              3
            </span>
          </div>

          <div className="overflow-y-auto p-4 flex-1">
            <div className="p-4 rounded-xl mb-3 hover:bg-pathik-bg-light transition-colors duration-200 border-l-4 border-pathik-primary bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-1 font-semibold text-pathik-text-dark text-[0.95rem]">
                <i className="fas fa-bell text-pathik-primary"></i>
                New Booking Received
              </div>
              <div className="text-[0.85rem] text-pathik-text-light pl-6">
                Guest John Smith has made a new booking for Grand Plaza Hotel
              </div>
            </div>

            <div className="p-4 rounded-xl mb-3 hover:bg-pathik-bg-light transition-colors duration-200 border-l-4 border-pathik-teal bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-1 font-semibold text-pathik-text-dark text-[0.95rem]">
                <i className="fas fa-check-circle text-pathik-teal"></i>
                Check-in Completed
              </div>
              <div className="text-[0.85rem] text-pathik-text-light pl-6">
                Guest Emily Johnson has checked in to Ocean View Resort
              </div>
            </div>

            <div className="p-4 rounded-xl mb-3 hover:bg-pathik-bg-light transition-colors duration-200 border-l-4 border-pathik-gold bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-1 font-semibold text-pathik-text-dark text-[0.95rem]">
                <i className="fas fa-exclamation-triangle text-pathik-gold"></i>
                Pending Checkout
              </div>
              <div className="text-[0.85rem] text-pathik-text-light pl-6">
                5 guests have pending checkouts today
              </div>
            </div>

            <div className="p-4 rounded-xl mb-3 hover:bg-pathik-bg-light transition-colors duration-200 border-l-4 border-pathik-primary-light bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-1 font-semibold text-pathik-text-dark text-[0.95rem]">
                <i className="fas fa-info-circle text-pathik-primary-light"></i>
                System Update
              </div>
              <div className="text-[0.85rem] text-pathik-text-light pl-6">
                New features have been added to the dashboard
              </div>
            </div>

            <div className="p-4 rounded-xl mb-3 hover:bg-pathik-bg-light transition-colors duration-200 border-l-4 border-pathik-secondary bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-1 font-semibold text-pathik-text-dark text-[0.95rem]">
                <i className="fas fa-image text-pathik-secondary"></i>
                Document Received
              </div>
              <div className="text-[0.85rem] text-pathik-text-light pl-6 mb-2">
                Guest identification document has been uploaded
              </div>
              <div
                className="ml-6 w-[200px] h-[120px] rounded-lg overflow-hidden border border-pathik-border cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
                onClick={() =>
                  openImageModal("/assets/images/cartoon-ai-robot-scene.jpg")
                }
              >
                <img
                  src="/assets/images/cartoon-ai-robot-scene.jpg"
                  alt="Notification Image"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div> */}
      </div>

      {/* Image Zoom Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-10000 bg-black/90 flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]"
          onClick={closeImageModal}
        >
          <span
            className="absolute top-8 right-8 text-white text-[3rem] cursor-pointer hover:text-pathik-gold transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              closeImageModal();
            }}
          >
            &times;
          </span>
          <img
            className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl animate-[zoomIn_0.3s_ease-out]"
            src={selectedImage}
            alt="Zoomed Image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      {/* Dev Tool: Reset Profile Compliance */}
      {/* <button
        onClick={() => {
          const hotels = JSON.parse(
            localStorage.getItem("pathikHotels") || "[]",
          );
          if (hotels.length > 0) {
            hotels[0].compliance = {
              ...hotels[0].compliance,
              isProfileComplete: false,
            };
            localStorage.setItem("pathikHotels", JSON.stringify(hotels));
            window.location.reload();
          }
        }}
        className="fixed bottom-4 right-4 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-50 hover:opacity-100 z-9999 transition-opacity font-mono"
        title="Reset Profile Compliance State"
      >
        <i className="fas fa-undo mr-2"></i>Reset Compliance
      </button> */}
    </>
  );
}
 