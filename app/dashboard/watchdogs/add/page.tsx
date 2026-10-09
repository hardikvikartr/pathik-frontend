"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { Watchdog } from "@/app/types";
import { toast } from "react-toastify";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import FormInput from "@/app/components/FormInput";
import FormSelect from "@/app/components/FormSelect";

export default function AddWatchdog() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role !== "SUPER_ADMIN" && user.role !== "POLICE_STATION") {
      router.push("/dashboard");
      toast.error("You are not authorized to add watchdog");
    }
  }, [user, router]);

  const validationSchema = Yup.object({
    watchdogTitle: Yup.string().required("Watchdog title is required"),
    personName: Yup.string().required("Person Name is required"),

    contact1: Yup.string()
      .matches(/^\d{10}$/, "Must be 10 digits")
      .required("Contact number is required"),
    contact2: Yup.string().matches(/^\d{10}$/, "Must be 10 digits"),
    contact3: Yup.string().matches(/^\d{10}$/, "Must be 10 digits"),

    email1: Yup.string().email("Invalid email"),
    email2: Yup.string().email("Invalid email"),

    aadhaar: Yup.string().matches(/^\d{12}$/, "Aadhaar must be 12 digits"),
    pan: Yup.string(),
    votingCard: Yup.string(),
    drivingLicence: Yup.string(),
    passport: Yup.string(),

    country: Yup.string().required("Country required"),
    state: Yup.string().required("State required"),
    district: Yup.string().required("District required"),
    city: Yup.string().required("City required"),

    startDate: Yup.string().required("Start Date required"),
    endDate: Yup.string(),

    reportingOfficerName: Yup.string().required("Officer Name required"),
    reportingOfficerNo: Yup.string().matches(/^\d{10}$/, "Must be 10 digits"),
    reportingOfficerEmail: Yup.string().email("Invalid email"),

    status: Yup.string().required(),
  });

  const indianStates = [
    { label: "Gujarat", value: "Gujarat" },
    { label: "Maharashtra", value: "Maharashtra" },
    { label: "Rajasthan", value: "Rajasthan" },
    { label: "Delhi", value: "Delhi" },
    { label: "Karnataka", value: "Karnataka" },
    { label: "Tamil Nadu", value: "Tamil Nadu" },
    { label: "Uttar Pradesh", value: "Uttar Pradesh" },
    { label: "Madhya Pradesh", value: "Madhya Pradesh" },
    { label: "Punjab", value: "Punjab" },
    { label: "Haryana", value: "Haryana" },
  ];

  const formik = useFormik({
    initialValues: {
      watchdogTitle: "",
      personName: "",

      contact1: "",
      contact2: "",
      contact3: "",

      email1: "",
      email2: "",

      aadhaar: "",
      pan: "",
      votingCard: "",
      drivingLicence: "",
      passport: "",

      country: "India",
      state: "",
      district: "",
      city: "",

      startDate: "",
      endDate: "",

      reportingOfficerName: "",
      reportingOfficerNo: "",
      reportingOfficerEmail: "",

      status: "Active",
    },
    validationSchema,
    onSubmit: (values) => {
      const newWatchdog: Watchdog = {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        ...values,
        // Handle optional empty strings
        email1: values.email1 || "",
        email2: values.email2 || "",
        passport: values.passport || "",
        endDate: values.endDate || undefined,
      };

      const existing = JSON.parse(
        localStorage.getItem("pathikWatchdogs") || "[]",
      );
      localStorage.setItem(
        "pathikWatchdogs",
        JSON.stringify([newWatchdog, ...existing]),
      );

      toast.success("Watchdog added successfully");
      router.push("/dashboard/watchdogs");
    },
  });

  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "POLICE_STATION"))
    return null;

  return (
    <div className="animate-[fadeIn_0.5s_ease-out] max-w-9xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-pathik-primary hover:scale-110 transition-all"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-pathik-text-dark">
            Add New Watchdog
          </h1>
          <p className="text-pathik-text-light text-sm">
            Add an individual to the watchlist for monitoring
          </p>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form
          onSubmit={formik.handleSubmit}
          className="bg-white rounded-xl shadow-sm overflow-hidden border border-pathik-border"
        >
          {/* Identity Section */}
          <div className="p-8 border-b border-pathik-border">
            <h2 className="text-lg font-bold text-pathik-text-dark mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-pathik-primary/10 text-pathik-primary flex items-center justify-center text-sm">
                <i className="fas fa-id-card"></i>
              </span>
              Basic & Identity Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormInput
                name="watchdogTitle"
                label="Watchdog Title"
                placeholder="e.g. Serial Offender"
                required
              />
              <FormInput
                name="personName"
                label="Person Name"
                placeholder="Full Name"
                required
              />
              <FormInput
                name="aadhaar"
                label="Aadhaar Card ID"
                restrict="digitsOnly"
                placeholder="12-digit Aadhaar"
              />
              <FormInput
                name="pan"
                label="PAN Card ID"
                placeholder="ABCDE1234F"
              />
              <FormInput name="votingCard" label="Voting Card ID" />
              <FormInput name="drivingLicence" label="Driving Licence" />
              <FormInput name="passport" label="Passport No" />
            </div>
          </div>

          {/* Contact Section */}
          <div className="p-8 border-b border-pathik-border bg-gray-50/50">
            <h2 className="text-lg font-bold text-pathik-text-dark mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-pathik-primary/10 text-pathik-primary flex items-center justify-center text-sm">
                <i className="fas fa-address-book"></i>
              </span>
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormInput
                name="contact1"
                label="Primary Contact"
                restrict="digitsOnly"
                required
              />
              <FormInput
                name="contact2"
                label="Secondary Contact"
                restrict="digitsOnly"
              />
              <FormInput
                name="contact3"
                label="Alternate Contact"
                restrict="digitsOnly"
              />

              <FormInput name="email1" label="Email ID 1" type="email" />
              <FormInput name="email2" label="Email ID 2" type="email" />
            </div>
          </div>

          {/* Location Section */}
          <div className="p-8 border-b border-pathik-border">
            <h2 className="text-lg font-bold text-pathik-text-dark mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-pathik-primary/10 text-pathik-primary flex items-center justify-center text-sm">
                <i className="fas fa-map-marker-alt"></i>
              </span>
              Location Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormSelect
                name="country"
                label="Country"
                options={[{ label: "India", value: "India" }]}
              />

              <FormSelect
                name="state"
                label="State"
                options={indianStates}
                required
              />

              <FormInput name="district" label="District" required />
              <FormInput name="city" label="City" required />
            </div>
          </div>

          {/* Monitoring Details */}
          <div className="p-8 border-b border-pathik-border bg-gray-50/50">
            <h2 className="text-lg font-bold text-pathik-text-dark mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-pathik-primary/10 text-pathik-primary flex items-center justify-center text-sm">
                <i className="fas fa-user-secret"></i>
              </span>
              Monitoring & Officer Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormInput
                name="startDate"
                label="Start Date"
                type="date"
                required
              />
              <FormInput name="endDate" label="End Date" type="date" />

              <FormInput
                name="reportingOfficerName"
                label="Reporting Officer Name"
                required
              />
              <FormInput
                name="reportingOfficerNo"
                label="Reporting Officer No"
                restrict="digitsOnly"
              />
              <FormInput
                name="reportingOfficerEmail"
                label="Reporting Officer Email"
                type="email"
              />
            </div>
          </div>

          {/* Status Section */}
          <div className="p-8 border-b border-pathik-border">
            <h2 className="text-lg font-bold text-pathik-text-dark mb-4">
              Status
            </h2>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="Active"
                  onChange={formik.handleChange}
                  checked={formik.values.status === "Active"}
                  className="w-4 h-4 text-pathik-primary focus:ring-pathik-primary"
                />
                <span>Active</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="Deactive"
                  onChange={formik.handleChange}
                  checked={formik.values.status === "Deactive"}
                  className="w-4 h-4 text-pathik-primary focus:ring-pathik-primary"
                />
                <span>Deactive</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-6 bg-gray-50 border-t border-pathik-border flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-linear-to-r from-pathik-primary to-pathik-secondary text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <i className="fas fa-save"></i>
              Save Watchdog
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
}
