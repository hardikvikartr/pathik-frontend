"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";

// Mock Data for fallback
const MOCK_GUEST = {
  id: "GUEST-001",
  firstName: "John",
  middleName: "Michael",
  lastName: "Smith",
  dateOfBirth: "1990-05-15",
  mobileNo: "+1 234-567-8900",
  email: "john.smith@example.com",
  noOfAdult: 2,
  noOfChild: 1,
  documentType: "Passport",
  documentNumber: "P123456789",
  documentImages: [
    "https://placehold.co/400x300?text=Document+1",
    "https://placehold.co/400x300?text=Document+2",
  ],
  vehicleType: "Car",
  vehicleRegNo: "GJ01KP1788",
  companyName: "ABC Corporation",
  houseFlat: "A-101",
  address: "123 Main Street",
  locality: "Downtown",
  city: "New York",
  district: "Manhattan",
  zipCode: "10001",
  country: "United States",
  state: "New York",
  phoneNo: "+1 234-567-8900",
  comingFrom: "Los Angeles",
  goingTo: "Boston",
  roomNumber: "101",
  checkInDate: "2025-01-15",
  checkInTime: "14:00",
  checkoutDate: "2025-01-20",
  checkoutTime: "11:00",
  status: "active",
};

import { usePermission } from "../../../hooks/usePermission";
import { toast } from "react-toastify";
import { TOAST_MESSAGES } from "../../../utils/messages";
import hotelService from "@/app/services/hotel/hotelService";
import Loader from "@/app/components/Loader";
import { decryptId } from "@/app/utils/encryption";

export default function GuestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { checkPermission } = usePermission();
  const [guest, setGuest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // UI State
  const [imageModal, setImageModal] = useState({ active: false, src: "" });
  const [confirmModal, setConfirmModal] = useState({
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

  useEffect(() => {
    // Permission Check
    if (
      user &&
      user.role !== "SUPER_ADMIN" &&
      user.role !== "POLICE_STATION" &&
      !user.permissions?.includes("read_guest")
    ) {
      router.push("/dashboard/all-guests");
      return;
    }

    // Load guest data
    const loadData = async () => {
      const decryptedGuestId = decryptId(params.id as string);
      const encryptedHotelId = searchParams.get("hotel_id");
      const decryptedHotelId = decryptId(encryptedHotelId);

      if (!decryptedGuestId) {
        toast.error("Invalid Guest ID");
        router.push("/dashboard/all-guests");
        return;
      }

      const payload = {
        guest_id: Number(decryptedGuestId),
        hotel_id: decryptedHotelId ?? undefined,
      };

      try {
        const response = await hotelService.getGuestDetails(payload);
        // console.log(response);
        if (response?.code === 200) {
          const data = response.data;
          const mappedGuest = {
            id: data.id,
            firstName: data.first_name || data.resident_name.split(" ")[0],
            middleName: data.middle_name || data.resident_name.split(" ")[1],
            lastName: data.last_name || data.resident_name.split(" ")[2],
            mobileNo: data.mobile,
            email: data.email,
            profileImage: data.profile_image,
            checkInType: data.guest_check_in_type,
            status: data.status,
            bookings: data.guest_booking_data || [],
            dateOfBirth: data.dob,
            documentNumber: data.document_no,
            documents: data.documents_data || [],
            address: data.address,
            city: data.city,
            district: data.district,
            state: data.state,
            zipCode: data.pincode,
            country: data.country_data?.name,
            localResidentName: data.local_resident_name,
            // Add other fields as they appear in response or keep defaults
            // Mapping extensive fields same as existing
            careOf: data.care_of,
            enrolmentNumber: data.enrolment_number,
            isNri: data.is_nri,
            transactionId: data.transaction_id,
            enrolmentDate: data.enrolment_date,
            credentialIssuingDate: data.credential_issuing_date,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            localCareOf: data.local_care_of,
            localBuilding: data.local_building,
            localStreet: data.local_street,
            localLandmark: data.local_landmark,
            localLocality: data.local_locality,
            localVtc: data.local_vtc,
            localSubDistrict: data.local_sub_district,
            localDistrict: data.local_district,
            localState: data.local_state,
            localPoName: data.local_po_name,
            landmark: data.landmark,
            locality: data.locality,
            vtc: data.vtc,
            subDistrict: data.sub_district,
            poName: data.po_name,
            street: data.street,
            regionalAddress: data.regional_address,
            maskedMobile: data.masked_mobile,
            maskedEmail: data.masked_email,
            aadhaarVerified: !!data.transaction_id, // Assuming transaction ID implies verification or use a flag if available
          };
          setGuest(mappedGuest);
        }
      } catch (error) {
        // console.error("Error fetching guest details:", error);
        // Optional: setGuest(MOCK_GUEST); // Don't use mock if we want real data
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadData();
    }
  }, [params.id, user, router, searchParams]);

  const handleDelete = () => {
    setConfirmModal({
      active: true,
      type: "danger",
      icon: "fa-trash-alt",
      title: "Delete Guest",
      message: `Are you sure you want to delete ${guest.firstName} ${guest.lastName}? This action cannot be undone.`,
      confirmType: "danger",
      confirmIcon: "fa-trash",
      confirmText: "Delete Guest",
      onConfirm: () => {
        // This is legacy localStorage code, keeping it for now but redirecting to all-guests
        const guests = JSON.parse(localStorage.getItem("pathikGuests") || "[]");
        const updatedGuests = guests.filter((g: any) => g.id !== guest.id);
        localStorage.setItem("pathikGuests", JSON.stringify(updatedGuests));

        toast.success(TOAST_MESSAGES.success.guestDeleted);
        setTimeout(() => {
          router.push("/dashboard/all-guests");
        }, 1500);
        setConfirmModal((prev) => ({ ...prev, active: false }));
      },
    });
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return <Loader message="Loading guest details..." />;
  }

  if (!guest) {
    return (
      <div className="p-5 text-center text-pathik-text-dark font-bold">
        Guest not found
      </div>
    );
  }

  return (
    <>
      {/* Detail Header */}
      <div className="z-50 rounded-lg bg-white p-4 px-8 mb-6 shadow-sm animate-[slideDown_0.3s_ease]">
        <div className="flex justify-between items-center mb-4">
          <Link
            href="/dashboard/all-guests"
            className="bg-pathik-bg-light border-2 border-pathik-border text-pathik-text-dark p-2 px-4 rounded-lg font-semibold text-sm cursor-pointer transition-all duration-300 flex items-center gap-2 hover:bg-pathik-primary hover:text-white hover:border-pathik-primary"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Guests
          </Link>
        </div>
        <div className="flex items-center gap-5 flex-wrap">
          {guest.profileImage ? (
            <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border-2 border-gray-100 shadow-sm relative">
              <img
                src={guest.profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-[60px] h-[60px] bg-linear-to-br from-pathik-primary to-pathik-secondary rounded-xl flex items-center justify-center text-white font-bold text-2xl shrink-0">
              <span>
                {guest.firstName?.charAt(0)}
                {guest.middleName?.charAt(0)}
                {guest.lastName?.charAt(0)}
              </span>
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-pathik-text-dark mb-1">
              {guest.firstName} {guest.middleName} {guest.lastName}
            </h1>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold text-xs ${
                guest.status === "checked-out"
                  ? "bg-red-50 text-pathik-coral"
                  : guest.status === "pending"
                    ? "bg-yellow-50 text-yellow-600"
                    : "bg-teal-50 text-pathik-teal"
              }`}
            >
              <i className="fas fa-circle text-[0.4rem]"></i>
              <span>
                {guest.status === "active"
                  ? "Active"
                  : guest.status === "checked-out"
                    ? "Checked Out"
                    : guest.status
                      ? guest.status
                      : "Active"}
              </span>
            </div>
          </div>
        </div>
        {/* Guest Type Badge */}
        <div className="mt-2 inline-block px-3 py-1 rounded bg-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wider">
          {guest.checkInType || "Unknown Type"}
        </div>
      </div>

      {/* Content Container */}
      <div className="max-w-9xl mx-auto p-0 md:px-7 pb-8 animate-[fadeInUp_0.6s_ease-out_0.1s_both]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* Personal Details */}
          <div className="bg-white rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-pathik-bg-light">
              <div className="w-10 h-10 bg-linear-to-br from-pathik-primary to-pathik-secondary rounded-lg flex items-center justify-center text-white text-base shrink-0">
                <i className="fas fa-id-card"></i>
              </div>
              <h2 className="text-lg font-bold text-pathik-text-dark m-0">
                Personal Details
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="text-xs text-pathik-text-light uppercase tracking-wider font-semibold">
                  First Name
                </div>
                <div className="text-[0.9rem] text-pathik-text-dark font-medium wrap-wrap-break-word">
                  {guest.firstName || "N/A"}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="text-xs text-pathik-text-light uppercase tracking-wider font-semibold">
                  Last Name
                </div>
                <div className="text-[0.9rem] text-pathik-text-dark font-medium wrap-break-word">
                  {guest.lastName || "N/A"}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="text-xs text-pathik-text-light uppercase tracking-wider font-semibold">
                  Date of Birth
                </div>
                <div className="text-[0.9rem] text-pathik-text-dark font-medium wrap-break-word">
                  {formatDate(guest.dateOfBirth)}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="text-xs text-pathik-text-light uppercase tracking-wider font-semibold">
                  Middle Name
                </div>
                <div className="text-[0.9rem] text-pathik-text-dark font-medium wrap-break-word">
                  {guest.middleName || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-pathik-bg-light">
              <div className="w-10 h-10 bg-linear-to-br from-pathik-primary to-pathik-secondary rounded-lg flex items-center justify-center text-white text-base shrink-0">
                <i className="fas fa-phone"></i>
              </div>
              <h2 className="text-lg font-bold text-pathik-text-dark m-0">
                Contact Information
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="text-xs text-pathik-text-light uppercase tracking-wider font-semibold">
                  Mobile Number
                </div>
                <div className="text-[0.9rem] text-pathik-text-dark font-medium wrap-break-word">
                  {guest.mobileNo || "N/A"}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="text-xs text-pathik-text-light uppercase tracking-wider font-semibold">
                  Email Address
                </div>
                <div className="text-[0.9rem] text-pathik-text-dark font-medium wrap-break-word">
                  {guest.email || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Booking History */}
          <div className="bg-white rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md col-span-1 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-pathik-bg-light">
              <div className="w-10 h-10 bg-linear-to-br from-pathik-primary to-pathik-secondary rounded-lg flex items-center justify-center text-white text-base shrink-0">
                <i className="fas fa-history"></i>
              </div>
              <h2 className="text-lg font-bold text-pathik-text-dark m-0">
                Booking History
              </h2>
            </div>

            {guest.bookings && guest.bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold">Check In</th>
                      <th className="p-3 font-semibold">Check Out</th>
                      <th className="p-3 font-semibold">Room No</th>
                      <th className="p-3 font-semibold text-center">Guests</th>
                      <th className="p-3 font-semibold">Vehicle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guest.bookings.map((booking: any) => (
                      <tr
                        key={booking.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors text-sm"
                      >
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                              booking.booking_status === "CHECKIN"
                                ? "bg-green-100 text-green-700"
                                : booking.booking_status === "CHECKOUT"
                                  ? "bg-gray-100 text-gray-600"
                                  : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            {booking.booking_status}
                          </span>
                        </td>
                        <td className="p-3 text-gray-700">
                          {formatDateTime(booking.check_in_date)}
                        </td>
                        <td className="p-3 text-gray-700">
                          {booking.check_out_date
                            ? formatDateTime(booking.check_out_date)
                            : "-"}
                        </td>
                        <td className="p-3 font-medium text-gray-800">
                          {booking.room_no || "N/A"}
                        </td>
                        <td className="p-3 text-center">
                          <span title="Adults" className="mr-2">
                            <i className="fas fa-user text-gray-400 mr-1"></i>
                            {booking.no_of_adults}
                          </span>
                          <span title="Children">
                            <i className="fas fa-child text-gray-400 mr-1"></i>
                            {booking.no_of_children}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600 text-xs">
                          {booking.vehicle_details?.vehicle_number ? (
                            <div>
                              <div className="font-semibold">
                                {booking.vehicle_details.vehicle_number}
                              </div>
                              <div className="text-[10px] text-gray-400">
                                {booking.vehicle_details.vehicle_type}
                              </div>
                            </div>
                          ) : (
                            "No Vehicle"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                No booking history found
              </div>
            )}
          </div>

          {/* Address Details */}
          <div className="bg-white rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-pathik-bg-light">
              <div className="w-10 h-10 bg-linear-to-br from-pathik-primary to-pathik-secondary rounded-lg flex items-center justify-center text-white text-base shrink-0">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <h2 className="text-lg font-bold text-pathik-text-dark m-0">
                Address Details
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 col-span-1 sm:col-span-2">
                <div className="text-xs text-pathik-text-light uppercase tracking-wider font-semibold">
                  Address
                </div>
                <div className="text-[0.9rem] text-pathik-text-dark font-medium wrap-break-word">
                  {guest.address || "N/A"}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="text-xs text-pathik-text-light uppercase tracking-wider font-semibold">
                  City
                </div>
                <div className="text-[0.9rem] text-pathik-text-dark font-medium wrap-break-word">
                  {guest.city || "N/A"}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="text-xs text-pathik-text-light uppercase tracking-wider font-semibold">
                  District
                </div>
                <div className="text-[0.9rem] text-pathik-text-dark font-medium wrap-break-word">
                  {guest.district || "N/A"}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="text-xs text-pathik-text-light uppercase tracking-wider font-semibold">
                  Zip Code
                </div>
                <div className="text-[0.9rem] text-pathik-text-dark font-medium wrap-break-word">
                  {guest.zipCode || "N/A"}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="text-xs text-pathik-text-light uppercase tracking-wider font-semibold">
                  State
                </div>
                <div className="text-[0.9rem] text-pathik-text-dark font-medium wrap-break-word">
                  {guest.state || "N/A"}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="text-xs text-pathik-text-light uppercase tracking-wider font-semibold">
                  Country
                </div>
                <div className="text-[0.9rem] text-pathik-text-dark font-medium wrap-break-word">
                  {guest.country || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Document Information */}
          <div className="bg-white rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-pathik-bg-light">
              <div className="w-10 h-10 bg-linear-to-br from-pathik-primary to-pathik-secondary rounded-lg flex items-center justify-center text-white text-base shrink-0">
                <i className="fas fa-file-alt"></i>
              </div>
              <h2 className="text-lg font-bold text-pathik-text-dark m-0">
                Document Information
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="text-xs text-pathik-text-light uppercase tracking-wider font-semibold">
                  Document Type
                </div>
                <div className="text-[0.9rem] text-pathik-text-dark font-medium wrap-break-word">
                  {guest.documents && guest.documents.length > 0
                    ? guest.documents[0].name
                    : guest.documentType || "N/A"}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="text-xs text-pathik-text-light uppercase tracking-wider font-semibold">
                  Document Number
                </div>
                <div className="text-[0.9rem] text-pathik-text-dark font-medium wrap-break-word">
                  {guest.documentNumber || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Document Images */}
          <div className="bg-white rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md lg:col-span-2">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-pathik-bg-light">
              <div className="w-10 h-10 bg-linear-to-br from-pathik-primary to-pathik-secondary rounded-lg flex items-center justify-center text-white text-base shrink-0">
                <i className="fas fa-images"></i>
              </div>
              <h2 className="text-lg font-bold text-pathik-text-dark m-0">
                Document Images
              </h2>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 mt-3">
              {guest.documents && guest.documents.length > 0 ? (
                guest.documents.map((doc: any, index: number) => (
                  <div
                    key={index}
                    className="relative rounded-lg overflow-hidden shadow-sm cursor-pointer transition-all duration-300 group hover:-translate-y-1 hover:shadow-md"
                    onClick={() =>
                      setImageModal({ active: true, src: doc.file_name })
                    }
                  >
                    <img
                      src={doc.file_name}
                      alt={doc.name || `Document ${index + 1}`}
                      className="w-full h-[180px] object-cover block"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent text-white p-3 text-xs font-semibold">
                      {doc.name || `Document ${index + 1}`}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center p-8 text-pathik-text-light">
                  <i className="fas fa-image text-4xl mb-3 opacity-50"></i>
                  <p className="text-sm">No document images available</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Aadhaar Data */}
          {guest.aadhaarVerified && (
            <div className="bg-white rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md lg:col-span-2">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-pathik-bg-light">
                <div className="w-10 h-10 bg-linear-to-br from-pathik-primary to-pathik-secondary rounded-lg flex items-center justify-center text-white text-base shrink-0">
                  <i className="fas fa-fingerprint"></i>
                </div>
                <h2 className="text-lg font-bold text-pathik-text-dark m-0">
                  Additional Aadhaar Data
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
                {/* Identity Info */}
                {[
                  { label: "Care Of (C/O)", value: guest.careOf },
                  { label: "Enrolment Number", value: guest.enrolmentNumber },
                  {
                    label: "Is NRI",
                    value:
                      guest.isNri !== undefined
                        ? guest.isNri
                          ? "Yes"
                          : "No"
                        : "N/A",
                  },
                  { label: "Transaction ID", value: guest.transactionId },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="text-xs text-pathik-text-light uppercase tracking-wider font-semibold">
                      {item.label}
                    </div>
                    <div className="text-[0.9rem] text-pathik-text-dark font-medium wrap-break-word">
                      {item.value || "N/A"}
                    </div>
                  </div>
                ))}

                {/* Dates */}
                {[
                  {
                    label: "Date of Birth",
                    value: formatDate(guest.dateOfBirth),
                  },
                  {
                    label: "Enrolment Date",
                    value: formatDate(guest.enrolmentDate),
                  },
                  {
                    label: "Issue Date",
                    value: formatDate(guest.credentialIssuingDate),
                  },
                  { label: "Created At", value: formatDate(guest.createdAt) },
                  { label: "Updated At", value: formatDate(guest.updatedAt) },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="text-xs text-pathik-text-light uppercase tracking-wider font-semibold">
                      {item.label}
                    </div>
                    <div className="text-[0.9rem] text-pathik-text-dark font-medium wrap-break-word">
                      {item.value}
                    </div>
                  </div>
                ))}

                {/* Local Language Fields */}
                {[
                  {
                    label: "Local Resident Name",
                    value: guest.localResidentName,
                  },
                  { label: "Local Care Of", value: guest.localCareOf },
                  { label: "Local Building", value: guest.localBuilding },
                  { label: "Local Street", value: guest.localStreet },
                  { label: "Local Landmark", value: guest.localLandmark },
                  { label: "Local Locality", value: guest.localLocality },
                  { label: "Local VTC", value: guest.localVtc },
                  {
                    label: "Local Sub-District",
                    value: guest.localSubDistrict,
                  },
                  { label: "Local District", value: guest.localDistrict },
                  { label: "Local State", value: guest.localState },
                  { label: "Local PO Name", value: guest.localPoName },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="text-xs text-pathik-text-light uppercase tracking-wider font-semibold">
                      {item.label}
                    </div>
                    <div className="text-[0.9rem] text-pathik-text-dark font-medium wrap-break-word">
                      {item.value || "N/A"}
                    </div>
                  </div>
                ))}

                {/* Detailed Address */}
                {[
                  { label: "Landmark", value: guest.landmark },
                  { label: "Locality", value: guest.locality },
                  { label: "VTC", value: guest.vtc },
                  { label: "Sub District", value: guest.subDistrict },
                  { label: "PO Name", value: guest.poName },
                  { label: "Street", value: guest.street },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="text-xs text-pathik-text-light uppercase tracking-wider font-semibold">
                      {item.label}
                    </div>
                    <div className="text-[0.9rem] text-pathik-text-dark font-medium wrap-break-word">
                      {item.value || "N/A"}
                    </div>
                  </div>
                ))}

                <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col gap-1.5">
                  <div className="text-xs text-pathik-text-light uppercase tracking-wider font-semibold">
                    Regional Address
                  </div>
                  <div className="text-[0.9rem] text-pathik-text-dark font-medium wrap-break-word">
                    {guest.regionalAddress || "N/A"}
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 pt-4 border-t border-dashed border-gray-200">
                  <div className="flex flex-col gap-1.5">
                    <div className="text-xs text-pathik-text-light uppercase tracking-wider font-semibold">
                      Masked Mobile
                    </div>
                    <div className="text-[0.9rem] text-pathik-text-dark font-medium wrap-break-word font-mono text-xs bg-gray-50 p-1 px-2 rounded-md w-fit border border-gray-200">
                      {guest.maskedMobile || "N/A"}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="text-xs text-pathik-text-light uppercase tracking-wider font-semibold">
                      Masked Email
                    </div>
                    <div className="text-[0.9rem] text-pathik-text-dark font-medium wrap-break-word font-mono text-xs bg-gray-50 p-1 px-2 rounded-md w-fit border border-gray-200">
                      {guest.maskedEmail || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl p-4 px-6 shadow-sm flex justify-between items-center gap-4 flex-wrap">
          <div className="flex gap-3">
            {/* Edit Button - Keeping generic if needed, but routing might be tricky for admin */}
            {/* <button
              className="py-2.5 px-5 rounded-lg font-semibold text-sm cursor-pointer transition-all duration-300 flex items-center gap-2 border-none bg-pathik-primary text-white hover:bg-black hover:-translate-y-0.5 hover:shadow-md"
              onClick={() =>
                checkPermission("update_guest", () =>
                  router.push(`/dashboard/add-guest?guestId=${guest.id}`), // Admin edit might use same route
                )
              }
            >
              <i className="fas fa-edit"></i>
              Edit Guest
            </button> */}
            <button
              className="py-2.5 px-5 rounded-lg font-semibold text-sm cursor-pointer transition-all duration-300 flex items-center gap-2 bg-white text-pathik-text-dark border-2 border-pathik-border hover:border-pathik-primary hover:text-pathik-primary"
              onClick={() => window.print()}
            >
              <i className="fas fa-print"></i>
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {imageModal.active && (
        <div
          className="fixed inset-0 z-10001 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease] cursor-pointer"
          onClick={() => setImageModal({ active: false, src: "" })}
        >
          <span className="absolute top-5 right-8 text-white text-4xl cursor-pointer hover:text-pathik-coral transition-colors w-[50px] h-[50px] flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20">
            &times;
          </span>
          <img
            className="max-w-[90%] max-h-[90vh] object-contain rounded-lg shadow-2xl animate-[scaleIn_0.3s_ease]"
            src={imageModal.src}
            onClick={(e) => e.stopPropagation()}
            alt="Document Full View"
          />
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
