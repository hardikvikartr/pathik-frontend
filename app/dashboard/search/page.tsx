"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import adminService, {
  AdminSearchPayload,
} from "@/app/services/admin/adminService";
import Loader from "@/app/components/Loader";
import Pagination from "@/app/components/Pagination";
import { encryptId } from "@/app/utils/encryption";

interface SearchResult {
  id: number;
  firstName: string;
  lastName: string;
  middleName: string;
  mobileNo: string;
  email: string | null;
  checkInDate: string;
  checkOutDate: string | null;
  status: string;
  roomNumber: string;
  profileImage: string;
  checkInType: string;
  hotelName: string;
  hotelId: number | string;
}

export default function SearchPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Search Criteria State
  const [nameSearch, setNameSearch] = useState("");
  const [numberSearch, setNumberSearch] = useState("");
  const [addressSearch, setAddressSearch] = useState("");
  const [emailSearch, setEmailSearch] = useState("");
  const [idNumberSearch, setIdNumberSearch] = useState("");
  const [hotelNameSearch, setHotelNameSearch] = useState("");
  const [hotelDistrictSearch, setHotelDistrictSearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");

  // Date Filters
  const [dateType, setDateType] = useState<"checkIn" | "checkOut">("checkIn");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination & Loading
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Results State
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (page = 1) => {
    // 1. Validation - Ensure at least one criteria is present
    const hasSearchCriteria =
      nameSearch ||
      numberSearch ||
      addressSearch ||
      emailSearch ||
      idNumberSearch ||
      hotelNameSearch ||
      hotelDistrictSearch ||
      stateSearch ||
      (startDate && endDate);

    if (!hasSearchCriteria) {
      toast.error("Please enter at least one search criterion");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setCurrentPage(page);

    try {
      const payload: AdminSearchPayload = {
        name: nameSearch,
        mobile: numberSearch,
        email: emailSearch,
        enrollment_number: idNumberSearch,
        address: addressSearch,
        hotel_name: hotelNameSearch,
        hotel_address: hotelDistrictSearch, // Mapping district input to hotel_address as per plan
        state: stateSearch,
        is_check_in_date: dateType === "checkIn" ? 1 : 0,
        is_check_out_date: dateType === "checkOut" ? 1 : 0,
        start_date: startDate,
        end_date: endDate,
        page: page,
        record_count: itemsPerPage,
      };

      const response = await adminService.searchGuests(payload);
      // console.log(response);
      if (response && response.code === 200 && response.data) {
        const apiData = Array.isArray(response.data.result)
          ? response.data.result
          : [];

        const mappedResults: SearchResult[] = apiData.map((item: any) => ({
          id: item.guest_id || item.id, // Fallback if API response key varies
          firstName: item.first_name || item.resident_name?.split(" ")[0] || "",
          lastName: item.last_name || item.resident_name?.split(" ")[2] || "",
          middleName:
            item.middle_name || item.resident_name?.split(" ")[1] || "",
          mobileNo: item.mobile,
          email: item.email,
          checkInDate: item.check_in_date,
          checkOutDate: item.check_out_date,
          status: item.booking_status || "active",
          roomNumber: item.room_no || "N/A",
          profileImage: item.profile_image || "",
          checkInType: item.guest_check_in_type || "-",
          hotelName: item.hotel_name || "-",
          hotelId: item.hotel_id,
        }));

        setResults(mappedResults);
        setTotalRecords(response.data.totalRecords || mappedResults.length);
      } else {
        setResults([]);
        setTotalRecords(0);
      }
    } catch (error) {
      // Toast handled by service
      setResults([]);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(1);
    }
  };

  if (
    !user ||
    (user.role !== "POLICE_STATION" && user.role !== "SUPER_ADMIN")
  ) {
    return <div className="p-8 text-center text-gray-500">Access Denied</div>;
  }

  return (
    <div className="max-w-9xl mx-auto animate-[fadeIn_0.5s_ease-out] pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-pathik-primary hover:scale-110 transition-all cursor-pointer"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <h1 className="text-2xl font-bold text-pathik-text-dark">
          Guest Search
        </h1>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-xl shadow-sm border border-pathik-border p-6 mb-8">
        {/* Officer Details Section - HIDDEN */}
        {/* <div className="mb-8 opacity-50 pointer-events-none grayscale"> ... </div> */}

        {/* Search Criteria Section */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <i className="fas fa-search text-pathik-primary"></i> Search
            Criteria
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Guest Details */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-pathik-text-dark">
                Guest Name
              </label>
              <input
                type="text"
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Guest Name"
                className="p-2.5 border border-pathik-border rounded-lg text-sm focus:border-pathik-primary focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-pathik-text-dark">
                Guest Number
              </label>
              <input
                type="text"
                value={numberSearch}
                onChange={(e) => setNumberSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Mobile Number"
                className="p-2.5 border border-pathik-border rounded-lg text-sm focus:border-pathik-primary focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-pathik-text-dark">
                Email
              </label>
              <input
                type="text"
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Email Address"
                className="p-2.5 border border-pathik-border rounded-lg text-sm focus:border-pathik-primary focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-pathik-text-dark">
                ID Number
              </label>
              <input
                type="text"
                value={idNumberSearch}
                onChange={(e) => setIdNumberSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Aadhaar/Pascal/DL"
                className="p-2.5 border border-pathik-border rounded-lg text-sm focus:border-pathik-primary focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-semibold text-pathik-text-dark">
                Address
              </label>
              <input
                type="text"
                value={addressSearch}
                onChange={(e) => setAddressSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Full or partial address"
                className="p-2.5 border border-pathik-border rounded-lg text-sm focus:border-pathik-primary focus:outline-none"
              />
            </div>

            {/* Location / Hotel Details */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-pathik-text-dark">
                Hotel Name
              </label>
              <input
                type="text"
                value={hotelNameSearch}
                onChange={(e) => setHotelNameSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hotel Name"
                className="p-2.5 border border-pathik-border rounded-lg text-sm focus:border-pathik-primary focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-pathik-text-dark">
                Hotel District
              </label>
              <input
                type="text"
                value={hotelDistrictSearch}
                onChange={(e) => setHotelDistrictSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="District / Address"
                className="p-2.5 border border-pathik-border rounded-lg text-sm focus:border-pathik-primary focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-pathik-text-dark">
                State
              </label>
              <input
                type="text"
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="State"
                className="p-2.5 border border-pathik-border rounded-lg text-sm focus:border-pathik-primary focus:outline-none"
              />
            </div>

            {/* Date Section */}
            <div className="lg:col-span-3 bg-gray-50 rounded-lg p-4 border border-gray-100 flex flex-col md:flex-row gap-6 items-end relative">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase text-gray-500">
                  Date Filter Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dateType"
                      checked={dateType === "checkIn"}
                      onChange={() => setDateType("checkIn")}
                      className="accent-pathik-primary w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Check-in Date
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dateType"
                      checked={dateType === "checkOut"}
                      onChange={() => setDateType("checkOut")}
                      className="accent-pathik-primary w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Checkout Date
                    </span>
                  </label>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 w-full md:w-auto">
                <label className="text-sm font-semibold text-pathik-text-dark">
                  From Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="p-2 border border-pathik-border rounded-lg text-sm focus:border-pathik-primary focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5 w-full md:w-auto">
                <label className="text-sm font-semibold text-pathik-text-dark">
                  To Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="p-2 border border-pathik-border rounded-lg text-sm focus:border-pathik-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            onClick={() => handleSearch(1)}
            disabled={isLoading}
            className="bg-pathik-primary text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:bg-pathik-secondary transition-all flex items-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Searching...
              </>
            ) : (
              <>
                <i className="fas fa-search"></i> Search Guests
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Table */}
      {hasSearched && (
        <>
          {isLoading ? (
            <div className="py-20 flex justify-center">
              <Loader message="Fetching search results..." />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-pathik-border overflow-hidden">
              <div className="overflow-x-auto">
                <div className="p-4 border-b border-pathik-border bg-gray-50 flex justify-between items-center min-w-[800px]">
                  <h3 className="font-bold text-gray-700">Search Results</h3>
                  <span className="bg-pathik-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {totalRecords} Found
                  </span>
                </div>

                {results.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <div className="text-4xl text-gray-300 mb-3">
                      <i className="fas fa-search"></i>
                    </div>
                    <p className="font-medium">No guests found</p>
                    <p className="text-sm mt-1">Try adjusting your filters</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="p-4 border-b border-pathik-border">
                          Guest Name
                        </th>
                        <th className="p-4 border-b border-pathik-border text-center">
                          Mobile
                        </th>
                        <th className="p-4 border-b border-pathik-border text-center">
                          Guest Check In Type
                        </th>
                        <th className="p-4 border-b border-pathik-border text-center">
                          Status
                        </th>
                        <th className="p-4 border-b border-pathik-border text-center">
                          Hotel Name
                        </th>
                        <th className="p-4 border-b border-pathik-border text-right">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pathik-border">
                      {results.map((guest) => (
                        <tr
                          key={guest.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {guest.profileImage ? (
                                <div className="w-18 h-18 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                  <img
                                    src={guest.profileImage}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-pathik-bg-light flex items-center justify-center text-pathik-text-light font-bold shrink-0">
                                  {guest.firstName.charAt(0)}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-pathik-text-dark">
                                  {guest.firstName} {guest.middleName}{" "}
                                  {guest.lastName}
                                </div>
                                <div className="text-xs text-pathik-text-light">
                                  {/* Added optional email display if needed */}
                                  {guest.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center text-sm font-mono text-pathik-text-medium">
                            {guest.mobileNo}
                          </td>
                          <td className="p-4 text-center text-sm text-pathik-text-medium">
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
                          <td className="p-4 text-center">{guest.hotelName}</td>
                          <td className="p-4 text-right">
                            <Link
                              href={`/dashboard/all-guests/${encryptId(guest.id)}?hotel_id=${encryptId(guest.hotelId)}`}
                              target="_blank"
                              className="text-gray-400 hover:text-pathik-primary hover:bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center transition-all ml-auto"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && results.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={totalRecords}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => handleSearch(page)}
            />
          )}
        </>
      )}
    </div>
  );
}
