import React, { useState, useEffect, useRef } from "react";
import { useFormikContext } from "formik";
import { GuestWizardValues } from "@/app/types";
import FormInput from "@/app/components/FormInput";
import FormSelect from "@/app/components/FormSelect";
import ManualEntryModal from "./ManualEntryModal";
import hotelService from "@/app/services/hotel/hotelService";
import { toast } from "react-toastify";
import Image from "next/image";
import QRCode from "react-qr-code";
import { AppConfig } from "@/app/constants/config";

const Step3Identity: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<GuestWizardValues>();
  const [isScanning, setIsScanning] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrValue, setQrValue] = useState<string>("");
  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [countries, setCountries] = useState<
    { label: string; value: string | number }[]
  >([]);
  const [documentTypes, setDocumentTypes] = useState<
    { label: string; value: string }[]
  >([]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
    };
  }, []);

  // Fetch Countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await hotelService.getCountries();
        if (response && response.data) {
          const countryOptions = response.data.map((c: any) => ({
            label: c.name,
            value: c.id,
          }));
          setCountries(countryOptions);
        }
      } catch (error) {
        // console.error("Failed to fetch countries", error);
        toast.error("Failed to load countries");
      }
    };

    fetchCountries();
  }, []);

  // Fetch Document Types
  useEffect(() => {
    const fetchDocTypes = async () => {
      try {
        const response = await hotelService.getDocumentTypes();
        if (response && response.data) {
          const docOptions = response.data.map((d: any) => ({
            label: d.name,
            value: d.id, // Store ID as value for backend
          }));
          setDocumentTypes(docOptions);
        }
      } catch (error) {
        // console.error("Failed to fetch document types", error);
      }
    };
    fetchDocTypes();
  }, []);

  // Initialize defaults
  useEffect(() => {
    // Only set defaults if not already set (prevents reset on remount/updates)
    if (!values.verificationMethod || !values.residencyType) {
      setFieldValue("verificationMethod", "quick_aadhaar");
      setFieldValue("residencyType", "Indian");
      setFieldValue("aadhaarVerified", false);
      setFieldValue("documentType", "Aadhaar");
      setFieldValue("manualEntryReason", "");
    }
  }, []);

  const handleManualClick = () => {
    setShowManualModal(true);
  };

  const handleManualReasonSubmit = (
    reason: "foreigner" | "no_aadhaar" | "no_app",
  ) => {
    setFieldValue("manualEntryReason", reason);
    if (reason === "foreigner") {
      setFieldValue("residencyType", "Foreign");
      setFieldValue("verificationMethod", "manual");
      setFieldValue("foreignDocumentType", "Passport");
      setFieldValue("documentType", "Passport"); // For UI consistency/validation if needed
      setFieldValue("country", "");
      setFieldValue("aadhaarVerified", false);
      setFieldValue("passportNo", "");
    } else {
      // No Aadhaar or No App (Indian Manual)
      setFieldValue("residencyType", "Indian");
      setFieldValue("verificationMethod", "manual");
      setFieldValue("country", "India");
      setFieldValue("aadhaarVerified", false);
      setFieldValue("documentType", ""); // Reset to force selection
    }
  };

  const [faceVerification, setFaceVerification] = useState(true);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const handleScanQR = async () => {
    setIsScanning(true);
    setShowQr(true);
    setQrValue(""); // Clear previous QR

    try {
      const qrResponse = await hotelService.generateAadharQrVerification({
        face_verification: faceVerification ? 1 : 0,
        adhar_user_type: "GUEST",
      });

      if (qrResponse && qrResponse.data) {
        // Adjust destructuring based on actual API response structure
        const { base10, decodedTxn, qr } = qrResponse.data;

        if (base10) {
          const intentUrl = `https://maadhaar.com/getIntent?value=${encodeURIComponent(base10)}`;
          setQrValue(intentUrl);
          setIsScanning(false);

          // Start Polling after 5 seconds
          pollingRef.current = setTimeout(() => {
            startPolling(decodedTxn, Date.now());
          }, 5000);
        } else {
          toast.error("Invalid response from QR generation API");
          setIsScanning(false);
          setShowQr(false);
        }
      } else {
        toast.error("Failed to generate QR code");
        setIsScanning(false);
        setShowQr(false);
      }
    } catch (error) {
      setIsScanning(false);
      setShowQr(false);
    }
  };

  const startPolling = (txnId: string, startTime: number) => {
    const poll = async () => {
      // Check timeout (5 minutes)
      if (Date.now() - startTime > 5 * 60 * 1000) {
        toast.error("Session timed out. Please generate a new QR.");
        setShowQr(false);
        setQrValue("");
        return;
      }

      try {
        const response = await hotelService.getUserData({
          transaction_id: txnId,
        });

        if (response && response.data) {
          const userData = response.data;
          // console.log("userData", userData);
          // If we have valid user data, map it and stop polling
          if (userData.resident_name || userData.enrolment_number) {
            // Name Parsing
            const nameParts = (userData.resident_name || "")
              .trim()
              .split(/\s+/);
            let fName = "",
              mName = "",
              lName = "";
            if (nameParts.length > 0) fName = nameParts[0];
            if (nameParts.length === 2) {
              lName = nameParts[1];
            } else if (nameParts.length > 2) {
              lName = nameParts[nameParts.length - 1];
              mName = nameParts.slice(1, nameParts.length - 1).join(" ");
            }

            setFieldValue("firstName", fName);
            setFieldValue("middleName", mName);
            setFieldValue("lastName", lName);
            const dob = userData.dob ? userData.dob.split("T")[0] : "";
            setFieldValue("dateOfBirth", dob);

            setFieldValue(
              "gender",
              userData.gender
                ? userData.gender.charAt(0).toUpperCase() +
                    userData.gender.slice(1).toLowerCase()
                : "",
            );
            setFieldValue("mobileNo", userData.mobile || "");
            // setFieldValue("email", userData.email || "");
            setFieldValue("address", userData.address || "");
            setFieldValue("city", userData.vtc || "");
            setFieldValue("state", userData.state || "");
            setFieldValue("district", userData.district || "");
            setFieldValue("zipCode", userData.pincode || "");

            setFieldValue("documentType", "Aadhaar");
            setFieldValue("documentNumber", userData.enrolment_number || "");

            if (userData.profile_image) {
              setFieldValue("profileImage", `${userData.profile_image}`);
            }

            // Extended Fields Mapping
            setFieldValue("careOf", userData.care_of || "");
            setFieldValue("createdAt", userData.created_at || "");
            setFieldValue(
              "credentialIssuingDate",
              userData.credential_issuing_date || "",
            );
            setFieldValue("enrolmentDate", userData.enrolment_date || "");
            setFieldValue("enrolmentNumber", userData.enrolment_number || "");
            setFieldValue("isNri", userData.is_nri || false);
            setFieldValue("landmark", userData.landmark || "");
            setFieldValue("localBuilding", userData.local_building || "");
            setFieldValue("localCareOf", userData.local_care_of || "");
            setFieldValue("localDistrict", userData.local_district || "");
            setFieldValue("localLandmark", userData.local_landmark || "");
            setFieldValue("localLocality", userData.local_locality || "");
            setFieldValue("localPoName", userData.local_po_name || "");
            setFieldValue(
              "localResidentName",
              userData.local_resident_name || "",
            );
            setFieldValue("localState", userData.local_state || "");
            setFieldValue("localStreet", userData.local_street || "");
            setFieldValue(
              "localSubDistrict",
              userData.local_sub_district || "",
            );
            setFieldValue("localVtc", userData.local_vtc || "");
            setFieldValue("locality", userData.locality || "");
            setFieldValue("maskedEmail", userData.masked_email || "");
            setFieldValue("maskedMobile", userData.masked_mobile || "");
            setFieldValue("poName", userData.po_name || "");
            setFieldValue("regionalAddress", userData.regional_address || "");
            setFieldValue("street", userData.street || "");
            setFieldValue("subDistrict", userData.sub_district || "");
            setFieldValue("transactionId", userData.transaction_id || "");
            setFieldValue("updatedAt", userData.updated_at || "");
            setFieldValue("vtc", userData.vtc || "");
            setFieldValue("aadhaarGuestId", userData.id || undefined);

            setFieldValue("aadhaarVerified", true);
            setFieldValue("residencyType", "Indian");
            setFieldValue("verificationMethod", "quick_aadhaar");
            setFieldValue("country", "India");

            toast.success("User data fetched successfully");
            setShowQr(false); // Hide QR view
            return; // Stop Polling
          }
        }
      } catch (error) {
        // Fail silently and continue polling
      }

      // Schedule next poll in 3 seconds
      pollingRef.current = setTimeout(poll, 3000);
    };

    poll();
  };
  // useEffect(() => {
  //   console.log(values.profileImage, "profile image");
  // }, [values.profileImage]);

  // File Upload Handler
  const handleFileUpload = async (
    file: File | undefined,
    fieldName: string,
    docType: string,
  ) => {
    if (!file) return;

    const toastId = toast.loading("Uploading document...");

    // Set immediate preview for profile image
    if (fieldName === "profileImage") {
      const objectUrl = URL.createObjectURL(file);
      setProfilePreview(objectUrl);
    }

    try {
      const response = await hotelService.uploadDocument(file, docType);
      if (response && response.data) {
        let fileUrl = "";

        if (Array.isArray(response.data) && response.data.length > 0) {
          // Check for filename in first element
          if (response.data[0]) {
            fileUrl = response.data[0].file.filename;
          } else if (response.data[0].file.file_name) {
            fileUrl = response.data[0].file.file_name;
          } else {
            // Fallback: try to stringify if it's an object we don't understand, or empty string
            console.warn(
              "Could not find filename in response array:",
              response.data,
            );
          }
        } else if (typeof response.data === "string") {
          fileUrl = response.data;
        } else {
          // Fallback
          console.warn("Unexpected response data format:", response.data);
        }

        setFieldValue(fieldName, fileUrl);
        toast.update(toastId, {
          render: "Document uploaded successfully",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
      } else {
        toast.update(toastId, {
          render: "Upload failed: No data received",
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

  const isQuickAadhaar = values.verificationMethod === "quick_aadhaar";
  const isIndian = values.residencyType === "Indian";
  const showForm =
    !isIndian || (isIndian && !isQuickAadhaar) || values.aadhaarVerified;

  return (
    <div className="animate-[fadeIn_0.5s_ease-out] relative">
      <h2 className="text-xl font-bold text-pathik-text-dark mb-6 flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-pathik-primary text-white flex items-center justify-center text-sm">
          2
        </span>
        Identity Verification
      </h2>

      {/* Helper Text or Intro */}
      <p className="text-gray-500 mb-6 text-sm">
        Choose how you want to verify the guest's identity. Use{" "}
        <strong>Quick Aadhaar</strong> for fastest check-in.
      </p>

      {/* Selection Buttons */}
      <div className="flex bg-gray-100 p-1 rounded-lg mb-8 w-fit relative z-0">
        <button
          type="button"
          onClick={() => {
            setFieldValue("verificationMethod", "quick_aadhaar");
            setFieldValue("residencyType", "Indian");
            setFieldValue("aadhaarVerified", false);
            setFieldValue("documentType", "Aadhaar");
          }}
          className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${isQuickAadhaar ? "bg-white shadow text-pathik-primary" : "text-gray-500 hover:text-gray-700"}`}
        >
          <i className="fas fa-qrcode mr-2"></i> Quick Aadhaar
        </button>
        <button
          type="button"
          onClick={handleManualClick}
          className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${!isQuickAadhaar ? "bg-white shadow text-pathik-primary" : "text-gray-500 hover:text-gray-700"}`}
        >
          <i className="fas fa-edit mr-2"></i> Manual Entry
        </button>
      </div>

      <ManualEntryModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        onSubmit={handleManualReasonSubmit}
      />

      {/* Quick Aadhaar Scan Section */}
      {isIndian && isQuickAadhaar && !values.aadhaarVerified && (
        <div className="text-center p-8 bg-white border-2 border-dashed border-pathik-primary/30 rounded-xl mb-8">
          <div className="w-[420px] h-[420px] bg-gray-200 mx-auto mb-6 rounded-xl flex items-center justify-center relative group shadow-sm">
            {showQr && qrValue ? (
              <div className="bg-white p-6 w-full h-full flex flex-col items-center justify-center rounded-lg">
                <QRCode
                  value={qrValue}
                  size={400}
                  level="L"
                  style={{
                    height: "auto",
                    maxWidth: "100%",
                    width: "100%",
                  }}
                />
              </div>
            ) : (
              <i className="fas fa-qrcode text-6xl text-gray-400"></i>
            )}
          </div>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Scan the guest's Aadhaar QR code to automatically fetch and verify
            identity details.
          </p>

          <div className="flex items-center justify-center gap-2 mb-6">
            <input
              type="checkbox"
              id="faceVerification"
              checked={faceVerification}
              onChange={(e) => setFaceVerification(e.target.checked)}
              className="w-4 h-4 text-pathik-primary border-gray-300 rounded focus:ring-pathik-primary"
            />
            <label
              htmlFor="faceVerification"
              className="text-sm font-medium text-gray-700 select-none cursor-pointer"
            >
              Face Verification Required
            </label>
          </div>

          <button
            type="button"
            onClick={handleScanQR}
            disabled={showQr}
            className="px-8 py-3 rounded-lg font-bold text-white transition-all shadow-md flex items-center gap-2 mx-auto bg-pathik-primary hover:bg-pathik-secondary"
          >
            {showQr ? (
              "Waiting for Scan..."
            ) : (
              <>
                <i className="fas fa-camera"></i> Generate QR Code
              </>
            )}
          </button>
        </div>
      )}

      {/* Main Form (Visible if Manual, Foreigner, or Aadhaar Verified) */}
      {showForm && (
        <div className="space-y-6 animate-[fadeInUp_0.3s_ease-out]">
          {/* Success Banner for Aadhaar */}
          {isIndian && isQuickAadhaar && values.aadhaarVerified && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-3 mb-4">
              <i className="fas fa-check-circle text-xl"></i>
              <div>
                <strong>Identity Verified via Aadhaar</strong>
                <div className="text-sm opacity-90">
                  Guest details have been pre-filled. Please review and complete
                  any missing information.
                </div>
              </div>
            </div>
          )}

          {/* Personal Details */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4 border-b pb-2">
              Guest Personal Details
            </h3>

            {/* Profile Image (New) */}
            <div className="mb-6 flex items-center gap-4">
              <div className="w-24 h-24 relative rounded-full border-4 border-gray-100 overflow-hidden bg-gray-50 group cursor-pointer hover:border-pathik-primary/30 transition-all shrink-0">
                {values.profileImage || profilePreview ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={profilePreview || values.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <i className="fas fa-camera text-2xl mb-1"></i>
                  </div>
                )}
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) =>
                    handleFileUpload(
                      e.target.files?.[0],
                      "profileImage",
                      "PROFILE_IMAGE",
                    )
                  }
                  disabled={values.aadhaarVerified}
                  accept="image/*"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Guest Profile Photo <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-400">
                  Upload a clear face photo of the guest.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                name="firstName"
                label="First Name"
                placeholder="First Name"
                disabled={values.aadhaarVerified}
              />
              <FormInput
                name="middleName"
                label="Middle Name"
                placeholder="Middle Name"
                disabled={values.aadhaarVerified}
              />
              <FormInput
                name="lastName"
                label="Last Name"
                placeholder="Last Name"
                disabled={values.aadhaarVerified}
              />
              <FormInput
                name="dateOfBirth"
                label="Date of Birth"
                type="date"
                required
                disabled={values.aadhaarVerified}
              />
              <FormSelect
                name="gender"
                label="Gender"
                options={[
                  { label: "Male", value: "Male" },
                  { label: "Female", value: "Female" },
                  { label: "Other", value: "Other" },
                ]}
                required
                disabled={values.aadhaarVerified}
              />
              <FormInput
                name="mobileNo"
                label="Mobile Number"
                placeholder="10-digit Mobile"
                restrict="digitsOnly"
                disabled={values.aadhaarVerified}
              />
              {/* <FormInput
                name="email"
                label="Email"
                placeholder="Email Address"
              /> */}
            </div>
          </div>

          {/* Address Details */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4 border-b pb-2">
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <FormInput
                  name="address"
                  label="Address"
                  placeholder="Full Address"
                  required
                  disabled={values.aadhaarVerified}
                />
              </div>
              <FormInput
                name="city"
                label="City"
                placeholder="City"
                required
                disabled={values.aadhaarVerified}
              />
              <FormInput
                name="state"
                label="State"
                placeholder="State"
                required
                disabled={values.aadhaarVerified}
              />
              <FormInput
                name="district"
                label="District"
                placeholder="District"
                required
                disabled={values.aadhaarVerified}
              />
              <FormInput
                name="zipCode"
                label="PIN Code"
                placeholder="ZIP/PIN Code"
                restrict="digitsOnly"
                required
                disabled={values.aadhaarVerified}
              />
              {/* {!isIndian && (
                <FormInput
                  name="country"
                  label="Country"
                  placeholder="Country"
                  required
                />
              )} */}
            </div>
          </div>

          {/* Identity & Documents */}
          <div className="bg-white p-5 rounded-xl border-[1.5px] border-pathik-border shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2 mb-4">
              <i className="fas fa-id-card"></i> Identity & Documents
            </h3>

            {/* Foreigner Specific Fields */}
            {!isIndian && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
                <div className="text-blue-800 font-bold mb-4 text-sm uppercase flex items-center gap-2">
                  <i className="fas fa-plane"></i> Foreign National Requirements
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormSelect
                    name="nationality"
                    label="Nationality / Country"
                    options={countries}
                    required
                  />
                  <FormInput
                    name="visaExpiryDate"
                    label="Visa Expiry Date"
                    type="date"
                    required
                  />
                  <FormInput
                    name="passportNo"
                    label="Passport Number"
                    placeholder="Enter Passport Number"
                    required
                  />
                  <div className="hidden">
                    <FormInput
                      name="foreignDocumentType"
                      label="Doc Type"
                      disabled
                    />
                  </div>

                  {/* Passport Image */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Passport Image <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative group">
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        onChange={(e) =>
                          handleFileUpload(
                            e.target.files?.[0],
                            "passportImage",
                            "FOREIGN_PASSPORT_IMAGE",
                          )
                        }
                      />
                      {values.passportImage ? (
                        <div className="text-green-600 font-bold flex items-center justify-center gap-2">
                          <i className="fas fa-check-circle"></i> Uploaded
                        </div>
                      ) : (
                        <div className="text-gray-400">
                          <i className="fas fa-cloud-upload-alt text-2xl mb-1 block"></i>
                          <span className="text-xs">
                            Click to Upload Passport
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Visa Image */}
                  <div className="col-span-1">
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Visa Image <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative group">
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        onChange={(e) =>
                          handleFileUpload(
                            e.target.files?.[0],
                            "visaImage",
                            "FOREIGN_VISA_IMAGE",
                          )
                        }
                      />
                      {values.visaImage ? (
                        <div className="text-green-600 font-bold flex items-center justify-center gap-2">
                          <i className="fas fa-check-circle"></i> Uploaded
                        </div>
                      ) : (
                        <div className="text-gray-400">
                          <i className="fas fa-cloud-upload-alt text-2xl mb-1 block"></i>
                          <span className="text-xs">Click to Upload Visa</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Standard ID Fields (Shown for both Indian Manual & Foreigner) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isIndian ? (
                <FormSelect
                  name="documentType"
                  label="Document Type"
                  options={
                    isQuickAadhaar
                      ? [{ label: "Aadhaar", value: "Aadhaar" }]
                      : documentTypes
                  }
                  required
                  disabled={isQuickAadhaar}
                />
              ) : (
                <FormInput name="documentType" label="Document Type" disabled />
              )}

              <FormInput
                name="documentNumber"
                label="Document Number"
                placeholder="ID Number"
                required
                disabled={isQuickAadhaar && values.aadhaarVerified}
              />

              {/* Document Image (For Indian Manual) */}
              {isIndian && !isQuickAadhaar && (
                <div className="col-span-2">
                  {/* Check if Selected Document is Aadhaar (ID might be dynamic so relying on label or value if possible, strict match for now) - 
                       Actually, the API returns IDs. I should check against the selected Label or just generic 'Aadhaar' string if I can map it. 
                       For now, let's assume if the selected VALUE corresponds to 'Aadhaar' (we might need to find the label from options).
                       A safer bet is to check if the label contains 'Aadhaar'.
                   */}
                  {documentTypes
                    .find((d) => d.value == values.documentType)
                    ?.label.toLowerCase()
                    .includes("aadhaar") ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Front */}
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                          Aadhaar Front <span className="text-red-500">*</span>
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative group">
                          <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            onChange={(e) =>
                              handleFileUpload(
                                e.target.files?.[0],
                                "aadhaarFront",
                                "IDENTITY_DOCUMENT",
                              )
                            }
                          />
                          {values.aadhaarFront ? (
                            <div className="text-green-600 font-bold flex items-center justify-center gap-2">
                              <i className="fas fa-check-circle"></i> Uploaded
                              Front
                            </div>
                          ) : (
                            <div className="text-gray-400">
                              <i className="fas fa-id-card text-2xl mb-1 block"></i>
                              <span className="text-xs">Upload Front Side</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Back */}
                      <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">
                          Aadhaar Back <span className="text-red-500">*</span>
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative group">
                          <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            onChange={(e) =>
                              handleFileUpload(
                                e.target.files?.[0],
                                "aadhaarBack",
                                "IDENTITY_DOCUMENT",
                              )
                            }
                          />
                          {values.aadhaarBack ? (
                            <div className="text-green-600 font-bold flex items-center justify-center gap-2">
                              <i className="fas fa-check-circle"></i> Uploaded
                              Back
                            </div>
                          ) : (
                            <div className="text-gray-400">
                              <i className="fas fa-id-card text-2xl mb-1 block"></i>
                              <span className="text-xs">Upload Back Side</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Single Document Upload */
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Document Image <span className="text-red-500">*</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative group">
                        <input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          onChange={(e) =>
                            handleFileUpload(
                              e.target.files?.[0],
                              "documentImage",
                              "IDENTITY_DOCUMENT",
                            )
                          }
                        />
                        {values.documentImage ? (
                          <div className="text-green-600 font-bold flex items-center justify-center gap-2">
                            <i className="fas fa-check-circle"></i> Uploaded
                          </div>
                        ) : (
                          <div className="text-gray-400">
                            <i className="fas fa-cloud-upload-alt text-2xl mb-1 block"></i>
                            <span className="text-xs">
                              Click to Upload Document
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Additional Aadhaar Details */}
            {isIndian && isQuickAadhaar && values.aadhaarVerified && (
              <div className="bg-gray-50 mt-6 p-5 rounded-xl border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4 border-b pb-2">
                  Additional Aadhaar Data
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Basic Info */}
                  <FormInput name="careOf" label="Care Of (C/O)" disabled />
                  <FormInput
                    name="enrolmentNumber"
                    label="Enrolment Number"
                    disabled
                  />
                  <div className="relative">
                    <label className="font-medium text-pathik-text-dark mb-1.5 block text-sm">
                      Is NRI
                    </label>
                    <div className="w-full p-2.5 pl-3 pr-10 border-[1.5px] rounded-lg text-sm bg-gray-100 text-gray-500 border-pathik-border">
                      {values.isNri ? "Yes" : "No"}
                    </div>
                  </div>

                  {/* Dates */}
                  <FormInput
                    name="enrolmentDate"
                    label="Last Aadhar updated date"
                    disabled
                  />
                  <FormInput
                    name="credentialIssuingDate"
                    label="Issue Date"
                    disabled
                  />

                  {/* Local Language Fields */}
                  <FormInput
                    name="localResidentName"
                    label="Local Resident Name"
                    disabled
                  />
                  <FormInput
                    name="localCareOf"
                    label="Local Care Of"
                    disabled
                  />
                  <FormInput
                    name="localBuilding"
                    label="Local Building"
                    disabled
                  />
                  <FormInput name="localStreet" label="Local Street" disabled />
                  <FormInput
                    name="localLandmark"
                    label="Local Landmark"
                    disabled
                  />
                  <FormInput
                    name="localLocality"
                    label="Local Locality"
                    disabled
                  />
                  <FormInput name="localVtc" label="Local VTC" disabled />
                  <FormInput
                    name="localSubDistrict"
                    label="Local Sub-District"
                    disabled
                  />
                  <FormInput
                    name="localDistrict"
                    label="Local District"
                    disabled
                  />
                  <FormInput name="localState" label="Local State" disabled />
                  <FormInput
                    name="localPoName"
                    label="Local PO Name"
                    disabled
                  />

                  {/* Other Location Fields */}
                  <FormInput name="landmark" label="Landmark" disabled />
                  <FormInput name="locality" label="Locality" disabled />
                  <FormInput name="vtc" label="VTC" disabled />
                  <FormInput name="subDistrict" label="Sub District" disabled />
                  <FormInput name="poName" label="PO Name" disabled />
                  <FormInput name="street" label="Street" disabled />
                  <div className="md:col-span-3">
                    <FormInput
                      name="regionalAddress"
                      label="Regional Address"
                      disabled
                    />
                  </div>

                  {/* Meta */}
                  <div className="md:col-span-3">
                    <FormInput
                      name="transactionId"
                      label="Transaction ID"
                      disabled
                    />
                  </div>
                  <FormInput
                    name="maskedMobile"
                    label="Masked Mobile"
                    disabled
                  />
                  <FormInput name="maskedEmail" label="Masked Email" disabled />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Step3Identity;
