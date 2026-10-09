import React, { useState, useEffect } from "react";
import { useFormikContext } from "formik";
import FormInput from "@/app/components/FormInput";
import FormSelect from "@/app/components/FormSelect";
import { Staff } from "@/app/types";

const Step2IdentityStaff: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<Staff>();
  const [isScanning, setIsScanning] = useState(false);

  // Initialize defaults - Enforce Quick Aadhaar
  useEffect(() => {
    if (
      values.verificationMethod !== "quick_aadhaar" ||
      values.residencyType !== "Indian"
    ) {
      setFieldValue("verificationMethod", "quick_aadhaar");
      setFieldValue("residencyType", "Indian");
      setFieldValue("documentType", "Aadhaar");
      setFieldValue("aadhaarVerified", false);
    }
  }, [values.verificationMethod, values.residencyType, setFieldValue]);

  const handleScanQR = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      // Mock Data simulation
      const mockData = {
        firstName: "Amit",
        lastName: "Sharma",
        mobileNo: "9876543210",
        dateOfBirth: "1990-01-01",
        gender: "Male",
        address: "123, MG Road",
        city: "Gandhinagar",
        state: "Gujarat",
        zipCode: "382010",
        country: "India",
        documentType: "Aadhaar",
        documentNumber: "XXXX-XXXX-1234",
        aadhaarVerified: true,
      };

      Object.entries(mockData).forEach(([key, value]) => {
        setFieldValue(key, value);
      });

      setFieldValue("residencyType", "Indian");
      setFieldValue("verificationMethod", "quick_aadhaar");
    }, 2000);
  };

  const isQuickAadhaar = true; // Always true now
  const isIndian = true; // Always true now
  const showForm = values.aadhaarVerified;

  return (
    <div className="animate-[fadeIn_0.5s_ease-out] relative">
      <h2 className="text-xl font-bold text-pathik-text-dark mb-6 flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-pathik-primary text-white flex items-center justify-center text-sm">
          2
        </span>
        Identity Verification
      </h2>

      <p className="text-gray-500 mb-6 text-sm">
        Verify identity via <strong>Quick Aadhaar</strong>.
      </p>

      {/* Quick Aadhaar Scan Section */}
      {!values.aadhaarVerified && (
        <div className="text-center p-8 bg-white border-2 border-dashed border-pathik-primary/30 rounded-xl mb-8">
          <div className="w-48 h-48 bg-gray-200 mx-auto mb-6 rounded-lg flex items-center justify-center relative overflow-hidden group">
            <i className="fas fa-qrcode text-6xl text-gray-400"></i>
            {isScanning && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold animate-pulse">
                Generating QR Code...
              </div>
            )}
          </div>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Scan the Staff&apos;s Aadhaar QR Code.
          </p>
          <button
            type="button"
            onClick={handleScanQR}
            disabled={isScanning}
            className="px-8 py-3 rounded-lg font-bold text-white transition-all shadow-md flex items-center gap-2 mx-auto bg-pathik-primary hover:bg-pathik-secondary"
          >
            {isScanning ? (
              "Generating..."
            ) : (
              <>
                <i className="fas fa-camera"></i> Generate QR Code
              </>
            )}
          </button>
        </div>
      )}

      {/* Form Fields */}
      {showForm && (
        <div className="space-y-6 animate-[fadeInUp_0.3s_ease-out]">
          {isIndian && isQuickAadhaar && values.aadhaarVerified && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-3 mb-4">
              <i className="fas fa-check-circle text-xl"></i>
              <div>
                <strong>Identity Verified via Aadhaar</strong>
              </div>
            </div>
          )}

          <div className="bg-white p-5 rounded-xl border-[1.5px] border-pathik-border shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2 mb-6">
              <i className="fas fa-user"></i> Personal & Contact Details
            </h3>

            {/* Profile Image */}
            <div className="mb-6 flex items-center gap-4">
              <div className="w-24 h-24 relative rounded-full border-4 border-gray-100 overflow-hidden bg-gray-50 group cursor-pointer hover:border-pathik-primary/30 transition-all shrink-0">
                {values.profileImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={values.profileImage}
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
                  onChange={() =>
                    setFieldValue("profileImage", "/PATHIK_LOGO.png")
                  }
                  accept="image/*"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Profile Photo
                </label>
                <p className="text-xs text-gray-400">
                  Upload a clear face photo of the staff member.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <FormInput
                name="firstName"
                label="First Name"
                placeholder="First Name"
                required
              />
              <FormInput
                name="middleName"
                label="Middle Name"
                placeholder="Middle Name"
              />
              <FormInput
                name="lastName"
                label="Last Name"
                placeholder="Last Name"
                required
              />
              <FormSelect
                name="gender"
                label="Gender"
                options={[
                  { label: "Male", value: "Male" },
                  { label: "Female", value: "Female" },
                ]}
                required
              />
              <FormInput
                name="dateOfBirth"
                label="Date of Birth"
                type="date"
                required
              />
            </div>

            <div className="border-t border-gray-100 my-4"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                name="mobileNo"
                label="Mobile Number"
                placeholder="10-digit Mobile"
                restrict="digitsOnly"
                required
              />
              <FormInput
                name="email"
                label="Email Address"
                placeholder="Email (Optional)"
              />
              <div className="md:col-span-2">
                <FormInput
                  name="address"
                  label="Address"
                  placeholder="Full Residential Address"
                  required
                />
              </div>
              <FormInput name="city" label="City" placeholder="City" required />
              <FormInput
                name="state"
                label="State"
                placeholder="State"
                required
              />
              <FormInput
                name="zipCode"
                label="PIN Code"
                placeholder="ZIP Code"
                restrict="digitsOnly"
                required
              />
            </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2 mb-4">
              <i className="fas fa-id-card"></i> Identity & Documents
            </h3>

            {/* Foreigner Specific */}
            {!isIndian && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
                <div className="text-blue-800 font-bold mb-4 text-sm uppercase flex items-center gap-2">
                  <i className="fas fa-plane"></i> Foreign National
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormSelect
                    name="nationality"
                    label="Nationality / Country"
                    options={[
                      { label: "United States", value: "USA" },
                      { label: "United Kingdom", value: "UK" },
                      // ... others
                      { label: "Nepal", value: "Nepal" },
                      { label: "Other", value: "Other" },
                    ]}
                    required
                  />
                  <FormInput
                    name="visaExpiryDate"
                    label="Visa Expiry Date"
                    type="date"
                    required
                  />
                  {/* Images handling... similar to Guest step 3 */}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isIndian ? (
                <FormSelect
                  name="documentType"
                  label="Document Type"
                  options={[
                    { label: "Aadhaar Card", value: "Aadhaar" },
                    { label: "PAN Card", value: "PAN" },
                    { label: "Driving License", value: "Driving License" },
                    { label: "Voter ID", value: "Voter ID" },
                  ]}
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

              {/* Document Image Import */}
              {isIndian && !isQuickAadhaar && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Document Image <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      onChange={() =>
                        setFieldValue("documentImage", "dummy.jpg")
                      }
                    />
                    <div className="text-gray-400 text-sm">
                      Click to upload document
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step2IdentityStaff;
