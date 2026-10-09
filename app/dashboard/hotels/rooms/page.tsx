"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { Room } from "@/app/types";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";
import FormInput from "@/app/components/FormInput";
import FormSelect from "@/app/components/FormSelect";
import { FormikProvider } from "formik";
import Pagination from "@/app/components/Pagination";
import roomService, { AddRoomPayload } from "@/app/services/rooms/roomService";

interface Address {
  id: number;
  location: string;
}

interface RoomType {
  key: string;
  value: string;
}

export default function RoomManagementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // API Data States
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

  // Pagination & Filtering State
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const itemsPerPage = 1;

  const [isLoading, setIsLoading] = useState(false);
  
  // Load Initial Data (Addresses & Room Types)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [addrRes, typeRes] = await Promise.all([
          roomService.getAddresses(),
          roomService.getRoomTypes(),
        ]);

        if (addrRes?.code === 200 && Array.isArray(addrRes.data)) {
          setAddresses(addrRes.data);
          // Set default address filter to the first one if available
          if (addrRes.data.length > 0) {
            setSelectedAddressId(addrRes.data[0].id.toString());
          }
        }

        if (typeRes?.code === 200 && Array.isArray(typeRes.data)) {
          setRoomTypes(typeRes.data);
        }
      } catch (error) {
      }
    };

    if (user) {
      fetchInitialData();
    }
  }, [user]);

  // Fetch Rooms when Address or Page Changes
  useEffect(() => {
    const fetchRooms = async () => {
      if (!selectedAddressId) return;

      setIsLoading(true);
      try {
        const payload = {
          address_id: parseInt(selectedAddressId),
          page: currentPage,
          record_count: itemsPerPage,
        };

        const response = await roomService.getRooms(payload);

        if (response?.code === 200) {
          // Map API response to Room interface
          // Assuming response.data is the list and response.total_records is available
          // Adjust based on actual API response structure
          const fetchedRooms: Room[] = [];

          if (Array.isArray(response.data.data)) {
            response.data.data.forEach((group: any) => {
              if (Array.isArray(group.room_ranges)) {
                const addr =
                  addresses.find(
                    (a) => a.id.toString() === group.address_id?.toString(),
                  )?.location || "Unknown";

                group.room_ranges.forEach((r: any) => {
                  fetchedRooms.push({
                    id: r.id?.toString(),
                    wing: group.wing,
                    number: r.room_no.toString(),
                    floor: group.floor_no?.toString() || "",
                    type: group.room_type,
                    status: r.is_available ? "available" : "occupied",
                    address: addr,
                  });
                });
              }
            });
          }

          setRooms(fetchedRooms);
          // Try to get total_records from response if available (casting to any since interface might be incomplete)
          const total =
            (response as any).data.totalRecords ||
            (response as any).data.total_records ||
            (response as any).data.count ||
            0;
          setTotalRecords(total || fetchedRooms.length);
          // If API doesn't return total count for pagination, we might need adjustments
        } else {
          setRooms([]);
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [selectedAddressId, currentPage]);

  const validationSchema = Yup.object({
    address_id: Yup.string().required("Address is required"),
    wing: Yup.string().required("Wing is required"),
    floor_no: Yup.string().required("Floor is required"),
    room_type: Yup.string().required("Room Type is required"),
    start_room_no: Yup.number().required("Start Number is required").min(1),
    end_room_no: Yup.number()
      .required("End Number is required")
      .min(
        Yup.ref("start_room_no"),
        "End number must be greater than start number",
      ),
  });

  const formik = useFormik({
    initialValues: {
      address_id: "",
      wing: "",
      floor_no: "",
      room_type: "",
      start_room_no: 101,
      end_room_no: 110,
    },
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const payload: AddRoomPayload = {
          address_id: parseInt(values.address_id),
          wing: values.wing,
          floor_no: parseInt(values.floor_no),
          room_type: values.room_type,
          start_room_no: parseInt(values.start_room_no.toString()),
          end_room_no: parseInt(values.end_room_no.toString()),
        };

        const response = await roomService.addRoom(payload);
        if (response?.code === 200) {
          toast.success("Rooms added successfully!");
          setIsModalOpen(false);
          resetForm();
          // Refresh list if added to current view
          if (values.address_id === selectedAddressId) {
            setCurrentPage(1);
            window.location.reload();
          }
        }
      } catch (error) {
        // Toast handled in service
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Sorting helper
  const sortRooms = (roomList: Room[]) => {
    return [...roomList].sort(
      (a, b) => parseInt(a.number) - parseInt(b.number),
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div className="flex md:flex-row flex-col gap-y-2 justify-between items-center mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-pathik-text-dark flex items-center gap-3">
            <i className="fas fa-door-open text-pathik-primary"></i>
            Room Management
          </h1>
          <p className="text-pathik-text-light text-sm">
            Manage hotel inventory and rooms
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-linear-to-r from-pathik-primary to-pathik-secondary text-white px-6 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 font-medium"
        >
          <i className="fas fa-plus"></i> Add Rooms
        </button>
      </div>

      {/* Filter */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-pathik-border flex items-center gap-4">
        <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
          Select Address:
        </label>
        <select
          className="w-full md:w-1/2 p-2.5 border border-pathik-border rounded-lg text-sm focus:outline-none focus:border-pathik-primary"
          value={selectedAddressId}
          onChange={(e) => setSelectedAddressId(e.target.value)}
        >
          {addresses.length === 0 && (
            <option value="">Loading addresses...</option>
          )}
          {addresses.map((addr) => (
            <option key={addr.id} value={addr.id}>
              {addr.location}
            </option>
          ))}
        </select>
        {selectedAddressId && (
          <span className="text-sm text-gray-500 ml-auto hidden md:block">
            Showing rooms for selected address
          </span>
        )}
      </div>

      {/* Grid View */}
      <div className="animate-[fadeInUp_0.3s_ease-out]">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Loading rooms...</div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed">
            <div className="text-4xl mb-3 opacity-20">
              <i className="fas fa-bed"></i>
            </div>
            <p>No rooms found for this address.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-pathik-primary text-sm font-semibold mt-2 hover:underline"
            >
              Add Rooms
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {sortRooms(rooms).map((room) => (
                <div
                  key={room.id}
                  className={`
                        p-4 rounded-xl border text-center transition-all hover:-translate-y-1 hover:shadow-md cursor-default
                        ${room.status === "available"
                      ? "bg-white border-green-200 text-green-700 shadow-green-100"
                      : room.status === "occupied"
                        ? "bg-red-50 border-red-200 text-red-700"
                        : "bg-gray-100 border-gray-200 text-gray-600"
                    }
                    `}
                >
                  <div className="text-2xl font-bold mb-1">{room.number}</div>
                  <div className="text-xs font-semibold opacity-70 mb-2">
                    {room.wing} • {room.floor}
                  </div>
                  <div
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide
                                    ${room.status === "available" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                                `}
                  >
                    {room.status}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalItems={totalRecords || rooms.length} // Fallback to current length if total not available
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      {/* Add Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-[scaleIn_0.2s_ease-out]">
            <div className="p-6 px-8 border-b border-pathik-border flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold text-pathik-text-dark">
                Add New Rooms
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <FormikProvider value={formik}>
              <form onSubmit={formik.handleSubmit} className="p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <FormSelect
                      name="address_id"
                      label="Select Address"
                      placeholder="Choose property address"
                      options={addresses.map((addr) => ({
                        label: addr.location,
                        value: addr.id,
                      }))}
                      required
                    />
                  </div>
                  <FormInput
                    name="wing"
                    label="Wing"
                    placeholder="e.g. A"
                    required
                  />
                  <FormInput
                    name="floor_no"
                    label="Floor"
                    placeholder="e.g. 1"
                    required
                  />
                  <FormSelect
                    name="room_type"
                    label="Room Type"
                    placeholder="Select room type"
                    options={roomTypes.map((rt) => ({
                      label: rt.value,
                      value: rt.key,
                    }))}
                    required
                  />
                  <div></div> {/* Spacer for grid alignment */}
                  <FormInput
                    name="start_room_no"
                    label="Start Room No."
                    type="number"
                    required
                  />
                  <FormInput
                    name="end_room_no"
                    label="End Room No."
                    type="number"
                    required
                  />
                </div>

                <div className="bg-blue-50 text-blue-700 p-4 rounded-lg text-sm mt-6 mb-2 flex items-start gap-2">
                  <i className="fas fa-info-circle mt-0.5"></i>
                  <div>
                    This will generate{" "}
                    <strong>{formik.values.room_type || "rooms"}</strong> type
                    rooms from{" "}
                    <strong>
                      {formik.values.wing}-{formik.values.start_room_no}
                    </strong>{" "}
                    to{" "}
                    <strong>
                      {formik.values.wing}-{formik.values.end_room_no}
                    </strong>
                    .
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-linear-to-r from-pathik-primary to-pathik-secondary text-white font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={formik.isSubmitting}
                  >
                    {formik.isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Generating...
                      </>
                    ) : (
                      "Generate Rooms"
                    )}
                  </button>
                </div>
              </form>
            </FormikProvider>
          </div>
        </div>
      )}
    </div>
  );
}
