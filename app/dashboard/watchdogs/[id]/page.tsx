"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Watchdog } from "@/app/types";
import { useAuth } from "@/app/context/AuthContext";

export default function ViewWatchdog({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [watchdog, setWatchdog] = useState<Watchdog | null>(null);
  const [loading, setLoading] = useState(true);

  // Unwrap params using React.use()
  const resolvedParams = use(params);

  useEffect(() => {
    if (user && user.role !== "SUPER_ADMIN" && user.role !== "POLICE_STATION") {
      router.push("/dashboard");
      return;
    }

    const loadData = () => {
      const data = localStorage.getItem("pathikWatchdogs");
      if (data) {
        const watchdogs: Watchdog[] = JSON.parse(data);
        const found = watchdogs.find((w) => String(w.id) === resolvedParams.id);
        setWatchdog(found || null);
      }
      setLoading(false);
    };

    loadData();
  }, [user, router, resolvedParams.id]);

  if (loading)
    return (
      <div className="p-8 text-center animate-pulse">Loading details...</div>
    );
  if (!watchdog)
    return (
      <div className="p-8 text-center text-red-500">Watchdog not found</div>
    );

  return (
    <div className="max-w-4xl mx-auto animate-[fadeIn_0.5s_ease-out]">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-pathik-primary hover:scale-110 transition-all"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-pathik-text-dark">
            {watchdog.personName}
          </h1>
          <div className="flex items-center gap-2 text-sm mt-1">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide border ${
                watchdog.status === "Active"
                  ? "bg-green-100 text-green-700 border-green-200"
                  : "bg-gray-100 text-gray-600 border-gray-200"
              }`}
            >
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                  watchdog.status === "Active" ? "bg-green-500" : "bg-gray-400"
                }`}
              ></span>
              {watchdog.status.toUpperCase()}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">
              Created at {new Date(watchdog.createdAt).toLocaleDateString()}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500 font-medium">
              {watchdog.watchdogTitle}
            </span>
          </div>
        </div>
        <button
          onClick={() =>
            router.push(`/dashboard/watchdogs/${watchdog.id}/edit`)
          }
          className="ml-auto bg-pathik-primary text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-all"
        >
          <i className="fas fa-edit"></i> Edit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="bg-white rounded-xl shadow-sm border border-pathik-border overflow-hidden">
          <div className="px-6 py-4 border-b border-pathik-border bg-gray-50/50">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <i className="fas fa-user text-pathik-primary/60"></i> Personal
              Information
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Contact Numbers
                </label>
                <p className="font-medium text-gray-800">{watchdog.contact1}</p>
                {watchdog.contact2 && (
                  <p className="font-medium text-gray-800 text-sm">
                    {watchdog.contact2}
                  </p>
                )}
                {watchdog.contact3 && (
                  <p className="font-medium text-gray-800 text-sm">
                    {watchdog.contact3}
                  </p>
                )}
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Emails
                </label>
                <p className="font-medium text-gray-800">
                  {watchdog.email1 || "-"}
                </p>
                {watchdog.email2 && (
                  <p className="font-medium text-gray-800 text-sm">
                    {watchdog.email2}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Aadhaar
                </label>
                <p className="font-medium text-gray-800 font-mono tracking-wide">
                  {watchdog.aadhaar || "-"}
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  PAN
                </label>
                <p className="font-medium text-gray-800 font-mono tracking-wide">
                  {watchdog.pan || "-"}
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Driving Lic.
                </label>
                <p className="font-medium text-gray-800">
                  {watchdog.drivingLicence || "-"}
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Passport
                </label>
                <p className="font-medium text-gray-800">
                  {watchdog.passport || "-"}
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Voting Card
                </label>
                <p className="font-medium text-gray-800">
                  {watchdog.votingCard || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Monitoring Details */}
        <div className="bg-white rounded-xl shadow-sm border border-pathik-border overflow-hidden">
          <div className="px-6 py-4 border-b border-pathik-border bg-gray-50/50">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <i className="fas fa-shield-alt text-pathik-primary/60"></i>{" "}
              Monitoring Info
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">
                Reporting Officer
              </label>
              <p className="font-medium text-gray-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                  <i className="fas fa-user-shield"></i>
                </span>
                {watchdog.reportingOfficerName}
              </p>
              <div className="ml-8 mt-1 text-sm text-gray-500">
                {watchdog.reportingOfficerNo && (
                  <p>
                    <i className="fas fa-phone fa-xs"></i>{" "}
                    {watchdog.reportingOfficerNo}
                  </p>
                )}
                {watchdog.reportingOfficerEmail && (
                  <p>
                    <i className="fas fa-envelope fa-xs"></i>{" "}
                    {watchdog.reportingOfficerEmail}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Start Date
                </label>
                <p className="font-medium text-gray-800">
                  {watchdog.startDate}
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  End Date
                </label>
                <p className="font-medium text-gray-800">
                  {watchdog.endDate || "Ongoing"}
                </p>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">
                Location
              </label>
              <p className="font-medium text-gray-800">
                {watchdog.city}, {watchdog.district}
              </p>
              <p className="text-sm text-gray-500">
                {watchdog.state}, {watchdog.country}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
