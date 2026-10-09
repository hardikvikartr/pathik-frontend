"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { TOAST_MESSAGES } from "../../utils/messages";
import { Permission } from "../../types";

import Loader from "@/app/components/Loader";
import adminService from "@/app/services/admin/adminService";

export default function PermissionsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    apiName: "",
  });

  // Authorization Check
  useEffect(() => {
    if (user && user.role !== "SUPER_ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Load Permissions
  useEffect(() => {
    // const saved = localStorage.getItem("pathikPermissions");
    // if (saved) {
    //   setPermissions(JSON.parse(saved));
    // } else {
    //   // Default Permissions
    //   const defaults: Permission[] = [
    //     {
    //       id: "p1",
    //       name: "Create Hotels",
    //       apiName: "create_hotel",
    //       grouping: "hotel",
    //     },
    //     {
    //       id: "p2",
    //       name: "Read Hotels",
    //       apiName: "read_hotel",
    //       grouping: "hotel",
    //     },
    //     {
    //       id: "p3",
    //       name: "Update Hotels",
    //       apiName: "update_hotel",
    //       grouping: "hotel",
    //     },
    //     {
    //       id: "p4",
    //       name: "Delete Hotels",
    //       apiName: "delete_hotel",
    //       grouping: "hotel",
    //     },
    //     {
    //       id: "p5",
    //       name: "Read Guests",
    //       apiName: "read_guest",
    //       grouping: "guest",
    //     },
    //     {
    //       id: "p6",
    //       name: "Create Guests",
    //       apiName: "create_guest",
    //       grouping: "guest",
    //     },
    //     {
    //       id: "p7",
    //       name: "Update Guests",
    //       apiName: "update_guest",
    //       grouping: "guest",
    //     },
    //     {
    //       id: "p8",
    //       name: "Delete Guests",
    //       apiName: "delete_guest",
    //       grouping: "guest",
    //     },
    //   ];
    //   setPermissions(defaults);
    //   localStorage.setItem("pathikPermissions", JSON.stringify(defaults));
    // }
    fetchPermissions()
  }, []);

  const fetchPermissions = async () => {
    setLoading(true)
    const response = await adminService.fetchPermissions();
    if (response.code === 200) {
      const apiData = Array.isArray(response.data) ? response.data : [];
      const updatedData = apiData.map((item: Permission) => ({
        ...item,
        grouping: deriveGrouping(item.identifier)
      }))
      setPermissions(updatedData)
    }
    setLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "apiName") {
      const regex = /[^a-zA-Z_]/g;
      if (regex.test(value)) {
        // Don't update state if invalid characters
        return;
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  const deriveGrouping = (apiName: string): string => {
    // Expecting format like create_hotel or read_guest
    const parts = apiName.split("_");
    if (parts.length > 1) {
      // Assuming suffix is the group, e.g. create_hotel -> hotel
      return parts.slice(1).join("_");
    }
    return "other";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.apiName) {
      toast.error(TOAST_MESSAGES.validation.fillAllFields);
      return;
    }

    if (!formData.apiName.includes("_")) {
      toast.error(TOAST_MESSAGES.validation.apiIdentifierFormat);
      return;
    }

    const validPrefixes = ["create_", "read_", "update_", "delete_"];
    const matchedPrefix = validPrefixes.find((prefix) =>
      formData.apiName.startsWith(prefix),
    );

    if (!matchedPrefix) {
      // @ts-ignore - Message added in previous step
      toast.error(TOAST_MESSAGES.validation.apiIdentifierPrefix);
      return;
    }

    // Check if there is content after the prefix
    const suffix = formData.apiName.slice(matchedPrefix.length);
    if (!suffix || suffix.trim() === "") {
      toast.error(TOAST_MESSAGES.validation.apiIdentifierFormat);
      return;
    }

    const grouping = deriveGrouping(formData.apiName);

    const newPerm: Permission = {
      id: `PERM-${Date.now()}`,
      permission_name: formData.name,
      identifier: formData.apiName,
      grouping: grouping,
    };

    const updated = [...permissions, newPerm];
    setPermissions(updated);
    localStorage.setItem("pathikPermissions", JSON.stringify(updated));
    setFormData({ name: "", apiName: "" });
    toast.success(TOAST_MESSAGES.success.permissionCreated);
  };

  const handleDelete = (id: string) => {
    const updated = permissions.filter((p) => p.id !== id);
    setPermissions(updated);
    localStorage.setItem("pathikPermissions", JSON.stringify(updated));
    toast.success(TOAST_MESSAGES.success.permissionDeleted);
  };

  if (!user || user.role !== "SUPER_ADMIN") return null;

  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <h1 className="text-2xl font-bold text-pathik-text-dark mb-1">
          Permission Management
        </h1>
        <p className="text-pathik-text-light text-sm">
          Define capabilities for system resources
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Create Form */}
        {/* <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
            <h2 className="text-lg font-bold text-pathik-text-dark mb-4 border-b border-gray-100 pb-2">
              Add New Permission
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Permission Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Create Reports"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-pathik-primary/20 focus:border-pathik-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  API Identifier
                </label>
                <input
                  type="text"
                  name="apiName"
                  value={formData.apiName}
                  onChange={handleInputChange}
                  placeholder="e.g. create_report"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-pathik-primary/20 focus:border-pathik-primary transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: action_resource (snake_case)
                </p>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-pathik-primary text-white rounded-lg font-semibold hover:bg-pathik-secondary transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <i className="fas fa-plus"></i> Add Permission
              </button>
            </form>
          </div>
        </div> */}

        {/* List */}
        {
          loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader message="Loading permissions..." />
            </div>
          ) : (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          API ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                          Group
                        </th>
                        {/* <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                      Action
                    </th> */}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {permissions.map((perm) => (
                        <tr
                          key={perm.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-3 text-sm font-medium text-gray-800">
                            {perm.permission_name}
                          </td>
                          <td className="px-6 py-3 text-sm font-mono text-blue-600 bg-blue-50/50 rounded">
                            {perm.identifier}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-600">
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200 uppercase">
                              {perm.grouping}
                            </span>
                          </td>
                          {/* <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => handleDelete(perm.id)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 w-8 h-8 rounded-full flex items-center justify-center transition-all ml-auto"
                          title="Delete Permission"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td> */}
                        </tr>
                      ))}
                      {permissions.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-gray-400">
                            No permissions defined yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        }
      </div>
    </div>
  );
}
