"use client";
import { toast } from "react-toastify";
import { useAuth } from "@/app/context/AuthContext";
import { Hotel } from "@/app/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormik, FormikProvider, FieldArray } from "formik";
import * as Yup from "yup";
import FormInput from "@/app/components/FormInput";
import hotelService from "@/app/services/hotel/hotelService";
import { useState } from "react";

export default function HotelOnboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type") || "1";
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Derived Values
  const accommodationType = parseInt(typeParam);
  const typeLabel =
    accommodationType === 2
      ? "PG / Guest House"
      : accommodationType === 3
        ? "Home Stay"
        : "Hotel";
  const typeIcon =
    accommodationType === 2
      ? "fa-home"
      : accommodationType === 3
        ? "fa-tree"
        : "fa-hotel";

  // 1 = Hotel, 2 = PG, 3 = Homestay
  const isHotel = accommodationType === 1;

  const validationSchema = Yup.object({
    name: Yup.string().required(`${typeLabel} Name is required`),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    username: Yup.string()
      .matches(/^\S*$/, "Username cannot contain spaces")
      .required("Username is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      )
      .required("Password is required"),
    ownerName: Yup.string().required("Owner Name is required"),
    ownerEmail: Yup.string()
      .email("Invalid email")
      .required("Owner Email is required"),
    ownerMobile: Yup.string()
      .matches(/^\d{10}$/, "Owner Mobile must be exactly 10 digits")
      .required("Owner Mobile is required"),
    // address: Yup.string().required("Address is required"), // access validation via array now
    // address: Yup.string().required("Address is required"), // access validation via array now
    addresses: Yup.array()
      .of(Yup.string().required("Address is required"))
      .min(1, "At least one address is required"),
    primaryMobile: Yup.string()
      .matches(/^\d{10}$/, "Primary Mobile must be exactly 10 digits")
      .required("Primary Mobile is required"),
    managerName: Yup.string().required("Manager Name is required"),
    managerEmail: Yup.string()
      .email("Invalid email")
      .required("Manager Email is required"),
    managerMobile: Yup.string()
      .matches(/^\d{10}$/, "Manager Mobile must be exactly 10 digits")
      .required("Manager Mobile is required"),
    hotelWebUrl: Yup.string()
      .url("Invalid URL")
      .required("Hotel Website URL is required"),
    noOfRooms: Yup.number()
      .min(1, "At least one room is required")
      .required("Number of Rooms is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      ownerName: "",
      ownerEmail: "",
      ownerMobile: "",
      // address: "",
      // address: "",
      addresses: [""],
      username: "",
      password: "",
      primaryMobile: "",
      managerName: "",
      managerEmail: "",
      managerMobile: "",
      hotelWebUrl: "",
      noOfRooms: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const accommodationTypeLabel =
          accommodationType === 2
            ? "PG"
            : accommodationType === 3
              ? "HOME_STAY"
              : "HOTEL";

        const payload = {
          accommodation_type: accommodationTypeLabel as
            | "HOTEL"
            | "PG"
            | "HOME_STAY",
          username: values.username,
          password: values.password, // Sending plain password as per prototype assumption
          hotel_name: values.name,
          // hotel_code: `HTL-${String(Date.now()).slice(-4)}`,
          email: values.email,
          phone_no: Number(values.primaryMobile),
          website_url: values.hotelWebUrl,
          address: values.addresses.map((addr) => ({
            location: addr, // addr is string from form
            sublocation: "",
            latitude: 0.0,
            longitude: 0.0,
          })),
          owner_name: values.ownerName,
          owner_email: values.ownerEmail,
          owner_phone: Number(values.ownerMobile),
          manager_name: values.managerName,
          manager_email: values.managerEmail,
          manager_phone: Number(values.managerMobile),
          no_of_rooms: Number(values.noOfRooms),
        };
        setLoading(true);

        const response = await hotelService.addHotel(payload);

        if (response.code === 200) {
          toast.success(
            response.message || `${typeLabel} Onboarded Successfully!`,
          );
          router.push("/dashboard/hotels");
        }
      } catch (error: any) {
      } finally {
        setLoading(false);
      }
    },
  });

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
            Onboard New {typeLabel}
          </h1>
          <p className="text-pathik-text-light text-sm">
            Register a new {typeLabel.toLowerCase()} under your jurisdiction
          </p>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form
          onSubmit={formik.handleSubmit}
          className="bg-white rounded-xl shadow-sm overflow-hidden p-8 border border-pathik-border"
        >
          {/* Account Information */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-pathik-text-dark mb-4 pb-2 border-b border-pathik-border flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
                <i className="fas fa-user-shield"></i>
              </span>
              Account Credentials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                name="username"
                label="Username"
                placeholder={`e.g. ${typeLabel.toLowerCase().replace(/\s/g, "")}_user`}
                icon="fa-user"
                required
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === " ") {
                    e.preventDefault();
                  }
                }}
              />
              <FormInput
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                icon={showPassword ? "fa-eye" : "fa-eye-slash"}
                onIconClick={() => setShowPassword(!showPassword)}
                required
              />
            </div>
          </div>

          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-pathik-text-dark mb-4 pb-2 border-b border-pathik-border flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">
                <i className={`fas ${typeIcon}`}></i>
              </span>
              Property Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                name="name"
                label={`${typeLabel} Name`}
                placeholder={`e.g. ${typeLabel} Grand`}
                icon="fa-building"
                required
              />
              <FormInput
                name="email"
                label="Official Email"
                type="email"
                placeholder={`e.g. info@${typeLabel.toLowerCase().replace(/\s/g, "")}.com`}
                icon="fa-envelope"
                required
              />
              <FormInput
                name="primaryMobile"
                label="Primary Contact Number"
                restrict="digitsOnly"
                placeholder="e.g. 07912345678"
                icon="fa-phone"
                maxLength={10}
                required
              />
              <FormInput
                name="hotelWebUrl"
                label="Hotel Website URL"
                placeholder="e.g. https://www.hotelgrand.com"
                icon="fa-globe"
                required
              />
              <FormInput
                name="noOfRooms"
                label="Number of Rooms"
                placeholder="e.g. 50"
                icon="fa-bed"
                restrict="digitsOnly"
                required
              />

              <div className="md:col-span-2">
                <FieldArray
                  name="addresses"
                  render={(arrayHelpers) => (
                    <div className="flex flex-col gap-4">
                      {formik.values.addresses.map((addr, index) => (
                        <div key={index} className="flex gap-2 items-start">
                          <div className="flex-1">
                            <FormInput
                              name={`addresses.${index}`}
                              label={
                                index === 0
                                  ? "Address"
                                  : `Additional Address ${index}`
                              }
                              isTextArea
                              placeholder="Enter complete address..."
                              required
                            />
                          </div>
                          {/* Show Remove Button (Trash) for additional addresses */}
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => arrayHelpers.remove(index)}
                              className="mt-8 p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove Address"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          )}
                          {/* Show Add Button (+) only for non-hotel types and on the last item */}
                          {!isHotel &&
                            index === formik.values.addresses.length - 1 && (
                              <button
                                type="button"
                                onClick={() => arrayHelpers.push("")}
                                className="mt-8 p-3 text-pathik-primary hover:bg-pathik-primary/10 rounded-lg transition-colors"
                                title="Add Another Address"
                              >
                                <i className="fas fa-plus"></i>
                              </button>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Management Details */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-pathik-text-dark mb-4 pb-2 border-b border-pathik-border flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center text-sm">
                <i className="fas fa-users"></i>
              </span>
              Management Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                name="ownerName"
                label="Owner Name"
                placeholder="e.g. Ramesh Patel"
                icon="fa-user-tie"
                required
              />
              <FormInput
                name="ownerEmail"
                label="Owner Email"
                type="email"
                placeholder="e.g. owner@email.com"
                icon="fa-envelope"
                required
              />
              <FormInput
                name="ownerMobile"
                label="Owner Mobile"
                restrict="digitsOnly"
                placeholder="e.g. 9876543210"
                icon="fa-phone"
                maxLength={10}
                required
              />
              <FormInput
                name="managerName"
                label="Manager Name"
                placeholder="e.g. Suresh Kumar"
                icon="fa-user-tag"
                required
              />
              <FormInput
                name="managerEmail"
                label="Manager Email"
                type="email"
                placeholder="e.g. manager@email.com"
                icon="fa-envelope"
                required
              />
              <FormInput
                name="managerMobile"
                label="Manager Mobile"
                restrict="digitsOnly"
                placeholder="e.g. 9876543210"
                icon="fa-phone"
                maxLength={10}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 cursor-pointer ${loading ? "bg-gray-400" : "bg-linear-to-r from-pathik-primary to-pathik-secondary"} text-white rounded-lg font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2`}
            >
              {loading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-check-circle"></i>
              )}
              Register {typeLabel}
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
}
