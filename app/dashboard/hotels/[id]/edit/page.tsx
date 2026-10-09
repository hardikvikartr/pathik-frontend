"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Hotel, PoliceStation } from "@/app/types";
import { toast } from "react-toastify";
import { useAuth } from "@/app/context/AuthContext";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import FormInput from "@/app/components/FormInput";
import FormSelect from "@/app/components/FormSelect";
import hotelService from "@/app/services/hotel/hotelService";

import Loader from "@/app/components/Loader";

interface AddressData {
  location: string;
  sub_location: string;
  latitude: number;
  longitude: number;
}

export default function EditHotelPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingHotel, setFetchingHotel] = useState(true);
  const [initialAddressCount, setInitialAddressCount] = useState(0); // Track initial addresses
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    hotel_id: 0,
    accommodation_type: "HOTEL",
    username: "",
    password: "",
    hotel_name: "",
    email: "",
    phone_no: "",
    website_url: "",
    owner_name: "",
    owner_email: "",
    owner_phone: "",
    manager_name: "",
    manager_email: "",
    manager_phone: "",
    no_of_rooms: 0,
    address: [
      {
        location: "",
        sub_location: "",
        latitude: 0,
        longitude: 0,
      },
    ] as AddressData[],
  });

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        setFetchingHotel(true);
        const response = await hotelService.getHotelDetails(params.id);
        if (response && response.data) {
          const hotel = response.data;
          const addresses =
            hotel.address_data && hotel.address_data.length > 0
              ? hotel.address_data
              : [
                  {
                    location: hotel.address || "",
                    sub_location: "",
                    latitude: parseFloat(hotel.latitude || "0"),
                    longitude: parseFloat(hotel.longitude || "0"),
                  },
                ];

          // Set the initial address count
          setInitialAddressCount(addresses.length);

          setFormData({
            hotel_id: hotel.id,
            accommodation_type: hotel.accommodation_type || "HOTEL",
            username: hotel.username || "",
            password: "",
            hotel_name: hotel.hotel_name || "",
            email: hotel.email || "",
            phone_no: hotel.phone_no || "",
            website_url: hotel.website_url || "",
            owner_name: hotel.owner_name || "",
            owner_email: hotel.owner_email || "",
            owner_phone: hotel.owner_phone || "",
            manager_name: hotel.manager_name || "",
            manager_email: hotel.manager_email || "",
            manager_phone: hotel.manager_phone || "",
            no_of_rooms: hotel.no_of_rooms || 0,
            address: addresses,
          });
        }
      } catch (error) {
        toast.error("Failed to load hotel details");
      } finally {
        setFetchingHotel(false);
      }
    };

    if (params.id) {
      fetchHotelDetails();
    }
  }, [params.id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "no_of_rooms" ? parseInt(value) || 0 : value,
    }));
  };

  const handleAddressChange = (
    index: number,
    field: keyof AddressData,
    value: string | number,
  ) => {
    const updatedAddresses = [...formData.address];
    updatedAddresses[index] = {
      ...updatedAddresses[index],
      [field]:
        field === "latitude" || field === "longitude"
          ? parseFloat(value as string) || 0
          : value,
    };
    setFormData((prev) => ({
      ...prev,
      address: updatedAddresses,
    }));
  };

  const addAddress = () => {
    setFormData((prev) => ({
      ...prev,
      address: [
        ...prev.address,
        {
          location: "",
          sub_location: "",
          latitude: 0,
          longitude: 0,
        },
      ],
    }));
  };

  const removeAddress = (index: number) => {
    // Only allow removal of newly added addresses (not initial ones)
    if (index >= initialAddressCount) {
      setFormData((prev) => ({
        ...prev,
        address: prev.address.filter((_, i) => i !== index),
      }));
    } else {
      toast.error("Cannot remove existing addresses");
    }
  };

  // Check if address is editable (only new addresses can be edited)
  const isAddressEditable = (index: number) => {
    return index >= initialAddressCount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.hotel_name) {
      toast.error("Hotel name is required");
      return;
    }
    if (!formData.email) {
      toast.error("Email is required");
      return;
    }
    if (!formData.phone_no) {
      toast.error("Phone number is required");
      return;
    }

    try {
      setLoading(true);
      const payload = { ...formData };
      if (!payload.password) {
        delete (payload as any).password;
      }
      const response = await hotelService.updateHotel(payload);

      if (response && response.code === 200) {
        toast.success("Hotel updated successfully!");
        router.push(`/dashboard/hotels`);
      } else {
        toast.error(response?.message || "Failed to update hotel");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to update hotel");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const canEdit =
    user.role === "SUPER_ADMIN" || user.permissions?.includes("update_hotel");

  if (!canEdit) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            You don't have permission to edit hotels.
          </p>
        </div>
      </div>
    );
  }

  if (fetchingHotel) {
    return <Loader message="Loading hotel details..." />;
  }

  return (
    <div className="max-w-7xl mx-auto animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-pathik-primary hover:scale-110 transition-all"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-pathik-text-dark">
              Edit Hotel
            </h1>
            <p className="text-sm text-pathik-text-light">
              Update hotel information
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <i className="fas fa-hotel text-pathik-primary/60"></i>
            <h2 className="font-bold text-gray-800">Basic Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pathik-primary focus:border-transparent"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={(formData as any).password || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pathik-primary focus:border-transparent pr-10"
                  placeholder="Enter new password (optional)"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pathik-primary"
                >
                  <i
                    className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                  ></i>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Hotel Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="hotel_name"
                value={formData.hotel_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pathik-primary focus:border-transparent"
                placeholder="Enter hotel name"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pathik-primary focus:border-transparent"
                placeholder="Enter email"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone_no"
                value={formData.phone_no}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pathik-primary focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Website URL
              </label>
              <input
                type="url"
                name="website_url"
                value={formData.website_url}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pathik-primary focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Number of Rooms
              </label>
              <input
                type="number"
                name="no_of_rooms"
                value={formData.no_of_rooms}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pathik-primary focus:border-transparent"
                placeholder="Enter number of rooms"
              />
            </div>
          </div>
        </div>

        {/* Owner Information */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <i className="fas fa-user-tie text-pathik-primary/60"></i>
            <h2 className="font-bold text-gray-800">Owner Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Owner Name
              </label>
              <input
                type="text"
                name="owner_name"
                value={formData.owner_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pathik-primary focus:border-transparent"
                placeholder="Enter owner name"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Owner Email
              </label>
              <input
                type="email"
                name="owner_email"
                value={formData.owner_email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pathik-primary focus:border-transparent"
                placeholder="Enter owner email"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Owner Phone
              </label>
              <input
                type="text"
                name="owner_phone"
                value={formData.owner_phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pathik-primary focus:border-transparent"
                placeholder="Enter owner phone"
              />
            </div>
          </div>
        </div>

        {/* Manager Information */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <i className="fas fa-user-cog text-pathik-primary/60"></i>
            <h2 className="font-bold text-gray-800">Manager Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Manager Name
              </label>
              <input
                type="text"
                name="manager_name"
                value={formData.manager_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pathik-primary focus:border-transparent"
                placeholder="Enter manager name"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Manager Email
              </label>
              <input
                type="email"
                name="manager_email"
                value={formData.manager_email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pathik-primary focus:border-transparent"
                placeholder="Enter manager email"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Manager Phone
              </label>
              <input
                type="text"
                name="manager_phone"
                value={formData.manager_phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pathik-primary focus:border-transparent"
                placeholder="Enter manager phone"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <i className="fas fa-map-marker-alt text-pathik-primary/60"></i>
              <h2 className="font-bold text-gray-800">Address Information</h2>
            </div>
            {formData.accommodation_type !== "HOTEL" && (
              <button
                type="button"
                onClick={addAddress}
                className="px-4 py-2 bg-pathik-primary text-white rounded-lg text-sm font-semibold hover:bg-pathik-primary/90 transition-colors flex items-center gap-2"
              >
                <i className="fas fa-plus"></i>Add Address
              </button>
            )}
          </div>

          <div className="p-6 space-y-6">
            {formData.address.map((addr, index) => (
              <div
                key={index}
                className={`border border-gray-200 rounded-lg p-6 relative ${
                  isAddressEditable(index) ? "bg-gray-50/50" : "bg-blue-50/30"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <i className="fas fa-map-pin text-gray-400"></i>
                    Address {index + 1}
                    {!isAddressEditable(index) && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full ml-2">
                        <i className="fas fa-lock mr-1"></i>
                        Existing
                      </span>
                    )}
                  </h3>
                  {isAddressEditable(index) && (
                    <button
                      type="button"
                      onClick={() => removeAddress(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Remove address"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addr.location}
                      onChange={(e) =>
                        handleAddressChange(index, "location", e.target.value)
                      }
                      disabled={!isAddressEditable(index)}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pathik-primary focus:border-transparent ${
                        !isAddressEditable(index)
                          ? "bg-gray-100 cursor-not-allowed text-gray-600"
                          : ""
                      }`}
                      placeholder="Enter location"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-pathik-primary text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Updating...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                Update Hotel
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
