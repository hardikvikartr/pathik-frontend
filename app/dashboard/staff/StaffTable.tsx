"use client";

import Link from "next/link";
import { Staff } from "@/app/types";

interface StaffTableProps {
  staffList: Staff[];
  getInitials: (first: string, last: string) => string;
}

export default function StaffTable({
  staffList,
  getInitials,
}: StaffTableProps) {
  // Group by Status (Current vs Previous)
  const groupedStaff = staffList.reduce(
    (acc, staff) => {
      const type = staff.exitDate ? "Previous Staff" : "Current Staff";
      if (!acc[type]) acc[type] = [];
      acc[type].push(staff);
      return acc;
    },
    {} as Record<string, Staff[]>,
  );

  // Sort Current Staff
  if (groupedStaff["Current Staff"]) {
    groupedStaff["Current Staff"].sort((a, b) => {
      const getPriority = (s: Staff) => {
        const type = s.employeeTypeOther || s.employeeType;
        if (type?.toLowerCase().includes("owner")) return 0;
        if (type === "Manager") return 1;
        return 2;
      };
      return getPriority(a) - getPriority(b);
    });
  }

  if (Object.keys(groupedStaff).length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <i className="fas fa-users-slash text-4xl mb-4 text-gray-400"></i>
        <p>No staff members found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {["Current Staff", "Previous Staff"].map((category) => {
        const staffMembers = groupedStaff[category];
        if (!staffMembers || staffMembers.length === 0) return null;

        return (
          <div
            key={category}
            className="bg-white rounded-2xl shadow-sm border border-pathik-border overflow-hidden"
          >
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-pathik-text-dark flex items-center gap-2">
                <span
                  className={`w-2 h-6 rounded-full ${category === "Previous Staff" ? "bg-gray-400" : "bg-pathik-primary"}`}
                ></span>
                {category}
              </h2>
              <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
                {staffMembers.length}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-sm text-gray-500 uppercase">
                    <th className="px-6 py-4 font-semibold">Name</th>
                    <th className="px-6 py-4 font-semibold">Type</th>
                    <th className="px-6 py-4 font-semibold">Contact</th>
                    <th className="px-6 py-4 font-semibold">Dates</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {staffMembers.map((staff) => {
                    const type = staff.employeeTypeOther || staff.employeeType;
                    const isOwner = type?.toLowerCase().includes("owner");
                    const isManager = type === "Manager";
                    const isHighlighted =
                      !staff.exitDate && (isOwner || isManager);

                    return (
                      <tr
                        key={staff.id}
                        className={`border-b border-gray-50 transition-colors last:border-none 
                            ${isHighlighted ? "bg-amber-50/60 hover:bg-amber-100/60" : "hover:bg-gray-50/50"}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {staff.profileImage ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={staff.profileImage}
                                alt={staff.firstName}
                                className={`w-10 h-10 rounded-full object-cover border-2 ${isHighlighted ? "border-amber-200" : "border-gray-200"}`}
                              />
                            ) : (
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs 
                                ${isHighlighted ? "bg-amber-100 text-amber-700" : "bg-pathik-primary/10 text-pathik-primary"}`}
                              >
                                {getInitials(staff.firstName, staff.lastName)}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-gray-800 flex items-center gap-2">
                                {staff.firstName} {staff.middleName}{" "}
                                {staff.lastName}
                                {isOwner && (
                                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                                    OWNER
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {staff.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="font-medium text-gray-700">
                            {type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-2">
                              <i className="fas fa-phone text-xs opacity-60"></i>{" "}
                              {staff.mobileNo}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-green-600 font-medium">
                              Joined: {staff.joinedDate}
                            </span>
                            {staff.exitDate && (
                              <span className="text-xs text-red-500 font-medium">
                                Exit: {staff.exitDate}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${!staff.exitDate && staff.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                          >
                            {staff.exitDate ? "Left" : staff.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/dashboard/staff/edit/${staff.id}`}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Staff"
                            >
                              <i className="fas fa-edit"></i>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
