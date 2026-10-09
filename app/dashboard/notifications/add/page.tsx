"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Notification } from "@/app/types";
import FormInput from "@/app/components/FormInput";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";

export default function AddNotificationPage() {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Validation schema
  const validationSchema = Yup.object({
    title: Yup.string()
      .required("Title is required")
      .max(100, "Title must be less than 100 characters"),
    message: Yup.string()
      .required("Message is required")
      .max(500, "Message must be less than 500 characters"),
    role: Yup.string()
      .oneOf(["SUPER_ADMIN", "POLICE_STATION", "HOTEL", "all"])
      .required("Role is required"),
    image: Yup.string().optional(),
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      message: "",
      role: "all" as Notification["role"],
      image: "",
    },
    validationSchema,
    onSubmit: (values) => {
      // Load existing notifications
      const savedNotifications = localStorage.getItem("pathikNotifications");
      const existingNotifications: Notification[] = savedNotifications
        ? JSON.parse(savedNotifications)
        : [];

      const newNotification: Notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: values.title,
        message: values.message,
        role: values.role,
        image: values.image || undefined,
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      const updated = [newNotification, ...existingNotifications];
      localStorage.setItem("pathikNotifications", JSON.stringify(updated));

      toast.success("Notification added successfully!");
      router.push("/dashboard/notifications");
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        formik.setFieldValue("image", base64String);
        setImagePreview(base64String);
      };
      reader.onerror = () => {
        toast.error("Error reading image file");
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    formik.setFieldValue("image", "");
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById("imageInput") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div className="animate-[fadeIn_0.5s_ease-out] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-pathik-primary hover:scale-110 transition-all"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-pathik-text-dark">
            Add New Notification
          </h1>
          <p className="text-pathik-text-light text-sm">
            Create a new notification for system users
          </p>
        </div>
      </div>

      {/* Form */}
      <FormikProvider value={formik}>
        <form
          onSubmit={formik.handleSubmit}
          className="bg-white rounded-xl shadow-sm overflow-hidden border border-pathik-border"
        >
          {/* Basic Information Section */}
          <div className="p-8 border-b border-pathik-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-pathik-primary/10 flex items-center justify-center">
                <i className="fas fa-info-circle text-pathik-primary"></i>
              </div>
              <h2 className="text-xl font-bold text-pathik-text-dark">
                Basic Information
              </h2>
            </div>

            <div className="space-y-5">
              <FormInput
                label="Title"
                name="title"
                placeholder="Enter notification title"
                required
                icon="fa-heading"
              />

              <div>
                <label className="font-medium text-pathik-text-dark mb-1.5 block text-sm">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formik.values.message}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={5}
                  placeholder="Enter notification message"
                  className={`w-full p-3 border-[1.5px] rounded-lg text-sm bg-pathik-bg-light outline-none transition-all placeholder:text-gray-400 resize-y ${
                    formik.touched.message && formik.errors.message
                      ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-pathik-border focus:border-pathik-primary focus:bg-white focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
                  }`}
                />
                {formik.touched.message && formik.errors.message && (
                  <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <i className="fas fa-exclamation-circle"></i>
                    {formik.errors.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="p-8 border-b border-pathik-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-pathik-secondary/10 flex items-center justify-center">
                <i className="fas fa-image text-pathik-secondary"></i>
              </div>
              <h2 className="text-xl font-bold text-pathik-text-dark">
                Notification Image
              </h2>
            </div>

            <div>
              {imagePreview ? (
                <div className="relative">
                  <div className="border-2 border-pathik-border rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-h-64 object-contain bg-pathik-bg-light"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    title="Remove image"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </div>
              ) : (
                <div className="border-[1.5px] border-dashed border-pathik-border rounded-lg p-8 text-center bg-pathik-bg-light transition-all cursor-pointer hover:border-pathik-primary hover:bg-pathik-primary/5 group relative">
                  <input
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleImageChange}
                  />
                  <i className="fas fa-cloud-upload-alt text-4xl text-pathik-primary mb-3"></i>
                  <div className="text-sm font-medium text-pathik-text-dark mb-1">
                    Click to upload image
                  </div>
                  <div className="text-xs text-pathik-text-light">
                    PNG, JPG, GIF up to 5MB
                  </div>
                </div>
              )}
              {formik.touched.image && formik.errors.image && (
                <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <i className="fas fa-exclamation-circle"></i>
                  {formik.errors.image}
                </div>
              )}
            </div>
          </div>

          {/* Role Selection Section */}
          <div className="p-8 border-b border-pathik-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-pathik-primary/10 flex items-center justify-center">
                <i className="fas fa-user-tag text-pathik-primary"></i>
              </div>
              <h2 className="text-xl font-bold text-pathik-text-dark">
                Target Role
              </h2>
            </div>

            <div>
              <label className="font-medium text-pathik-text-dark mb-1.5 block text-sm">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formik.values.role}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full p-3 border-[1.5px] rounded-lg text-sm bg-pathik-bg-light outline-none transition-all ${
                  formik.touched.role && formik.errors.role
                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-pathik-border focus:border-pathik-primary focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
                }`}
              >
                <option value="all">All Users</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="POLICE_STATION">Police Station</option>
                <option value="HOTEL">Hotel</option>
              </select>
              {formik.touched.role && formik.errors.role && (
                <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <i className="fas fa-exclamation-circle"></i>
                  {formik.errors.role}
                </div>
              )}
              <p className="text-xs text-pathik-text-light mt-1">
                Select which user role should receive this notification
              </p>
            </div>
          </div>

          {/* Preview Section */}
          <div className="p-8 bg-pathik-bg-light">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-pathik-primary/10 flex items-center justify-center">
                <i className="fas fa-eye text-pathik-primary"></i>
              </div>
              <h2 className="text-xl font-bold text-pathik-text-dark">
                Preview
              </h2>
            </div>

            <div className="bg-white rounded-lg p-4 border-2 border-pathik-border">
              <div className="flex items-start gap-4">
                {imagePreview ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 border-pathik-border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-pathik-primary/10 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-bell text-pathik-primary text-2xl"></i>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-base font-semibold text-pathik-text-dark">
                      {formik.values.title || "Notification Title"}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-pathik-primary/10 text-pathik-primary text-xs">
                      {formik.values.role === "all"
                        ? "All Users"
                        : formik.values.role === "SUPER_ADMIN"
                        ? "Super Admin"
                        : formik.values.role === "POLICE_STATION"
                        ? "Police Station"
                        : "Hotel"}
                    </span>
                  </div>
                  <p className="text-sm text-pathik-text-medium mb-2">
                    {formik.values.message || "Notification message will appear here..."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-8 border-t border-pathik-border bg-gray-50 flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border-2 border-pathik-border rounded-lg text-pathik-text-medium hover:border-pathik-primary hover:text-pathik-primary transition-colors font-semibold"
            >
              <i className="fas fa-times mr-2"></i>
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-pathik-primary to-pathik-secondary text-white rounded-lg hover:shadow-lg transition-all font-semibold"
            >
              <i className="fas fa-check mr-2"></i>
              Add Notification
            </button>
          </div>
        </form>
      </FormikProvider>
    </div>
  );
}