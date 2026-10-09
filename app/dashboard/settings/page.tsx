"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import Modal from "../../components/Modal";
import adminService from "@/app/services/admin/adminService";

import Loader from "@/app/components/Loader";

interface SystemSetting {
  id: string;
  key: string;
  label: string;
  value: string;
  description: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSetting, setNewSetting] = useState({
    key: "",
    label: "",
    value: "",
    description: "",
  });

  // Load Settings
  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getSystemSettings({
        page: 1,
        record_count: 100,
      });
      if (response && response.data) {
        // Map API response to component state if needed, or use directly
        // Assuming response.data.records contains the settings list
        const settingsList = response.data || [];
        const mappedSettings = settingsList.map((s: any) => ({
          id: s.id,
          key: s.settings_name,
          label: s.settings_lable,
          value: s.settings_value,
          description: s.description || "",
        }));
        setSettings(mappedSettings);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleEdit = (setting: SystemSetting) => {
    setEditingId(setting.id);
    setEditValue(setting.value);
  };

  const handleSave = async (id: string) => {
    const settingToUpdate = settings.find((s) => s.id === id);
    if (!settingToUpdate) return;

    try {
      const payload = {
        setting_id: Number(id),
        settings_name: settingToUpdate.key,
        settings_lable: settingToUpdate.label,
        settings_value: editValue,
      };

      const response = await adminService.updateSystemSetting(payload);

      if (response && response.code === 200) {
        toast.success("Setting updated successfully");
        setEditingId(null);
        fetchSettings(); // Refresh list
      } else {
        toast.error(response?.message || "Failed to update setting");
      }
    } catch (error) {
      // Error handled in service
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleCreate = async () => {
    if (!newSetting.key || !newSetting.label || !newSetting.value) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      const payload = {
        settings_name: newSetting.key,
        settings_lable: newSetting.label,
        settings_value: newSetting.value,
        description: newSetting.description,
      };

      const response = await adminService.addSystemSetting(payload);

      if (response && response.code === 200) {
        setIsCreateModalOpen(false);
        setNewSetting({ key: "", label: "", value: "", description: "" });
        toast.success(response.message || "New setting created successfully");
        fetchSettings(); // Refresh list
      }
    } catch (error) {
      // Error handled in service
    } finally {
      setIsCreating(false);
    }
  };

  if (user?.role !== "SUPER_ADMIN") {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-xl shadow-sm">
        <div className="text-center">
          <i className="fas fa-lock text-gray-300 text-4xl mb-4"></i>
          <h2 className="text-xl font-bold text-gray-700">Access Resticted</h2>
          <p className="text-gray-500">
            You do not have permission to view system settings.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading && settings.length === 0) {
    return <Loader message="Loading settings..." />;
  }

  return (
    <div className="max-w-6xl mx-auto animate-[fadeIn_0.5s_ease-out]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-pathik-text-dark m-0">
            System Settings
          </h1>
          <p className="text-pathik-text-light text-sm mt-1">
            Manage global system configurations and parameters
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-pathik-bg-light flex items-center justify-center text-pathik-primary text-xl">
          <i className="fas fa-cogs"></i>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-pathik-primary text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-pathik-secondary transition-all shadow-sm"
        >
          <i className="fas fa-plus"></i> Create Setting
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-pathik-border overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="p-5 border-b border-pathik-border w-[250px]">
                Setting Name
              </th>
              <th className="p-5 border-b border-pathik-border w-[300px]">
                Value
              </th>
              <th className="p-5 border-b border-pathik-border">Description</th>
              <th className="p-5 border-b border-pathik-border text-right w-[150px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pathik-border">
            {settings.map((setting) => (
              <tr
                key={setting.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="p-5 align-top">
                  <span className="font-semibold text-pathik-text-dark block">
                    {setting.label}
                  </span>
                  <span className="text-xs text-gray-400 font-mono mt-1">
                    {setting.key}
                  </span>
                </td>
                <td className="p-5 align-top">
                  {editingId === setting.id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        className="w-full p-2 border border-pathik-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-pathik-primary/20 text-sm font-medium"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                      />
                      <div className="text-[10px] text-gray-400">
                        Press Save to apply
                      </div>
                    </div>
                  ) : (
                    <span className="font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg text-sm inline-block min-w-[60px] text-center">
                      {setting.value}
                    </span>
                  )}
                </td>
                <td className="p-5 align-middle text-sm text-gray-600">
                  {setting.description}
                </td>
                <td className="p-5 align-top text-right">
                  {editingId === setting.id ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleSave(setting.id)}
                        className="w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-colors"
                        title="Save"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                      <button
                        onClick={handleCancel}
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
                        title="Cancel"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(setting)}
                      className="py-1.5 px-3 border border-pathik-border rounded-lg text-xs font-semibold hover:bg-white hover:border-pathik-primary hover:text-pathik-primary transition-all flex items-center gap-2 ml-auto"
                    >
                      <i className="fas fa-pen"></i> Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Setting Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Setting"
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Max User Limit"
              value={newSetting.label}
              onChange={(e) =>
                setNewSetting({ ...newSetting, label: e.target.value })
              }
              className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pathik-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. max_user_limit"
              value={newSetting.key}
              onChange={(e) =>
                setNewSetting({
                  ...newSetting,
                  key: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                })
              }
              className="w-full p-2 border border-gray-200 rounded-lg text-sm font-mono bg-gray-50 focus:outline-none focus:border-pathik-primary"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Unique identifier (auto-formatted)
            </p>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Value <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 100"
              value={newSetting.value}
              onChange={(e) =>
                setNewSetting({ ...newSetting, value: e.target.value })
              }
              className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pathik-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              placeholder="Brief description of what this setting does"
              value={newSetting.description}
              onChange={(e) =>
                setNewSetting({ ...newSetting, description: e.target.value })
              }
              className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-pathik-primary"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-gray-600 font-medium text-sm hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className={`px-4 py-2 bg-pathik-primary text-white font-medium text-sm rounded-lg hover:bg-pathik-secondary transition-colors shadow-sm flex items-center gap-2 ${isCreating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isCreating && <i className="fas fa-spinner fa-spin"></i>}
              Create Setting
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
