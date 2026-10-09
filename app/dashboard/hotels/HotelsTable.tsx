"use client";

import { Hotel } from "../../types";

interface HotelsTableProps {
  hotels: Hotel[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onStatusToggle: (id: string, currentStatus: string) => void;
}

export default function HotelsTable({
  hotels,
  onView,
  onEdit,
  onStatusToggle,
}: HotelsTableProps) {
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
                Hotel Name
              </th>
              <th className="p-4 text-left font-semibold text-sm text-pathik-text-dark">
                Owner Details
              </th>
              <th className="p-4 text-left font-semibold text-sm text-pathik-text-dark">
                Accommodation Type
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
            {hotels.map((hotel ,index ) => (
              <tr
                key={hotel.id}
                className="border-b border-pathik-border last:border-0 hover:bg-gray-50 transition-colors"
              >
                <td className="p-4 text-sm font-medium text-pathik-primary">
                  {/* {hotel.id} */}
                   {index + 1}
                </td>
                <td className="p-4 text-sm font-semibold text-pathik-text-dark">
                  {hotel.hotel_name}
                  <div className="text-xs font-normal text-gray-500 mt-0.5">
                    {hotel.email}
                  </div>    
                </td>
                <td className="p-4 text-sm text-pathik-text-medium">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-700">
                      {hotel.owner_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {hotel.owner_email}
                    </span>
                  </div>
                </td>
                <td
                  className="p-4 text-sm text-pathik-text-medium max-w-[200px] truncate"
                  title={hotel.accommodation_type}
                >
                  {hotel.accommodation_type}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${hotel.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-yellow-800"}`}
                  >
                    {hotel.status === "active" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView(hotel.id)}
                      className="text-gray-400 hover:text-pathik-primary hover:bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer"
                      title="View Details"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button
                      onClick={() => onEdit(hotel.id)}
                      className="text-gray-400 hover:text-pathik-primary hover:bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer"
                      title="Edit"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    {/* Status Toggle Switch */}
                    <button
                      onClick={() =>
                        onStatusToggle(hotel.id, hotel.status || "active")
                      }
                      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${hotel.status === "active" ? "bg-green-500" : "bg-gray-200"}`}
                      title={
                        hotel.status === "active"
                          ? "Deactivate"
                          : "Activate"
                      }
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 inline-block w-4 h-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${hotel.status === "active" ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {hotels.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  No hotels registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
 