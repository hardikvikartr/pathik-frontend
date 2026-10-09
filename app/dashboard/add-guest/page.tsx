"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import { Room, Guest, Booking } from "@/app/types";
import { TOAST_MESSAGES } from "../../utils/messages";
import Step1Basic from "./components/Step1Basic";
import Step3Identity from "./components/Step3Identity";
import RoomService from "@/app/services/rooms/roomService";
import roomService from "@/app/services/rooms/roomService";
import hotelService from "@/app/services/hotel/hotelService";
interface Address {
  id: number;
  location: string;
}

export default function AddGuestWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editGuestId = searchParams.get("guestId");
  const { user } = useAuth();

  // State
  const [isLoading, setIsLoading] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [primaryGuest, setPrimaryGuest] = useState<Guest | null>(null);
  const [isAdditionalGuest, setIsAdditionalGuest] = useState(false);
  const [showAddMoreModal, setShowAddMoreModal] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);

  // Temporary storage for Aadhaar Guest IDs for payload generation
  const [aadhaarGuestIds, setAadhaarGuestIds] = useState<number[]>([]);

  // Address State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );

  // Load Addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await roomService.getAddresses();
        if (response?.code === 200 && Array.isArray(response.data)) {
          setAddresses(response.data);
          // If only 1 address, auto-select it
          if (response.data.length === 1) {
            const id = response.data[0].id;
            setSelectedAddressId(id);
            // We'll trigger fetchRooms via useEffect depending on selectedAddressId
          }
        }
      } catch (error) {}
    };

    if (user) {
      fetchAddresses();
    }
  }, [user]);

  // Load Rooms when Address Changes
  useEffect(() => {
    if (selectedAddressId) {
      const fetchRooms = async () => {
        try {
          // Fetch all rooms for this address (pagination high limit or specific endpoint?)
          // Since this is for a dropdown, we need ALL avail rooms.
          // Currently getRooms supports pagination. We might need a large limit.
          const payload = {
            address_id: selectedAddressId,
            page: 1,
            record_count: 1000, // Temporary workaround to get all
          };
          const response = await roomService.getRooms(payload);
          if (response?.code === 200) {
            const fetchedRooms: Room[] = [];
            if (Array.isArray(response.data.data)) {
              response.data.data.forEach((group: any) => {
                if (Array.isArray(group.room_ranges)) {
                  group.room_ranges.forEach((r: any) => {
                    fetchedRooms.push({
                      id: r.id?.toString(),
                      wing: group.wing,
                      number: r.room_no.toString(),
                      floor: group.floor_no?.toString() || "",
                      type: group.room_type,
                      status: r.is_available ? "available" : "occupied",
                      address: "Selected Address", // Not strictly needed here
                    });
                  });
                }
              });
            }
            setRooms(fetchedRooms);
          }
        } catch (error) {}
      };
      fetchRooms();
    } else {
      setRooms([]);
    }
  }, [selectedAddressId]);

  // Load Guest Data for Edit
  useEffect(() => {
    if (editGuestId) {
      // TODO: Fetch guest details from API using editGuestId
      // Since local storage is removed, we cannot load data from it.
      // We need an endpoint to fetch guest/booking details by ID.
      // Example: const response = await hotelService.getGuestDetails(editGuestId);

      console.warn(
        "Edit functionality requires API implementation for fetching guest details.",
      );
      toast.info(
        "Edit functionality is currently disabled pending API implementation.",
      );
    }
  }, [editGuestId]);

  // Validation Schemas per step
  const validationSchemas = [
    Yup.object({
      addressId:
        addresses.length > 1
          ? Yup.mixed().required("Address is required")
          : Yup.mixed(),
      roomNumber: Yup.string().required("Room is required"),
      checkInDate: Yup.string().required("Check-in Date is required"),
      checkInTime: Yup.string().required("Check-in Time is required"),
      noOfAdult: Yup.number(),
      noOfChild: Yup.number(),
    }),
    // Step 2 (Identity) Schema
    Yup.object({
      // Basic details
      firstName: Yup.string().required("First Name is required"),
      // lastName: Yup.string().required("Last Name is required"),
      isPrimary: Yup.boolean(),
      profileImage: Yup.string().required("Profile Image is required"),

      // Standard Fields
      gender: Yup.string().required("Gender is required"),
      dateOfBirth: Yup.string().required("Date of Birth is required"),
      mobileNo: Yup.string().required("Mobile Number is required"),

      // Address
      address: Yup.string().required("Address is required"),
      city: Yup.string().required("City is required"),
      state: Yup.string().required("State is required"),
      district: Yup.string().required("District is required"),
      zipCode: Yup.string().required("Zip Code is required"),

      // Manual Document Validation
      verificationMethod: Yup.string(),
      manualEntryReason: Yup.string(),

      // Foreigner
      nationality: Yup.string().when("manualEntryReason", {
        is: "foreigner",
        then: (schema) => schema.required("Nationality is required"),
      }),
      passportNo: Yup.string().when("manualEntryReason", {
        is: "foreigner",
        then: (schema) => schema.required("Passport Number is required"),
      }),
      visaExpiryDate: Yup.string().when("manualEntryReason", {
        is: "foreigner",
        then: (schema) => schema.required("Visa Expiry Date is required"),
      }),
      passportImage: Yup.string().when("manualEntryReason", {
        is: "foreigner",
        then: (schema) => schema.required("Passport Image is required"),
      }),
      visaImage: Yup.string().when("manualEntryReason", {
        is: "foreigner",
        then: (schema) => schema.required("Visa Image is required"),
      }),

      // Indian Manual (Chained When)
      documentType: Yup.string().when("verificationMethod", {
        is: "manual",
        then: (schema) =>
          schema.when("manualEntryReason", {
            is: (reason: string) => reason !== "foreigner",
            then: (s) => s.required("Document Type is required"),
          }),
      }),
      documentNumber: Yup.string().when("verificationMethod", {
        is: "manual",
        then: (schema) =>
          schema.when("manualEntryReason", {
            is: (reason: string) => reason !== "foreigner",
            then: (s) => s.required("Document Number is required"),
          }),
      }),

      // Document Images (Indian)
      aadhaarFront: Yup.string().when("verificationMethod", {
        is: "manual",
        then: (schema) =>
          schema.when("manualEntryReason", {
            is: (reason: string) => reason !== "foreigner",
            then: (s) =>
              s.test(
                "doc-presence",
                "Document Image is required",
                function (value) {
                  const { aadhaarBack, documentImage } = this.parent;
                  if (documentImage) return true;
                  if (value && aadhaarBack) return true;
                  return false;
                },
              ),
          }),
      }),
    }),
  ];

  // Stable default values to prevent Formik re-initialization loop
  const defaultValues = useMemo(
    () => ({
      addressId: "",
      roomNumber: "",
      checkInDate: new Date().toISOString().split("T")[0],
      checkInTime: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      checkOutDate: "",
      checkOutTime: "",
      noOfAdult: 1,
      noOfChild: 0,
      vehicleType: "",
      vehicleRegNo: "",

      // Default Identity State
      residencyType: "Indian",
      verificationMethod: "quick_aadhaar",
      aadhaarVerified: false,

      firstName: "",
      middleName: "",
      lastName: "",
      profileImage: "",
      gender: "",
      dateOfBirth: "",
      address: "",
      city: "",
      state: "",
      district: "",
      zipCode: "",
      country: "India",

      documentType: "",
      documentNumber: "",
      documentImage: "",
      isPrimary: true,

      // Extended Aadhaar Defaults
      careOf: "",
      createdAt: "",
      credentialIssuingDate: "",
      enrolmentDate: "",
      enrolmentNumber: "",
      isNri: false,
      landmark: "",
      localBuilding: "",
      localCareOf: "",
      localDistrict: "",
      localLandmark: "",
      localLocality: "",
      localPoName: "",
      localResidentName: "",
      localState: "",
      localStreet: "",
      localSubDistrict: "",
      localVtc: "",
      locality: "",
      maskedEmail: "",
      maskedMobile: "",
      poName: "",
      regionalAddress: "",
      street: "",
      subDistrict: "",
      transactionId: "",
      updatedAt: "",
      vtc: "",
      aadhaarGuestId: undefined,

      // Manual Entry
      manualEntryReason: "",
      nationality: "",
      passportNo: "",
      visaExpiryDate: "",
      passportImage: "",
      visaImage: "",
      aadhaarFront: "",
      aadhaarBack: "",
      foreignDocumentType: "",

      // Face Verification Config (Step 1)
      faceVerification: false,
    }),
    [],
  );

  // Helper to construct Guest Check-In Payload (Aadhaar Flow)
  const generateGuestCheckInPayload = (
    currentBookingId: string,
    currentRoomNumber: string,
    verifiedGuestIds: number[],
  ) => {
    // 1. Find the current booking
    const bookings = JSON.parse(localStorage.getItem("pathikBookings") || "[]");
    const booking = bookings.find((b: Booking) => b.id === currentBookingId);
    if (!booking) {
      // console.error("Booking not found for payload generation");
      return null;
    }

    // 2. Validate Guest IDs
    if (verifiedGuestIds.length === 0) {
      return null;
    }

    // 3. Format Date/Time to UTC
    const formatToUTC = (dateStr: string, timeStr: string) => {
      // Return empty string if date is missing (e.g. valid checkout date check)
      if (!dateStr) return "";

      // Combine date and time
      const dateTime = new Date(`${dateStr}T${timeStr}`);
      // Get UTC parts
      const year = dateTime.getUTCFullYear();
      const month = String(dateTime.getUTCMonth() + 1).padStart(2, "0");
      const day = String(dateTime.getUTCDate()).padStart(2, "0");
      const hours = String(dateTime.getUTCHours()).padStart(2, "0");
      const minutes = String(dateTime.getUTCMinutes()).padStart(2, "0");
      const seconds = String(dateTime.getUTCSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const guests = JSON.parse(localStorage.getItem("pathikGuests") || "[]");
    const primary =
      guests.find(
        (g: Guest) => g.bookingId === currentBookingId && g.isPrimary,
      ) || guests[0];

    const payload = {
      address_id: selectedAddressId || 0,
      room_id: Number(currentRoomNumber),
      check_in_date: formatToUTC(booking.checkInDate, booking.checkInTime),
      check_out_date: formatToUTC(booking.checkOutDate, booking.checkOutTime),
      no_of_adults: Number(booking.noOfAdult),
      no_of_children: Number(booking.noOfChild),
      vehicle_details: {
        vehicle_type: primary?.vehicleType || "",
        vehicle_number: primary?.vehicleRegNo || "",
      },
      guest_ids: verifiedGuestIds,
    };

    return payload;
  };

  const formik = useFormik({
    initialValues: initialData || defaultValues,
    enableReinitialize: true, // Allow form to update when initialData loads
    validationSchema: validationSchemas[currentStep - 1],
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: (values) => {
      handleStepSubmit(values);
    },
  });

  // Handle Address Change from Form
  // We need to sync this state for fetching
  useEffect(() => {
    if (formik.values.addressId) {
      setSelectedAddressId(Number(formik.values.addressId));
    } else if (!selectedAddressId && addresses.length === 1) {
      // Sync form with auto-selected
      formik.setFieldValue("addressId", addresses[0].id);
    }
  }, [formik.values.addressId, addresses]);

  // ... rest of handlers ...

  const handleNext = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length === 0) {
      handleStepSubmit(formik.values);
    } else {
      formik.setTouched(
        Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
      );
      toast.error("Please fill all required fields correctly.");
    }
  };

  const handleStepSubmit = (values: any) => {
    if (editGuestId || currentStep === 2) {
      saveGuest(values);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const saveGuest = async (values: any) => {
    const currentEditId = searchParams.get("guestId");

    if (currentEditId) {
      // UPDATE EXISTING GUEST
      const allGuests = JSON.parse(
        localStorage.getItem("pathikGuests") || "[]",
      );
      const updatedGuests = allGuests.map((g: Guest) => {
        if (g.id === currentEditId) {
          return {
            ...g,
            ...values, // Helper to spread updates
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            mobileNo: values.mobileNo,
            purpose: values.purpose,

            dateOfBirth: values.dateOfBirth,
            gender: values.gender,
            address: values.address,
            city: values.city,
            state: values.state,
            district: values.district,
            zipCode: values.zipCode,
            country: values.country,

            documentType: values.documentType,
            documentNumber: values.documentNumber,
            documentImage: values.documentImage,

            roomNumber: values.roomNumber,
            checkInDate: values.checkInDate,
            checkInTime: values.checkInTime,
            checkOutDate: values.checkOutDate,
            checkOutTime: values.checkOutTime,
            aadhaarGuestId: values.aadhaarGuestId,
          };
        }
        return g;
      });

      localStorage.setItem("pathikGuests", JSON.stringify(updatedGuests));

      if (bookingId) {
        const allBookings = JSON.parse(
          localStorage.getItem("pathikBookings") || "[]",
        );
        const updatedBookings = allBookings.map((b: Booking) => {
          if (b.id === bookingId) {
            return {
              ...b,
              checkInDate: values.checkInDate,
              checkOutDate: values.checkOutDate,
              noOfAdult: values.noOfAdult,
              noOfChild: values.noOfChild,
            };
          }
          return b;
        });
        localStorage.setItem("pathikBookings", JSON.stringify(updatedBookings));
      }

      toast.success("Guest updated successfully!");
      router.push("/dashboard/guests");
      return;
    }

    // CREATE NEW GUEST (Original Logic)
    const guestId = `GUEST-${Date.now()}`;

    // 1. Create/Update Booking
    let currentBookingId = bookingId;
    if (!currentBookingId) {
      setBookingId(currentBookingId);

      const newBooking: Booking = {
        id: currentBookingId || "",
        primaryGuestId: guestId,
        roomNumber: values.roomNumber,
        checkInDate: values.checkInDate,
        checkInTime: values.checkInTime,
        checkOutDate: values.checkOutDate,
        checkOutTime: values.checkOutTime,
        status: "active",
        guestIds: [guestId],
        purpose: values.purpose,
        noOfAdult: values.noOfAdult,
        noOfChild: values.noOfChild,
      };

      // Save Booking
      const existingBookings = JSON.parse(
        localStorage.getItem("pathikBookings") || "[]",
      );
      localStorage.setItem(
        "pathikBookings",
        JSON.stringify([...existingBookings, newBooking]),
      );

      // Mark Room as Occupied
      const updatedRooms = rooms.map((r) =>
        r.id === values.roomNumber ? { ...r, status: "occupied" } : r,
      );
      setRooms(updatedRooms as Room[]); // Cast for safety
      localStorage.setItem("pathikRooms", JSON.stringify(updatedRooms));
    } else {
      // Add to existing booking
      const existingBookings = JSON.parse(
        localStorage.getItem("pathikBookings") || "[]",
      );
      const updatedBookings = existingBookings.map((b: Booking) => {
        if (b.id === currentBookingId) {
          return { ...b, guestIds: [...b.guestIds, guestId] };
        }
        return b;
      });
      localStorage.setItem("pathikBookings", JSON.stringify(updatedBookings));
    }

    // 2. Create Guest
    const newGuest: Guest = {
      id: guestId,
      bookingId: currentBookingId!,
      firstName: values.firstName,
      lastName: values.lastName,
      dateOfBirth: values.dateOfBirth,
      gender: values.gender,
      mobileNo: values.mobileNo,
      email: values.email,

      address: values.address,
      city: values.city,
      state: values.state,
      district: values.district,
      country: values.country,
      zipCode: values.zipCode,

      vehicleType: values.vehicleType,
      vehicleRegNo: values.vehicleRegNo,

      residencyType: values.residencyType,
      verificationMethod: values.verificationMethod,
      documentType: values.documentType,
      documentNumber: values.documentNumber,
      documentImage: values.documentImage,
      status: "active",

      // Save Booking Details directly on Guest for easier access (Denormalization)
      roomNumber: values.roomNumber,
      checkInDate: values.checkInDate,
      checkInTime: values.checkInTime,
      checkOutDate: values.checkOutDate,
      checkOutTime: values.checkOutTime,
      purpose: values.purpose,
      noOfAdult: values.noOfAdult,
      noOfChild: values.noOfChild,

      aadhaarGuestId: values.aadhaarGuestId,
    };

    // MANUAL ENTRY API CALL
    if (values.verificationMethod === "manual" && values.manualEntryReason) {
      try {
        setIsLoading(true);
        const isForeign = values.manualEntryReason === "foreigner";
        const manualPayload: any = {
          manual_entry_reason: values.manualEntryReason,
          profile_image: values.profileImage,
          first_name: values.firstName,
          last_name: values.lastName,
          middle_name: values.middleName,
          gender: values.gender,
          dob: values.dateOfBirth,
          mobile: values.mobileNo,
          address: values.address,
          city: values.city,
          state: values.state,
          district: values.district,
          pincode: values.zipCode,
          // If foreign, use nationality (ID), else 101 (India)
          country_id: isForeign ? values.nationality : 101,

          // Foreigner Specifics
          visa_expiry_date: isForeign ? values.visaExpiryDate : undefined,
          foreign_passport_image: isForeign ? values.passportImage : undefined,
          foreign_visa_image: isForeign ? values.visaImage : undefined,
          foreign_document_type: isForeign ? "Passport" : undefined,
          passport_no: isForeign ? values.passportNo : undefined,
          document_no: values.documentNumber,
          // Indian Specifics
          document_type_id: !isForeign ? values.documentType : 0,
          document_files: [],
        };

        if (!isForeign) {
          // Flatten document images
          if (values.aadhaarBack && values.aadhaarFront) {
            // For Aadhaar, ensure both are sent
            manualPayload.document_files = [
              values.aadhaarFront,
              values.aadhaarBack,
            ];
          } else if (values.documentImage) {
            manualPayload.document_files = [values.documentImage];
          }
        }

        const response = await hotelService.addManualGuest(manualPayload);
        if (response && response.data && response.data.id) {
          // Add the new ID to aadhaarGuestIds
          setAadhaarGuestIds((prev) => [Number(response.data.id), ...prev]);
          // Store in local guest for reference if needed? (optional, but Guest object in local storage is separate from IDs used for checkin)
          newGuest.aadhaarGuestId = response.data.id;
        } else {
          toast.error("Failed to save manual guest to server.");
          setIsLoading(false);
          return; // Prevent success modal
        }
      } catch (e) {
        // console.error("Manual Guest Add Error", e);
        setIsLoading(false);
        return; // Stop flow
      } finally {
        setIsLoading(false);
      }
    }

    // Store Aadhaar Guest ID temporarily if available (from Quick Aadhaar)
    if (values.aadhaarGuestId) {
      setAadhaarGuestIds((prev) => [Number(values.aadhaarGuestId), ...prev]);
    }

    toast.success(
      isAdditionalGuest
        ? "Additional Guest Added!"
        : "Primary Guest Checked In!",
    );

    // Prompt for more
    setShowAddMoreModal(true);
    if (!primaryGuest) setPrimaryGuest(newGuest);
  };

  const handleAddAnother = () => {
    setIsAdditionalGuest(true);
    setShowAddMoreModal(false);
    setCurrentStep(2); // Skip Step 1 (Basic & Booking)

    // Reset form but keep Booking details
    if (primaryGuest) {
      formik.resetForm({
        values: {
          ...formik.initialValues,
          roomNumber: formik.values.roomNumber, // Lock Room
          checkInDate: formik.values.checkInDate,
          checkInTime: formik.values.checkInTime,
          purpose: formik.values.purpose,
          isPrimary: false,
        },
      });
    }
  };

  const handleFinish = async () => {
    try {
      setIsLoading(true);
      // 1. Check for Aadhaar Verification (Guest Check-In API)
      // We need to check if there are any guests with aadhaarGuestId for the current booking/room

      // Use the current form values for booking ID and room number context
      const currentBookingId = formik.values.bookingId;
      const currentRoomNumber = formik.values.roomNumber;

      // Now aadhaarGuestIds contains both Quick Aadhaar IDs and Manual Guest IDs
      const aadhaarPayload = generateGuestCheckInPayload(
        currentBookingId || "", // specific booking ID
        currentRoomNumber || "", // specific room number
        aadhaarGuestIds,
      );

      if (aadhaarPayload) {
        // This implies we have guests verified via Aadhaar for this session
        await hotelService.guestCheckIn(aadhaarPayload);
        toast.success("Guest Check-in Synced with Server!");
      }
      setIsLoading(false);
      router.push("/dashboard/guests");
    } catch (error) {
      // console.error("Error finalizing check-in:", error);
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-9xl p-0 md:p-4 animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-pathik-primary transition-all"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-pathik-text-dark">
            {isAdditionalGuest ? "Add Additional Guest" : "Guest Check-In"}
          </h1>
          <p className="text-pathik-text-light text-sm">
            {isAdditionalGuest
              ? `Adding guest to Room ${formik.values.roomNumber}`
              : "Edit guest entry"}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex justify-between relative mb-12 max-w-xl mx-auto">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 -translate-y-1/2 rounded-full"></div>
        <div
          className="absolute top-1/2 left-0 h-1 bg-pathik-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-500"
          style={{ width: `${((currentStep - 1) / 1) * 100}%` }}
        ></div>
        {[1, 2].map((step) => (
          <div
            key={step}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border-4 bg-white
                    ${currentStep >= step ? "border-pathik-primary text-pathik-primary" : "border-gray-200 text-gray-400"}
                    ${currentStep === step ? "scale-110 shadow-md" : ""}
                    ${isAdditionalGuest && step === 1 ? "opacity-50 cursor-not-allowed" : ""}
                `}
          >
            {step}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <FormikProvider value={formik}>
        <div className="bg-white rounded-2xl shadow-sm border border-pathik-border p-8 min-h-[400px]">
          {currentStep === 1 && (
            <Step1Basic
              rooms={rooms}
              addresses={addresses}
              isEditMode={!!editGuestId}
            />
          )}
          {currentStep === 2 && <Step3Identity />}
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => setCurrentStep((prev) => prev - 1)}
            disabled={
              currentStep === 1 ||
              (isAdditionalGuest && currentStep === 2) ||
              !!editGuestId
            }
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
              currentStep === 1 ||
              (isAdditionalGuest && currentStep === 2) ||
              !!editGuestId
                ? "opacity-0 pointer-events-none"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <i className="fas fa-arrow-left mr-2"></i> Back
          </button>

          <button
            onClick={handleNext}
            disabled={isLoading}
            className="md:px-8 px-4 py-3 rounded-lg bg-linear-to-r from-pathik-primary to-pathik-secondary text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Processing...
              </>
            ) : editGuestId ? (
              <>
                Update Guest <i className="fas fa-save"></i>
              </>
            ) : currentStep === 2 ? (
              <>
                Complete Check-In <i className="fas fa-check"></i>
              </>
            ) : (
              <>
                Next Step <i className="fas fa-arrow-right"></i>
              </>
            )}
          </button>
        </div>
      </FormikProvider>

      {/* Add More Modal */}
      {showAddMoreModal && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease]">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center animate-[scaleIn_0.3s_ease]">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              <i className="fas fa-check"></i>
            </div>
            <h2 className="text-2xl font-bold text-pathik-text-dark mb-2">
              Check-in Successful!
            </h2>
            <p className="text-gray-500 mb-8">
              The guest has been successfully registered to Room{" "}
              <strong>
                {rooms.find(
                  (r) => String(r.id) === String(formik.values.roomNumber),
                )?.number || formik.values.roomNumber}
              </strong>
              .
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleAddAnother}
                className="w-full py-3.5 rounded-xl bg-pathik-primary text-white font-bold shadow-md hover:bg-pathik-primary/90 transition-all"
              >
                <i className="fas fa-user-plus mr-2"></i> Add Another Guest
                (Same Room)
              </button>

              <button
                onClick={handleFinish}
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-flag-checkered"></i> Finish & Go to
                    Dashboard
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
