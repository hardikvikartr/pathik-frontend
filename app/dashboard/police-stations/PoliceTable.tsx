"use client";

import Link from "next/link";
import { PoliceStation } from "../../types";

interface PoliceTableProps {
  stations: PoliceStation[];
  onStatusToggle: (id: string, currentStatus: string) => void;
}

export default function PoliceTable({
  stations,
  onStatusToggle,
}: PoliceTableProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm animate-[fadeInUp_0.5s_ease-out]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] border-collapse">
          <thead>
            <tr className="bg-pathik-bg-light border-b border-pathik-border">
              <th className="p-4 text-left font-semibold text-sm text-pathik-text-dark w-[100px]">
                ID
              </th>
              <th className="p-4 text-left font-semibold text-sm text-pathik-text-dark">
                Station Name
              </th>
              <th className="p-4 text-left font-semibold text-sm text-pathik-text-dark">
                District
              </th>
              <th className="p-4 text-left font-semibold text-sm text-pathik-text-dark">
                Sector/Zone
              </th>
              <th className="p-4 text-left font-semibold text-sm text-pathik-text-dark">
                Contact
              </th>
              <th className="p-4 text-left font-semibold text-sm text-pathik-text-dark">
                Status
              </th>
              <th className="p-4 text-left font-semibold text-sm text-pathik-text-dark">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {stations.map((station , index) => (
              <tr
                key={station.id}
                className="border-b border-pathik-border last:border-0 hover:bg-gray-50 transition-colors"
              >
                <td className="p-4 text-sm font-medium text-pathik-primary">
                  {index + 1}
                </td>
                <td className="p-4 text-sm font-semibold text-pathik-text-dark">
                  {station.name}
                </td>
                <td className="p-4 text-sm text-pathik-text-medium">
                  {station.district}
                </td>
                <td className="p-4 text-sm text-pathik-text-medium">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded w-fit">
                      {station.sector}
                    </span>
                    <span className="text-xs text-gray-500">
                      {station.zone}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-sm text-pathik-text-medium">
                  <div className="flex flex-col">
                    <span className="text-xs">
                      <i className="fas fa-envelope mr-1 text-gray-400"></i>
                      {station.email}
                    </span>
                    <span className="text-xs">
                      <i className="fas fa-phone mr-1 text-gray-400"></i>
                      {station.mobile}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${station.status === "inactive" ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700"}`}
                  >
                    {station.status === "inactive" ? "Inactive" : "Active"}
                  </span>
                </td>
                <td className="p-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/police-stations/${station.id}`}
                      className="text-gray-400 hover:text-pathik-primary hover:bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                      title="View Details"
                    >
                      <i className="fas fa-eye"></i>
                    </Link>
                    <Link
                      href={`/dashboard/police-stations/${station.id}/edit`}
                      className="text-gray-400 hover:text-pathik-primary hover:bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </Link>
                    {/* Status Toggle */}
                    <button
                      onClick={() =>
                        onStatusToggle(station.id, station.status || "active")
                      }
                      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${station.status === "inactive" ? "bg-gray-200" : "bg-green-500"}`}
                      title={
                        station.status === "inactive"
                          ? "Activate"
                          : "Deactivate"
                      }
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 inline-block w-4 h-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${station.status === "inactive" ? "translate-x-0" : "translate-x-5"}`}
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {stations.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  No police stations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
