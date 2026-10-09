"use client";
import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import { Staff } from "@/app/types";
import Link from "next/link";
// Components - Inline for now or creating separate files?
// I'll create separate files for cleanliness as requested in task breakdown.
import Step1BasicStaff from "./components/Step1BasicStaff";
import Step2IdentityStaff from "./components/Step2IdentityStaff";

export default function AddStaffWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role"); // "Owner" or "Manager"
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  const validationSchemas = [
    // ... validation schemas ...
    Yup.object({
      employeeType: Yup.string().required("Employee Type is required"),
      employeeTypeOther: Yup.string().when("employeeType", {
        is: "Other",
        then: (schema) => schema.required("Please specify the employee type"),
        otherwise: (schema) => schema.notRequired(),
      }),
      joinedDate: Yup.string().required("Joining Date is required"),
    }),
    // ...
    Yup.object({
      firstName: Yup.string().required("First Name is required"),
      lastName: Yup.string().required("Last Name is required"),
      mobileNo: Yup.string()
        .required("Mobile Number is required")
        .matches(/^[0-9]{10}$/, "Invalid Mobile Number"),
      documentType: Yup.string().required("Document Type is required"),
      documentNumber: Yup.string().required("Document Number is required"),
      // Add other required fields if necessary (Address etc.)
      address: Yup.string().required("Address is required"),
      city: Yup.string().required("City is required"),
      state: Yup.string().required("State is required"),
      zipCode: Yup.string().required("ZIP Code is required"),
      // Profile image might be optional or required depending on strictness. Let's make it optional for now to avoid blocking.
    }),
  ];

  const defaultValues = useMemo(
    () => ({
      firstName: "",
      middleName: "",
      lastName: "",
      employeeType:
        roleParam === "Manager"
          ? "Manager"
          : roleParam === "Owner"
            ? "Other"
            : "",
      employeeTypeOther: roleParam === "Owner" ? "Owner" : "",
      joinedDate: new Date().toISOString().split("T")[0],
      mobileNo: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      profileImage: "",

      // Identity
      residencyType: "Indian",
      verificationMethod: "quick_aadhaar",
      aadhaarVerified: false,
      documentType: "",
      documentNumber: "",
      documentImage: "",

      // Foreigner
      nationality: "",
      passportImage: "",
      visaImage: "",
      visaExpiryDate: "",

      status: "active",
    }),
    [roleParam],
  );

  const formik = useFormik({
    initialValues: defaultValues,
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
      saveStaff(values);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saveStaff = (values: any) => {
    const staffId = `STAFF-${Date.now()}`;
    const newStaff: Staff = {
      ...values,
      id: staffId,
    } as Staff;

    const existingStaff = JSON.parse(
      localStorage.getItem("pathikStaff") || "[]",
    );
    localStorage.setItem(
      "pathikStaff",
      JSON.stringify([...existingStaff, newStaff]),
    );

    toast.success("Staff Member Added Successfully!");
    router.push("/dashboard/staff");
  };

  if (!user) return null;

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
            Add New Staff
          </h1>
          <p className="text-pathik-text-light text-sm">
            Register a new employee
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
                `}
          >
            {step}
          </div>
        ))}
      </div>

      <FormikProvider value={formik}>
        <div className="bg-white rounded-2xl shadow-sm border border-pathik-border p-8 min-h-[400px]">
          {currentStep === 1 && <Step1BasicStaff />}
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
                Add Staff <i className="fas fa-check"></i>
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
