import React from "react";
import { useFormikContext } from "formik";
import FormInput from "@/app/components/FormInput";
import FormSelect from "@/app/components/FormSelect";
import { Room, GuestWizardValues } from "@/app/types";

interface Address {
  id: number;
  location: string;
}

interface Step1Props {
  rooms: Room[];
  addresses: Address[];
  isEditMode?: boolean;
}

const Step1Basic: React.FC<Step1Props> = ({
  rooms,
  addresses,
  isEditMode = false,
}) => {
  const { values } = useFormikContext<
    GuestWizardValues & { addressId: string | number }
  >();

  // Filter available rooms (include current room if editing)
  const availableRooms = rooms
    .filter(
      (r) =>
        r.status === "available" ||
        r.id === values.roomNumber ||
        r.number === values.roomNumber,
    ) // Check both ID and Number for backward compat or transition
    .map((r) => ({
      label: `${r.wing}-${r.number} (${r.type || "Room"})`,
      value: r.id.toString(), // Use ID as requested
    }));

  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <h2 className="text-xl font-bold text-pathik-text-dark mb-6 flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-pathik-primary text-white flex items-center justify-center text-sm">
          1
        </span>
        Basic & Booking Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Booking Details */}
        <div className="md:col-span-2 mt-2">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">
            Stay Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Show Address Dropdown if multiple addresses exist */}
            {addresses.length > 1 && (
              <FormSelect
                name="addressId"
                label="Select Address"
                placeholder="Choose Property Address"
                options={addresses.map((a) => ({
                  label: a.location,
                  value: a.id,
                }))}
                required
              />
            )}

            <FormSelect
              name="roomNumber"
              label="Select Room"
              placeholder={
                values.addressId || addresses.length <= 1
                  ? "Choose a room"
                  : "Select Address first"
              }
              options={availableRooms}
              required
              disabled={!values.addressId && addresses.length > 1}
            />

            {/* Spacer logic if needed for grid layout */}
            {addresses.length <= 1 && <div className="hidden md:block"></div>}

            <FormInput
              name="checkInDate"
              label="Check-in Date"
              type="date"
              required
              disabled={isEditMode}
            />
            <FormInput
              name="checkInTime"
              label="Check-in Time"
              type="time"
              required
              disabled={isEditMode}
            />
            <FormInput
              name="checkOutDate"
              label="Check-out Date (Optional)"
              type="date"
            />
            <FormInput
              name="checkOutTime"
              label="Check-out Time (Optional)"
              type="time"
            />
            <FormInput
              name="noOfAdult"
              label="No. of Adults"
              type="number"
              placeholder="1"
            />
            <FormInput
              name="noOfChild"
              label="No. of Children"
              type="number"
              placeholder="0"
            />
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="md:col-span-2 mt-2">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">
            Vehicle Details (Optional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              name="vehicleType"
              label="Vehicle Type"
              placeholder="e.g. Car, Bike"
            />
            <FormInput
              name="vehicleRegNo"
              label="Vehicle Registration No."
              placeholder="e.g. MH-01-AB-1234"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1Basic;
