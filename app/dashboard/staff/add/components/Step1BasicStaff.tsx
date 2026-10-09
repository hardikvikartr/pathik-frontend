import React from "react";
import FormInput from "@/app/components/FormInput";
import FormSelect from "@/app/components/FormSelect";
import { useFormikContext } from "formik";
import { Staff } from "@/app/types";

// Helper type for Formik context since we don't have a specific StaffValues interface widely unused yet,
// but we can use Staff or any
interface Step1Props {
  isEditMode?: boolean;
}

export default function Step1BasicStaff({ isEditMode = false }: Step1Props) {
  const { values } = useFormikContext<Staff>();

  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <h2 className="text-xl font-bold text-pathik-text-dark mb-6 flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-pathik-primary text-white flex items-center justify-center text-sm">
          1
        </span>
        Staff Role
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect
            name="employeeType"
            label="Employee Type"
            options={[
              { label: "Manager", value: "Manager" },
              { label: "Waiter", value: "Waiter" },
              { label: "Cook / Chef", value: "Cook" },
              { label: "Housekeeping", value: "Housekeeping" },
              { label: "Receptionist", value: "Receptionist" },
              { label: "Security", value: "Security" },
              { label: "Other", value: "Other" },
            ]}
            required
          />

          {values.employeeType === "Other" && (
            <FormInput
              name="employeeTypeOther"
              label="Specify Other Type"
              placeholder="e.g. Valet"
              required
            />
          )}
        </div>

        <FormInput
          name="joinedDate"
          label="Joining Date"
          type="date"
          required
        />

        {isEditMode && (
          <FormInput name="exitDate" label="Exit Date" type="date" />
        )}
      </div>
    </div>
  );
}
