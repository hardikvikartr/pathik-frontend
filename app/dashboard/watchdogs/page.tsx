"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Watchdog } from "@/app/types";

export default function WatchdogsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [watchdogs, setWatchdogs] = useState<Watchdog[]>([]);

  useEffect(() => {
    const data = localStorage.getItem("pathikWatchdogs");
    if (data) {
      setWatchdogs(JSON.parse(data));
    }
  }, []);

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to remove this watchdog entry?"))
      return;
    const updated = watchdogs.filter((w) => w.id !== id);
    setWatchdogs(updated);
    localStorage.setItem("pathikWatchdogs", JSON.stringify(updated));
    toast.info("Watchdog removed");
  };

  if (user?.role !== "SUPER_ADMIN" && user?.role !== "POLICE_STATION") {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-xl shadow-sm">
        <div className="text-center">
          <i className="fas fa-lock text-gray-300 text-4xl mb-4"></i>
          <h2 className="text-xl font-bold text-gray-700">Access Restricted</h2>
          <p className="text-gray-500">
            You do not have permission to view watchdogs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-9xl mx-auto animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-pathik-text-dark">
            Watchdogs
          </h1>
          <p className="text-gray-500 text-sm">
            Monitor specific individuals across the system
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/watchdogs/add")}
          className="bg-pathik-primary text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-pathik-secondary transition-all flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> Add Watchdog
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-pathik-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-linear-to-r from-gray-50 to-white text-xs font-extrabold text-pathik-primary uppercase tracking-wider border-b border-pathik-border">
              <tr>
                <th className="p-5 border-b border-gray-100">Person Name</th>
                <th className="p-5 border-b border-gray-100">Mobile / Email</th>
                <th className="p-5 border-b border-gray-100">ID Proof</th>
                <th className="p-5 border-b border-gray-100">Location</th>
                <th className="p-5 border-b border-gray-100">
                  Reporting Officer
                </th>
                <th className="p-5 border-b border-gray-100">Status</th>
                <th className="p-5 border-b border-gray-100 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {watchdogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <i className="fas fa-search text-3xl text-gray-300"></i>
                      <p>No watchdogs monitored currently.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                watchdogs.map((w) => (
                  <tr
                    key={w.id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-pathik-primary/10 text-pathik-primary flex items-center justify-center text-xs font-bold">
                          {w.personName.charAt(0)}
                        </div>
                        <div className="font-bold text-gray-800">
                          {w.personName}
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-sm">
                      <div className="font-mono text-gray-700 font-medium">
                        {w.contact1}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {w.email1}
                      </div>
                    </td>
                    <td className="p-5 text-sm">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 w-fit">
                          <i className="fas fa-id-card text-xs text-gray-400"></i>
                          <span className="font-mono text-xs">{w.aadhaar}</span>
                        </span>
                        {w.passport && (
                          <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 w-fit">
                            <i className="fas fa-passport text-xs text-gray-400"></i>
                            <span className="font-mono text-xs">
                              {w.passport}
                            </span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-5 text-sm text-gray-600">
                      <div className="font-medium">{w.city}</div>
                      <div className="text-xs text-gray-400">{w.state}</div>
                    </td>
                    <td className="p-5 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <i className="fas fa-user-shield text-pathik-primary/60"></i>
                        {w.reportingOfficerName}
                      </div>
                    </td>
                    <td className="p-5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border ${
                          w.status === "Active"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${w.status === "Active" ? "bg-green-500" : "bg-gray-400"}`}
                        ></span>
                        {w.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            router.push(`/dashboard/watchdogs/${w.id}`)
                          }
                          className="text-gray-400 hover:text-pathik-primary hover:bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/dashboard/watchdogs/${w.id}/edit`)
                          }
                          className="text-gray-400 hover:text-pathik-primary hover:bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                          title="Edit Watchdog"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(w.id)}
                          className="text-gray-400 hover:text-red-500 hover:bg-red-50 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                          title="Remove Watchdog"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
