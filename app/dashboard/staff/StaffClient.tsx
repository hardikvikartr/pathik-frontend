"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Staff } from "@/app/types";
import { staffService } from "@/app/services/staffService";
import StaffTable from "./StaffTable";

interface StaffClientProps {
  initialData: Staff[];
}

export default function StaffClient({ initialData }: StaffClientProps) {
  // Initialize with server data, but we might likely be empty on server if using Mock/LocalStorage
  const [staffList, setStaffList] = useState<Staff[]>(initialData);
  const [loading, setLoading] = useState(initialData.length === 0);

  useEffect(() => {
    if (initialData.length > 0) {
      setLoading(false);
      return;
    }

    const hydrateData = async () => {
      try {
        const clientData = await staffService.getAllStaff();
        setStaffList(clientData);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    hydrateData();
  }, []);

  // Helper to get initials
  const getInitials = (first: string, last: string) => {
    return `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase();
  };

  return (
    <div className="md:p-6 p-2 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex md:flex-row flex-col justify-between md:items-center items-start gap-y-2 mb-8">
        <div>
          <h1 className="md:text-3xl text-2xl font-bold text-pathik-text-dark">
            Staff Management
          </h1>
          <p className="text-gray-500">
            Manage your hotel staff and their details.
          </p>
        </div>
        <Link
          href="/dashboard/staff/add"
          className="bg-pathik-primary text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-pathik-secondary transition-all flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> Add New Staff
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pathik-primary"></div>
        </div>
      ) : (
        <StaffTable staffList={staffList} getInitials={getInitials} />
      )}
    </div>
  );
}
