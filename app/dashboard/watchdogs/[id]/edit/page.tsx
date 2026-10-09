"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { Watchdog } from "@/app/types";
import { toast } from "react-toastify";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import FormInput from "@/app/components/FormInput";
import FormSelect from "@/app/components/FormSelect";

export default function EditWatchdog({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Unwrap params
  const resolvedParams = use(params);

  useEffect(() => {
    if (user && user.role !== "SUPER_ADMIN" && user.role !== "POLICE_STATION") {
      router.push("/dashboard");
      return;
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
      const watchdogs: Watchdog[] = JSON.parse(
        localStorage.getItem("pathikWatchdogs") || "[]",
      );

      const updatedWatchdogs = watchdogs.map((w) => {
        if (String(w.id) === resolvedParams.id) {
          return {
            ...w,
            ...values,
            // Handle optional empty strings
            email1: values.email1 || "",
            email2: values.email2 || "",
            passport: values.passport || "",
            endDate: values.endDate || undefined,
          };
        }
        return w;
      });

      localStorage.setItem("pathikWatchdogs", JSON.stringify(updatedWatchdogs));

      toast.success("Watchdog updated successfully");
      router.push("/dashboard/watchdogs");
    },
  });

  useEffect(() => {
    // Load Data
    const watchdogs: Watchdog[] = JSON.parse(
      localStorage.getItem("pathikWatchdogs") || "[]",
    );
    const found = watchdogs.find((w) => String(w.id) === resolvedParams.id);

    if (found) {
      formik.setValues({
        watchdogTitle: found.watchdogTitle || "",
        personName: found.personName,

        contact1: found.contact1,
        contact2: found.contact2 || "",
        contact3: found.contact3 || "",

        email1: found.email1 || "",
        email2: found.email2 || "",

        aadhaar: found.aadhaar || "",
        pan: found.pan || "",
        votingCard: found.votingCard || "",
        drivingLicence: found.drivingLicence || "",
        passport: found.passport || "",

        country: found.country,
        state: found.state,
        district: found.district,
        city: found.city,

        startDate: found.startDate,
        endDate: found.endDate || "",

        reportingOfficerName: found.reportingOfficerName,
        reportingOfficerNo: found.reportingOfficerNo || "",
        reportingOfficerEmail: found.reportingOfficerEmail || "",

        status: found.status,
      });
    } else {
      toast.error("Watchdog not found");
      router.push("/dashboard/watchdogs");
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id]);

  if (loading)
    return <div className="p-8 text-center animate-pulse">Loading...</div>;

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
            Edit Watchdog
          </h1>
          <p className="text-pathik-text-light text-sm">
            Update monitoring details for {formik.values.personName}
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
              <FormInput name="watchdogTitle" label="Watchdog Title" required />
              <FormInput name="personName" label="Person Name" required />
              <FormInput
                name="aadhaar"
                label="Aadhaar Card ID"
                restrict="digitsOnly"
              />
              <FormInput name="pan" label="PAN Card ID" />
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
                label="Contact Number 1"
                restrict="digitsOnly"
                required
              />
              <FormInput
                name="contact2"
                label="Contact Number 2"
                restrict="digitsOnly"
              />
              <FormInput
                name="contact3"
                label="Contact Number 3"
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
              Update Watchdog
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
}
