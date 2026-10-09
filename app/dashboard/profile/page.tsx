"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { useFormik, FormikProvider, useField } from "formik";
import * as Yup from "yup";
import { Hotel, HotelCompliance } from "@/app/types";
import FormInput from "@/app/components/FormInput";
import FormSelect from "@/app/components/FormSelect";
import hotelService from "@/app/services/hotel/hotelService";

// Helper components for File Upload and Checkbox Group
const FileUpload = ({
  name,
  label,
  required = false,
  documentType = "HOTEL_ALL_IMAGES",
}: {
  name: string;
  label: string;
  required?: boolean;
  documentType?: string;
}) => {
  const [field, meta, helpers] = useField(name);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    const toastId = toast.loading(`Uploading ${label}...`);
    try {
      const response = await hotelService.uploadDocument(file, documentType);

      // Check for array response structure as per user request
      if (
        response &&
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        const { file: fileData, message } = response.data[0];

        // Store only the filename in the form
        helpers.setValue(fileData.filename);

        toast.update(toastId, {
          render: message || `${label} uploaded successfully!`,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
      } else if (response && response.data) {
        // Fallback for previous structure if any
        helpers.setValue(response.data);
        toast.update(toastId, {
          render: `${label} uploaded successfully!`,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
      } else {
        toast.update(toastId, {
          render: "Upload failed.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (error) {
      toast.update(toastId, {
        render: "Failed to upload document",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1 text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors relative">
        <input
          type="file"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
          accept=".pdf,.jpg,.jpeg,.png"
        />
        {field.value ? (
          <div className="text-green-600 font-bold flex items-center justify-center gap-2">
            <i className="fas fa-check-circle"></i> File Uploaded
          </div>
        ) : (
          <div className="text-gray-400 text-sm">
            <i className="fas fa-cloud-upload-alt text-xl mb-1 block"></i>
            Click to upload file
          </div>
        )}
      </div>
      {meta.touched && meta.error ? (
        <div className="text-red-500 text-xs mt-1">{meta.error}</div>
      ) : null}
    </div>
  );
};

const CheckboxGroup = ({
  name,
  options,
  label,
}: {
  name: string;
  options: string[];
  label: string;
}) => {
  const [field, meta, helpers] = useField(name);

  const handleChange = (option: string) => {
    const current = field.value || [];
    if (current.includes(option)) {
      helpers.setValue(current.filter((item: string) => item !== option));
    } else {
      helpers.setValue([...current, option]);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2 text-gray-700">
        {label}
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {options.map((opt) => (
          <label
            key={opt}
            className="flex items-center gap-2 cursor-pointer bg-gray-50 p-2 rounded border border-gray-200 hover:border-pathik-primary"
          >
            <input
              type="checkbox"
              checked={field.value?.includes(opt)}
              onChange={() => handleChange(opt)}
              className="w-4 h-4 text-pathik-primary rounded focus:ring-pathik-primary"
            />
            <span className="text-sm text-gray-700">{opt}</span>
          </label>
        ))}
      </div>
      {meta.touched && meta.error ? (
        <div className="text-red-500 text-xs mt-1">{meta.error}</div>
      ) : null}
    </div>
  );
};

export default function ProfileCompletionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const hotelData = user as any; // Cast to any to access dynamic fields

  // Initialize form with user data
  const initialValues = {
    cctv: {
      available: hotelData?.is_cctv_installed === 1,
      count: hotelData?.total_camera_count || "",
      cameraType: hotelData?.type_of_camera || "",
      recordingLocation: hotelData?.where_is_recording || "",
      backupDays: hotelData?.no_of_days_backup || "",
      coverage: hotelData?.area_cover || [],
    },
    fireSafety: {
      expiryDate: (() => {
        if (!hotelData?.fire_safety_expiry_date) return "";
        const date = new Date(hotelData.fire_safety_expiry_date);
        return !isNaN(date.getTime()) ? date.toISOString().split("T")[0] : "";
      })(),
      certificate: hotelData?.fire_safety_certificate || "",
    },
    documents: {
      amcGstCertificate: hotelData?.amc_gst_certificate || "",
      propertyGstCertificate: hotelData?.property_gst_certificate || "",
      visitingCard: hotelData?.hotel_visiting_card || "",
    },
    ownership: {
      type: hotelData?.ownership_type || "Owned", // Default or map if available
      propertyDoc: hotelData?.property_doc || "", // Assuming field name if exists, else empty
      rentAgreement: hotelData?.rent_agreement || "",
      propertyTaxReceipt: hotelData?.property_tax_receipt || "",
    },
  };

  const validationSchema = Yup.object({
    // ownerAadhaar and managerAadhaar removed (managed via Staff)
    cctv: Yup.object({
      available: Yup.boolean(),
      count: Yup.number().when("available", {
        is: true,
        then: (s) => s.required("Camera count is required"),
      }),
      cameraType: Yup.string().when("available", {
        is: true,
        then: (s) => s.required("Type is required"),
      }),
      recordingLocation: Yup.string().when("available", {
        is: true,
        then: (s) => s.required("Recording location required"),
      }),
      backupDays: Yup.number().when("available", {
        is: true,
        then: (s) => s.required("Backup days required"),
      }),
      coverage: Yup.array()
        .min(1, "Select at least one area")
        .when("available", { is: true, then: (s) => s.required() }),
    }),
    fireSafety: Yup.object({
      expiryDate: Yup.string().required("Expiry Date is required"),
      certificate: Yup.string().required("Certificate is required"),
    }),
    documents: Yup.object({
      amcGstCertificate: Yup.string().required(
        "AMC GST Certificate is required",
      ),
      propertyGstCertificate: Yup.string().required(
        "Property GST Certificate is required",
      ),
      visitingCard: Yup.string().required("Visiting Card is required"),
    }),
    ownership: Yup.object({
      // type: Yup.string().required("Ownership type is required"),
      // propertyDoc: Yup.string().when("type", {
      //   is: "Owned",
      //   then: (s) => s.required("Property Document is required"),
      // }),
      // rentAgreement: Yup.string().when("type", {
      //   is: "Rented",
      //   then: (s) => s.required("Rent Agreement is required"),
      // }),
      // propertyTaxReceipt: Yup.string().required(
      //   "Property Tax Receipt is required",
      // ),
    }),
  });

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      saveProfile(values);
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveProfile = async (values: any) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Saving profile...");
    try {
      const payload = {
        owner_id: hotelData?.owner_id,
        manager_id: hotelData?.manager_id,
        is_cctv_installed: values.cctv.available ? 1 : 0,
        total_camera_count: values.cctv.available
          ? Number(values.cctv.count)
          : 0,
        type_of_camera: values.cctv.available ? values.cctv.cameraType : "",
        where_is_recording: values.cctv.available
          ? values.cctv.recordingLocation
          : "",
        no_of_days_backup: values.cctv.available
          ? Number(values.cctv.backupDays)
          : 0,
        area_cover: values.cctv.available ? values.cctv.coverage : [],
        fire_safety_expiry_date: values.fireSafety.expiryDate,
        fire_safety_certificate: values.fireSafety.certificate,
        amc_gst_certificate: values.documents.amcGstCertificate,
        property_gst_certificate: values.documents.propertyGstCertificate,
        hotel_visiting_card: values.documents.visitingCard,
      };

      const response = await hotelService.completeProfile(payload);

      if (response?.code === 200) {
        toast.update(toastId, {
          render: response.message || "Profile Completed Successfully!",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
        router.push("/dashboard");
      } else {
        toast.update(toastId, {
          render: response?.message || "Failed to complete profile",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (error: any) {
      toast.update(toastId, {
        render: error?.message || "An error occurred",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // if (!hotelData)
  //   return (
  //     <div className="p-8 text-center text-gray-500">
  //       Loading hotel profile...
  //     </div>
  //   );

  return (
    <div className="max-w-9xl mx-auto p-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-pathik-text-dark">
          Complete Profile
        </h1>
        <p className="text-gray-500">
          Complete profile for{" "}
          <span className="font-bold text-pathik-primary">
            {hotelData?.hotel_name || "Hotel"}
          </span>
          . Please provide the mandatory compliance details.
        </p>
      </div>

      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} className="space-y-8">
          {/* 1. Identity Verification */}
          {/* <div className="bg-white rounded-xl shadow-sm border border-pathik-border p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
              <i className="fas fa-user-shield text-pathik-primary"></i>{" "}
              Identity Verification
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {verifiedOwner ? (
                <div className="flex items-center gap-4 p-5 bg-green-50 rounded-xl border border-green-200 shadow-sm animate-[fadeIn_0.5s]">
                  <div className="w-16 h-16 rounded-full bg-white border-2 border-green-300 overflow-hidden shrink-0">
                    {verifiedOwner.profileImage ? (
                      <img
                        src={verifiedOwner.profileImage}
                        alt="Owner"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-600 font-bold text-lg">
                        {verifiedOwner.firstName?.[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      {verifiedOwner.firstName} {verifiedOwner.lastName}
                      <i
                        className="fas fa-check-circle text-green-500"
                        title="Verified"
                      ></i>
                    </h3>
                    <p className="text-xs font-semibold text-green-700 bg-green-200 px-2 py-0.5 rounded w-fit my-1">
                      OWNER VERIFIED
                    </p>
                    <p className="text-xs text-gray-500">
                      ID: {verifiedOwner.documentNumber}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 p-5 bg-gray-50 rounded-xl border border-dashed border-gray-300 items-center justify-center text-center hover:bg-white hover:shadow-md transition-all">
                  <i className="fas fa-user-tie text-3xl text-gray-400 mb-2"></i>
                  <h3 className="font-semibold text-gray-700">
                    Owner Verification
                  </h3>
                  <p className="text-xs text-gray-500 mb-4 px-4">
                    Register owner details and verify Aadhaar via Quick Scan in
                    Staff Management.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      router.push("/dashboard/staff/add?role=Owner")
                    }
                    className="px-5 py-2 bg-pathik-primary text-white text-sm font-medium rounded-lg hover:bg-pathik-secondary transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-plus"></i> Add Owner to Staff
                  </button>
                </div>
              )}

              {verifiedManager ? (
                <div className="flex items-center gap-4 p-5 bg-green-50 rounded-xl border border-green-200 shadow-sm animate-[fadeIn_0.5s]">
                  <div className="w-16 h-16 rounded-full bg-white border-2 border-green-300 overflow-hidden shrink-0">
                    {verifiedManager.profileImage ? (
                      <img
                        src={verifiedManager.profileImage}
                        alt="Manager"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-600 font-bold text-lg">
                        {verifiedManager.firstName?.[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      {verifiedManager.firstName} {verifiedManager.lastName}
                      <i
                        className="fas fa-check-circle text-green-500"
                        title="Verified"
                      ></i>
                    </h3>
                    <p className="text-xs font-semibold text-green-700 bg-green-200 px-2 py-0.5 rounded w-fit my-1">
                      MANAGER VERIFIED
                    </p>
                    <p className="text-xs text-gray-500">
                      ID: {verifiedManager.documentNumber}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 p-5 bg-gray-50 rounded-xl border border-dashed border-gray-300 items-center justify-center text-center hover:bg-white hover:shadow-md transition-all">
                  <i className="fas fa-user-friends text-3xl text-gray-400 mb-2"></i>
                  <h3 className="font-semibold text-gray-700">
                    Manager Verification
                  </h3>
                  <p className="text-xs text-gray-500 mb-4 px-4">
                    Register manager details and verify Aadhaar via Quick Scan
                    in Staff Management.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      router.push("/dashboard/staff/add?role=Manager")
                    }
                    className="px-5 py-2 bg-pathik-primary text-white text-sm font-medium rounded-lg hover:bg-pathik-secondary transition-colors flex items-center gap-2"
                  >
                    <i className="fas fa-plus"></i> Add Manager to Staff
                  </button>
                </div>
              )}
            </div>
          </div> */}

          {/* 2. CCTV Configuration */}
          <div className="bg-white rounded-xl shadow-sm border border-pathik-border p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
              <i className="fas fa-video text-pathik-primary"></i> CCTV
              Surveillance
            </h2>

            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 text-pathik-primary rounded focus:ring-pathik-primary"
                  checked={formik.values.cctv.available}
                  onChange={(e) =>
                    formik.setFieldValue("cctv.available", e.target.checked)
                  }
                />
                <span className="font-medium text-gray-700">
                  CCTV System Installed?
                </span>
              </label>
            </div>

            {formik.values.cctv.available && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-[fadeIn_0.3s_ease-out]">
                <FormInput
                  name="cctv.count"
                  label="How many CCTV Cameras?"
                  restrict="digitsOnly"
                  required
                />
                <FormSelect
                  name="cctv.cameraType"
                  label="Type of Camera"
                  options={[
                    { label: "Dome", value: "Dome" },
                    { label: "Bullet", value: "Bullet" },
                    { label: "PTZ", value: "PTZ" },
                    { label: "Other", value: "Other" },
                  ]}
                  required
                />
                <FormInput
                  name="cctv.recordingLocation"
                  label="Where is recording done?"
                  placeholder="e.g. Server Room, Reception"
                  required
                />
                <FormInput
                  name="cctv.backupDays"
                  label="Number of days for backup"
                  restrict="digitsOnly"
                  required
                />

                <div className="md:col-span-2 mt-2">
                  <CheckboxGroup
                    name="cctv.coverage"
                    label="Which areas are covered?"
                    options={[
                      "Gallery",
                      "Entrance",
                      "Reception",
                      "Outside",
                      "Parking",
                    ]}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Fire Safety */}
          <div className="bg-white rounded-xl shadow-sm border border-pathik-border p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
              <i className="fas fa-fire-extinguisher text-pathik-primary"></i>{" "}
              Fire Safety
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                name="fireSafety.expiryDate"
                label="Expiry Date"
                type="date"
                required
              />
              <FileUpload
                name="fireSafety.certificate"
                label="Fire Safety Certificate"
                required
                documentType="HOTEL_ALL_IMAGES"
              />
            </div>
          </div>

          {/* 4. Compliance Documents */}
          <div className="bg-white rounded-xl shadow-sm border border-pathik-border p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
              <i className="fas fa-file-contract text-pathik-primary"></i>{" "}
              Compliance Documents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FileUpload
                name="documents.amcGstCertificate"
                label="AMC GST Certificate"
                required
                documentType="HOTEL_ALL_IMAGES"
              />
              <FileUpload
                name="documents.propertyGstCertificate"
                label="Property GST Certificate"
                required
                documentType="HOTEL_ALL_IMAGES"
              />
              <FileUpload
                name="documents.visitingCard"
                label="Hotel Visiting Card"
                required
                documentType="HOTEL_ALL_IMAGES"
              />
            </div>
          </div>

          {/* 5. Ownership Details */}
          {/* <div className="bg-white rounded-xl shadow-sm border border-pathik-border p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2">
              <i className="fas fa-building text-pathik-primary"></i> Property
              Ownership
            </h2>
            <div className="mb-6">
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="ownership.type"
                    value="Owned"
                    checked={formik.values.ownership.type === "Owned"}
                    onChange={formik.handleChange}
                    className="w-4 h-4 text-pathik-primary focus:ring-pathik-primary"
                  />
                  <span>Own Property</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="ownership.type"
                    value="Rented"
                    checked={formik.values.ownership.type === "Rented"}
                    onChange={formik.handleChange}
                    className="w-4 h-4 text-pathik-primary focus:ring-pathik-primary"
                  />
                  <span>Rented Property</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formik.values.ownership.type === "Owned" && (
                <FileUpload
                  name="ownership.propertyDoc"
                  label="Property Document"
                  required
                  documentType="HOTEL_ALL_IMAGES"
                />
              )}
              {formik.values.ownership.type === "Rented" && (
                <FileUpload
                  name="ownership.rentAgreement"
                  label="Rent Karar (Agreement)"
                  required
                  documentType="HOTEL_ALL_IMAGES"
                />
              )}
              <FileUpload
                name="ownership.propertyTaxReceipt"
                label="Property Tax Receipt"
                required
                documentType="HOTEL_ALL_IMAGES"
              />
            </div>
          </div> */}

          {/* Submit Action */}
          <div className="flex justify-end gap-4 pb-12">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-lg font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-lg bg-pathik-primary text-white font-bold shadow-lg hover:bg-pathik-secondary transition-all ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <i className="fas fa-spinner fa-spin"></i> Saving...
                </span>
              ) : (
                "Save & Complete Profile"
              )}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
}
