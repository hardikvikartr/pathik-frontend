"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { PoliceStation, Role } from "../../../types";
import { toast } from "react-toastify";
import { TOAST_MESSAGES } from "../../../utils/messages";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import FormInput from "@/app/components/FormInput";
import FormSelect from "@/app/components/FormSelect";
import policeStationService, {
  AddPolicePayload,
} from "@/app/services/policeStation/policeStationService";
import adminService from "@/app/services/admin/adminService";
import Loader from "@/app/components/Loader";

export default function AddPoliceStation() {
  const router = useRouter();
  const { user } = useAuth();

  const [roles, setRoles] = useState<Role[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authorization Check
  useEffect(() => {
    if (user && user.role !== "SUPER_ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Load Roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await adminService.getRolesWithPermissions();
        if (response.code === 200 && Array.isArray(response.data)) {
          const mappedRoles: Role[] = response.data.map((r: any) => ({
            id: r.id?.toString() || "",
            name: r.role_name || "",
            permissionIds: [], // Not needed for selection
          }));
          setRoles(mappedRoles);
        }
      } catch (error) {
        // console.error("Failed to fetch roles", error);
        toast.error("Failed to load roles");
      }
    };
    fetchRoles();
  }, []);

  const validationSchema = Yup.object({
    name: Yup.string().required("Station Name is required"),
    district: Yup.string().required("District is required"),
    sector: Yup.string().required("Sector is required"),
    zone: Yup.string().required("Zone is required"),
    division: Yup.string().required("Division is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    mobile: Yup.string()
      .matches(/^\d{10}$/, "Mobile number must be exactly 10 digits")
      .required("Mobile is required"),
    roleId: Yup.string().required("Role assignment is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      district: "",
      name: "",
      sector: "",
      zone: "",
      division: "",
      email: "",
      mobile: "",
      roleId: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        // Create new station object
        const newStation: AddPolicePayload = {
          state_id: 1,
          district_id: 1,
          district: values.district,
          division: values.division,
          email: values.email,
          mobile: parseInt(values.mobile),
          police_station: values.name,
          sector: values.sector,
          zone: values.zone,
          role_id: parseInt(values.roleId),
          password: values.password,
        };

        // Save to API
        const response = await policeStationService.addPoliceStation(newStation);
        if (response?.code === 200) {
          toast.success(response.message || TOAST_MESSAGES.success.stationAdded);
          router.push("/dashboard/police-stations");
        } else {
          setIsSubmitting(false); // Only stop loading if failed
        }
      } catch (error) {
        setIsSubmitting(false);
      }
    },
  });

  if (!user || user.role !== "SUPER_ADMIN") return null;

  if (isSubmitting) {
    return <Loader message="Adding Police Station..." />;
  }

  return (
    <div className="animate-[fadeIn_0.5s_ease-out] max-w-9xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-pathik-primary hover:scale-110 transition-all cursor-pointer"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-pathik-text-dark">
            Add New Police Station
          </h1>
          <p className="text-pathik-text-light text-sm">
            Onboard a new station and assign permissions
          </p>
        </div>
      </div>

      <FormikProvider value={formik}>
        <form
          onSubmit={formik.handleSubmit}
          noValidate
          className="bg-white rounded-xl shadow-sm overflow-hidden border border-pathik-border"
        >
          {/* Basic Info Section */}
          <div className="p-8 border-b border-pathik-border">
            <h2 className="text-lg font-bold text-pathik-text-dark mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-pathik-primary/10 text-pathik-primary flex items-center justify-center text-sm">
                <i className="fas fa-info"></i>
              </span>
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormInput
                name="district"
                label="District"
                placeholder="e.g. Gandhinagar"
                icon="fa-map-marker-alt"
                required
              />

              <FormInput
                name="name"
                label="Station Name"
                placeholder="e.g. Sector 7 Police Station"
                icon="fa-building-shield"
              />
              <FormInput
                name="sector"
                label="Sector / Area"
                placeholder="e.g. Sector 7"
                required
              />

              <FormInput
                name="zone"
                label="Zone"
                placeholder="e.g. Zone 1"
                required
              />

              <FormInput
                name="division"
                label="Division"
                placeholder="e.g. Central Division"
                required
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="p-8 border-b border-pathik-border bg-gray-50/50">
            <h2 className="text-lg font-bold text-pathik-text-dark mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-pathik-primary/10 text-pathik-primary flex items-center justify-center text-sm">
                <i className="fas fa-address-book"></i>
              </span>
              Contact Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormInput
                name="email"
                label="Official Email"
                type="email"
                placeholder="station@gujaratpolice.gov.in"
                icon="fa-envelope"
                required
              />
              <FormInput
                name="mobile"
                label="Contact Number"
                restrict="digitsOnly"
                placeholder="+91 98765 43210"
                icon="fa-phone"
                required
              />
              <FormInput
                name="password"
                label="System Password"
                type="password"
                placeholder="••••••••"
                icon="fa-lock"
                required
              />
            </div>
          </div>

          {/* Access Control with Roles */}
          <div className="p-8">
            <h2 className="text-lg font-bold text-pathik-text-dark mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-pathik-primary/10 text-pathik-primary flex items-center justify-center text-sm">
                <i className="fas fa-user-shield"></i>
              </span>
              Access Control
            </h2>
            <div className="max-w-xl">
              <FormSelect
                name="roleId"
                label="Assign Role"
                required
                options={roles.map((r) => ({ label: r.name, value: r.id }))}
              />
              <p className="text-sm text-gray-500 mt-2">
                <i className="fas fa-info-circle mr-1"></i>
                Roles define the permissions this station will have. You can
                manage roles in Settings.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-6 bg-gray-50 border-t border-pathik-border flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-linear-to-r from-pathik-primary to-pathik-secondary text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
            >
              <i className="fas fa-check"></i>
              Create Station
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
}
