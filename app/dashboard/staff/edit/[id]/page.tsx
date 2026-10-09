"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { toast } from "react-toastify";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import { Staff } from "@/app/types";
import Link from "next/link";
import Step1BasicStaff from "../../add/components/Step1BasicStaff";
import Step2IdentityStaff from "../../add/components/Step2IdentityStaff";

export default function EditStaffPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const staffId = params.id as string;

  const [initialData] = useState<Staff | null>(() => {
    if (typeof window !== "undefined" && staffId) {
      const savedStaff = JSON.parse(
        localStorage.getItem("pathikStaff") || "[]",
      );
      return savedStaff.find((s: Staff) => s.id === staffId) || null;
    }
    return null;
  });

  useEffect(() => {
    // This useEffect is now solely for handling the redirect if staff is not found
    // after the initial data load.
    if (typeof window !== "undefined" && staffId && !initialData) {
      toast.error("Staff member not found");
      router.push("/dashboard/staff");
    }
  }, [initialData, staffId, router]);

  const validationSchemas = [
    Yup.object({
      employeeType: Yup.string().required("Employee Type is required"),
      employeeTypeOther: Yup.string().when("employeeType", {
        is: "Other",
        then: (schema) => schema.required("Please specify the employee type"),
        otherwise: (schema) => schema.notRequired(),
      }),
      joinedDate: Yup.string().required("Joining Date is required"),
      // exitDate is optional
    }),
    Yup.object({
      firstName: Yup.string().required("First Name is required"),
      lastName: Yup.string().required("Last Name is required"),
      mobileNo: Yup.string()
        .required("Mobile Number is required")
        .matches(/^[0-9]{10}$/, "Invalid Mobile Number"),
      documentType: Yup.string().required("Document Type is required"),
      documentNumber: Yup.string().required("Document Number is required"),
      address: Yup.string().required("Address is required"),
      city: Yup.string().required("City is required"),
      state: Yup.string().required("State is required"),
      zipCode: Yup.string().required("ZIP Code is required"),
    }),
  ];

  const formik = useFormik({
    initialValues: initialData || ({} as Staff),
    enableReinitialize: true,
    validationSchema: validationSchemas[currentStep - 1],
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: (values) => {
      handleStepSubmit(values);
    },
  });

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleStepSubmit = (values: any) => {
    if (currentStep < 2) {
      setCurrentStep((prev) => prev + 1);
    } else {
      updateStaff(values);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateStaff = (values: any) => {
    // Logic to update staff
    const existingStaff: Staff[] = JSON.parse(
      localStorage.getItem("pathikStaff") || "[]",
    );
    const updatedStaffList = existingStaff.map((s) => {
      if (s.id === staffId) {
        const updated = { ...s, ...values };
        // Check exitDate logic
        if (updated.exitDate) {
          updated.status = "inactive";
        } else {
          updated.status = "active";
        }
        return updated;
      }
      return s;
    });

    localStorage.setItem("pathikStaff", JSON.stringify(updatedStaffList));
    toast.success("Staff details updated successfully!");
    router.push("/dashboard/staff");
  };

  if (!user || !initialData) return null;

  return (
    <div className="max-w-9xl mx-auto p-4 animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard/staff"
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-pathik-primary transition-all"
        >
          <i className="fas fa-arrow-left"></i>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-pathik-text-dark">
            Edit Staff
          </h1>
          <p className="text-pathik-text-light text-sm">Update staff details</p>
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
                `}
          >
            {step}
          </div>
        ))}
      </div>

      <FormikProvider value={formik}>
        <div className="bg-white rounded-2xl shadow-sm border border-pathik-border p-8 min-h-[400px]">
          {/* We pass isEditMode=true to Step1 */}
          {currentStep === 1 && <Step1BasicStaff isEditMode={true} />}
          {currentStep === 2 && <Step2IdentityStaff />}
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => setCurrentStep((prev) => prev - 1)}
            disabled={currentStep === 1}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${currentStep === 1 ? "opacity-0 pointer-events-none" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <i className="fas fa-arrow-left mr-2"></i> Back
          </button>

          <button
            onClick={handleNext}
            className="px-8 py-3 rounded-lg bg-linear-to-r from-pathik-primary to-pathik-secondary text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            {currentStep === 2 ? (
              <>
                Update Staff <i className="fas fa-check"></i>
              </>
            ) : (
              <>
                Next Step <i className="fas fa-arrow-right"></i>
              </>
            )}
          </button>
        </div>
      </FormikProvider>
    </div>
  );
}
