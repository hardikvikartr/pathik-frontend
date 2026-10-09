"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { Hotel } from "../../../types";
import hotelService from "@/app/services/hotel/hotelService";

import Loader from "@/app/components/Loader";

export default function HotelDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const { user } = useAuth();
  const [hotel, setHotel] = useState<Hotel | null>(null);

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        const response = await hotelService.getHotelDetails(params.id);
        if (response && response.data) {
          setHotel(response.data);
        }
      } catch (error) {
      }
    };

    if (params.id) {
      fetchHotelDetails();
    }
  }, [params.id, router]);

  if (!user || !hotel) {
    return <Loader message="Loading hotel details..." />;
  }
  const canEdit = user.role === 'SUPER_ADMIN' || user.permissions?.includes('update_hotel');
  const addresses = hotel.address_data && hotel.address_data.length > 0
    ? hotel.address_data.map((addr: any) => addr.location).filter(Boolean)
    : [hotel.address];

  return (
    <div className="max-w-7xl mx-auto animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-pathik-primary hover:scale-110 transition-all">
            <i className="fas fa-arrow-left"></i>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-pathik-text-dark">{hotel.hotel_name}</h1>
            <p className="text-sm text-pathik-text-light flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${hotel.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              {hotel.status === 'active' ? 'Active Hotel' : 'Pending Approval'}
            </p>
          </div>
        </div>

        {canEdit && (
          <Link
            href={`/dashboard/hotels/${hotel.id}/edit`}
            className="px-5 py-2.5 bg-pathik-primary text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 no-underline"
          >
            <i className="fas fa-edit"></i> Edit Hotel
          </Link>
        )}
      </div>

      <div className="gap-8">
        {/* Left Col: Main Info */}
        <div className="md:col-span-2 space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
              <i className="fas fa-hotel text-pathik-primary/60"></i>
              <h2 className="font-bold text-gray-800">Hotel Details</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Hotel Name</label>
                <p className="text-gray-800">{hotel.hotel_name}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Address</label>
                {addresses.length > 1 ? (
                  <ul className="space-y-2">
                    {addresses.map((addr: string, index: number) => (
                      <li key={index} className="text-gray-700 flex items-start gap-2">
                        <i className="fas fa-map-marker-alt text-xs text-gray-400 mt-1"></i>
                        <span>{addr}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-700">{addresses[0]}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Police Station</label>
                <p className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  <i className="fas fa-shield-alt text-xs"></i> {hotel.police_station}
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Created At</label>
                <p className="text-gray-700 text-sm">{new Date(hotel?.created_at || '')?.toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Status</label>
                <div className="flex gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${hotel.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {hotel.status}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${hotel.block_status === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                    {hotel.block_status || 'unblocked'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Management Info */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
              <i className="fas fa-address-book text-pathik-primary/60"></i>
              <h2 className="font-bold text-gray-800">Contact & Management</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Primary Mobile</label>
                <p className="text-gray-700 flex items-center gap-2">
                  <i className="fas fa-phone fa-xs text-gray-400"></i> {hotel.phone_no || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Email Address</label>
                <p className="text-gray-700 flex items-center gap-2">
                  <i className="fas fa-envelope fa-xs text-gray-400"></i> {hotel.email}
                </p>
              </div>
              <div className="col-span-1 md:col-span-2 border-t border-gray-100 my-2 pt-4">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Owner Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Owner Name</label>
                    <p className="text-gray-800">{hotel.owner_name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Owner Email</label>
                    <p className="text-gray-700">{hotel.owner_email}</p>
                  </div>
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 border-t border-gray-100 my-2 pt-4">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Manager Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Manager Name</label>
                    <p className="text-gray-700">{hotel.manager_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Manager Email</label>
                    <p className="text-gray-700">{hotel.manager_email || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 border-t border-gray-100 my-2 pt-4">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Username</label>
                    <p className="font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded w-fit">{hotel.username || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Stats / Actions */}
        {/* <div className="space-y-6">
            <div className="bg-gradient-to-br from-pathik-primary to-pathik-primary-dark rounded-xl shadow-lg text-white p-6">
                <h3 className="text-white/80 font-medium mb-1">Total Guests</h3>
                <div className="text-4xl font-bold mb-4">--</div> 
                <p className="text-sm text-white/60">Registered guests in this hotel.</p>
                <Link href="/dashboard/guests" className="mt-4 block w-full py-2 bg-white/20 hover:bg-white/30 text-center rounded-lg text-sm font-semibold transition-all backdrop-blur-sm no-underline text-white">
                    View Guest Logs
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                    <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 flex items-center gap-3 transition-colors">
                        <i className="fas fa-file-download text-gray-400"></i> Download Report
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 flex items-center gap-3 transition-colors">
                         <i className="fas fa-history text-gray-400"></i> View Audit Log
                    </button>
                </div>
            </div>
        </div> */}

      </div>
    </div>
  );
}
