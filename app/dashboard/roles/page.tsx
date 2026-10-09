"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { TOAST_MESSAGES } from "../../utils/messages";
import { Role, Permission } from "../../types";
import adminService from "@/app/services/admin/adminService";
import Loader from "@/app/components/Loader";

export default function RolesPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    selectedPermissions: [] as string[],
  });

  // Authorization Check
  useEffect(() => {
    if (user && user.role !== "SUPER_ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Load Data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch permissions first
      const permResponse = await adminService.fetchPermissions();
      if (permResponse.code === 200 && Array.isArray(permResponse.data)) {
        const mappedPerms = permResponse.data.map((p: any) => ({
          ...p,
          id: p.id.toString(),
          grouping: deriveGrouping(p.identifier),
        }));
        setPermissions(mappedPerms);
      }

      // Fetch roles
      const roleResponse = await adminService.getRolesWithPermissions();
      if (roleResponse.code === 200 && Array.isArray(roleResponse.data)) {
        // Map API roles to Role type
        const mappedRoles: Role[] = roleResponse.data.map((r: any) => ({
          id: r.id?.toString() || "",
          name: r.role_name || "",
          permissionIds: r.permissions?.map((p: any) => p.id?.toString()) || [],
        }));
        setRoles(mappedRoles);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value });
  };

  const togglePermission = (permId: string) => {
    const current = formData.selectedPermissions;
    if (current.includes(permId)) {
      setFormData({
        ...formData,
        selectedPermissions: current.filter((id) => id !== permId),
      });
    } else {
      setFormData({ ...formData, selectedPermissions: [...current, permId] });
    }
  };

  const toggleAllPermissions = () => {
    if (formData.selectedPermissions.length === permissions.length) {
      setFormData({ ...formData, selectedPermissions: [] });
    } else {
      setFormData({
        ...formData,
        selectedPermissions: permissions.map((p) => p.id),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error(TOAST_MESSAGES.validation.roleNameRequired);
      return;
    }

    if (formData.selectedPermissions.length === 0) {
      toast.error(TOAST_MESSAGES.validation.permissionRequired);
      return;
    }

    try {
      setLoading(true);
      const permissionIds = formData.selectedPermissions
        .map((id) => parseInt(id))
        .filter((id) => !isNaN(id));

      const response = await adminService.addRole({
        role_name: formData.name,
        permission_ids: permissionIds,
      });

      if (response.code === 200) {
        toast.success(response.message || TOAST_MESSAGES.success.roleCreated);
        setFormData({ name: "", selectedPermissions: [] });
        fetchData(); // Reload list
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (id === "r1") {
      toast.error(TOAST_MESSAGES.error.defaultRoleDelete);
      return;
    }
    const updated = roles.filter((r) => r.id !== id);
    setRoles(updated);
    localStorage.setItem("pathikRoles", JSON.stringify(updated));
    toast.success(TOAST_MESSAGES.success.roleDeleted);
  };

  if (!user || user.role !== "SUPER_ADMIN") return null;

  // Group permissions for easier selection
  // Use the stored 'grouping' field
  const groupedPermissions: { [key: string]: Permission[] } = {};
  permissions.forEach((p) => {
    const g = p.grouping || "other";
    if (!groupedPermissions[g]) groupedPermissions[g] = [];
    groupedPermissions[g].push(p);
  });

  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <h1 className="text-2xl font-bold text-pathik-text-dark mb-1">
          Role Management
        </h1>
        <p className="text-pathik-text-light text-sm">
          Create and assign roles to Police Stations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Create Form - Wider column */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
            <h2 className="text-lg font-bold text-pathik-text-dark mb-4 border-b border-gray-100 pb-2">
              Create New Role
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Zone Inspector"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-pathik-primary/20 focus:border-pathik-primary transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Assign Permissions
                  </label>
                  <button
                    type="button"
                    onClick={toggleAllPermissions}
                    className="text-xs text-pathik-primary font-semibold hover:underline"
                  >
                    {formData.selectedPermissions.length === permissions.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg max-h-[400px] overflow-y-auto p-2">
                  {Object.keys(groupedPermissions).length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No permissions found. Add permissions first.
                    </div>
                  ) : (
                    Object.entries(groupedPermissions).map(([group, perms]) => (
                      <div key={group} className="mb-3">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 px-2">
                          {group}
                        </div>
                        <div className="space-y-1">
                          {perms.map((perm) => (
                            <label
                              key={perm.id}
                              className="flex items-center p-2 hover:bg-gray-50 cursor-pointer transition-colors rounded"
                            >
                              <input
                                type="checkbox"
                                checked={formData.selectedPermissions.includes(
                                  perm.id,
                                )}
                                onChange={() => togglePermission(perm.id)}
                                className="w-4 h-4 rounded text-pathik-primary focus:ring-pathik-primary border-gray-300"
                              />
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {perm.permission_name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {perm.identifier}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-pathik-primary text-white rounded-lg font-semibold hover:bg-pathik-secondary transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <i className="fas fa-plus"></i> Create Role
              </button>
            </form>
          </div>
        </div>

        {/* List - Wider column */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-pathik-text-dark">
                Existing Roles
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader message="Loading roles..." />
                </div>
              ) : (
                <>
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">
                            {role.name}
                          </h3>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">
                            ID: {role.id}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(role.id)}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                            title="Delete Role"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Permissions
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {role.permissionIds.map((permId, idx) => {
                            const perm = permissions.find(
                              (p) => p.id === permId,
                            );
                            return (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                              >
                                {perm ? perm.permission_name : permId}
                              </span>
                            );
                          })}
                          {role.permissionIds.length === 0 && (
                            <span className="text-sm text-gray-400 italic">
                              No permissions assigned
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {roles.length === 0 && (
                    <div className="p-8 text-center text-gray-400">
                      No roles defined yet.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
