"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  getMySalon,
  getSalonBookings,
  confirmBooking,
  completeBooking,
  cancelSalonBooking,
  SalonBooking,
} from "@/lib/api/dashboard";
import {
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import Button from "@/components/shared/Button";
import NoShowRiskBadge from "@/components/dashboard/NoShowRiskBadge";
import { getSalonRiskOverview } from "@/lib/api/ai";
import type { NoShowOverview, NoShowRisk } from "@/types/ai";

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

export default function BookingsPage() {
  const { token } = useAuth();
  const [salonId, setSalonId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<SalonBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [riskOverview, setRiskOverview] = useState<NoShowOverview | null>(null);
  const [riskMap, setRiskMap] = useState<Record<string, NoShowRisk>>({});

  const fetchBookings = async (sId: string, status?: string) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { limit: 100 };
      if (status && status !== "all") params.status = status;
      const data = await getSalonBookings(token, sId, params);
      setBookings(data);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError("Failed to load bookings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!token) return;
      try {
        const salon = await getMySalon(token);
        setSalonId(salon.id);
        await fetchBookings(salon.id, statusFilter);
      } catch (err) {
        console.error("Failed to load salon:", err);
        setError("Failed to load salon data.");
        setIsLoading(false);
      }
    };
    init();
  }, [token]);

  // Load risk overview once we have salonId
  useEffect(() => {
    const loadRisk = async () => {
      if (!salonId || !token) return;
      try {
        const overview = await getSalonRiskOverview(salonId);
        setRiskOverview(overview);
        // Build a map of bookingId -> risk for quick lookup
        const map: Record<string, NoShowRisk> = {};
        for (const r of overview.bookingRisks) {
          map[r.bookingId] = r;
        }
        setRiskMap(map);
      } catch (err) {
        // Non-fatal — risk overview is optional
        console.error("Risk overview failed:", err);
      }
    };
    loadRisk();
  }, [salonId, token]);

  useEffect(() => {
    if (salonId) fetchBookings(salonId, statusFilter);
  }, [statusFilter]);

  const handleConfirm = async (id: string) => {
    if (!token) return;
    setActionLoading(id);
    try {
      await confirmBooking(token, id);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "confirmed" as const } : b))
      );
    } catch (err: any) {
      alert(err.message || "Failed to confirm booking.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (id: string) => {
    if (!token) return;
    setActionLoading(id);
    try {
      await completeBooking(token, id);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "completed" as const } : b))
      );
    } catch (err: any) {
      alert(err.message || "Failed to complete booking.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!token) return;
    setActionLoading(id);
    try {
      await cancelSalonBooking(token, id, cancelReason);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b))
      );
      setCancellingId(null);
      setCancelReason("");
    } catch (err: any) {
      alert(err.message || "Failed to cancel booking.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = bookings.filter((b) =>
    b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.service?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Bookings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage appointments for your salon.
        </p>
      </div>

      {/* Risk Overview Card */}
      {riskOverview && (riskOverview.highRisk > 0 || riskOverview.mediumRisk > 0) && (
        <div className="bg-gradient-to-r from-amber-50 to-red-50 rounded-xl border border-amber-200 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <ShieldAlert size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">No-Show Risk Alert</p>
              <p className="text-xs text-gray-500">
                {riskOverview.highRisk} high risk, {riskOverview.mediumRisk} medium risk bookings
              </p>
            </div>
          </div>
          <div className="sm:ml-auto flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-gray-600">High: {riskOverview.highRisk}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-gray-600">Medium: {riskOverview.mediumRisk}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-gray-600">Low: {riskOverview.lowRisk}</span>
            </span>
            {riskOverview.revenueAtRisk > 0 && (
              <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                ₹{riskOverview.revenueAtRisk.toLocaleString()} at risk
              </span>
            )}
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                statusFilter === tab.key
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:max-w-xs sm:ml-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-violet-500 focus:border-violet-500"
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-start gap-3">
          <AlertCircle className="mt-0.5 flex-shrink-0" size={18} />
          <p>{error}</p>
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 w-28 bg-gray-200 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 bg-gray-200 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-32 bg-gray-200 rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-20 bg-gray-200 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-8 w-24 bg-gray-200 rounded float-right" />
                    </td>
                  </tr>
                ))
              ) : filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {booking.customerName}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail size={12} /> {booking.customerEmail}
                          </span>
                          {booking.customerPhone && (
                            <span className="flex items-center gap-1">
                              <Phone size={12} /> {booking.customerPhone}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {booking.service?.name || "—"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {booking.service
                          ? `₹${booking.service.price} • ${booking.service.duration}`
                          : ""}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-gray-900">
                          {new Date(booking.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm mt-0.5">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-gray-700 tabular-nums">
                          {booking.time}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${
                          statusStyles[booking.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {(booking.status === "pending" || booking.status === "confirmed") ? (
                        <NoShowRiskBadge
                          bookingId={booking.id}
                          precomputed={
                            riskMap[booking.id]
                              ? {
                                  riskLevel: riskMap[booking.id].riskLevel,
                                  probability: riskMap[booking.id].probability,
                                }
                              : undefined
                          }
                        />
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {booking.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleConfirm(booking.id)}
                              disabled={actionLoading === booking.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === booking.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <CheckCircle2 size={12} />
                              )}
                              Confirm
                            </button>
                            <button
                              onClick={() => setCancellingId(booking.id)}
                              disabled={actionLoading === booking.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                            >
                              <XCircle size={12} />
                              Cancel
                            </button>
                          </>
                        )}
                        {booking.status === "confirmed" && (
                          <>
                            <button
                              onClick={() => handleComplete(booking.id)}
                              disabled={actionLoading === booking.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === booking.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <CheckCircle2 size={12} />
                              )}
                              Complete
                            </button>
                            <button
                              onClick={() => setCancellingId(booking.id)}
                              disabled={actionLoading === booking.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                            >
                              <XCircle size={12} />
                              Cancel
                            </button>
                          </>
                        )}
                        {(booking.status === "completed" ||
                          booking.status === "cancelled") && (
                          <span className="text-xs text-gray-400">
                            No actions
                          </span>
                        )}
                      </div>

                      {/* Cancel reason dialog */}
                      {cancellingId === booking.id && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200 text-left">
                          <label className="block text-xs font-medium text-red-800 mb-1">
                            Reason for cancellation
                          </label>
                          <textarea
                            className="w-full text-sm rounded-lg border-red-200 focus:border-red-500 focus:ring-red-500 p-2"
                            rows={2}
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Briefly explain why..."
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleCancel(booking.id)}
                              disabled={
                                actionLoading === booking.id ||
                                !cancelReason.trim()
                              }
                              className="flex-1 bg-red-600 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                              Confirm Cancel
                            </button>
                            <button
                              onClick={() => {
                                setCancellingId(null);
                                setCancelReason("");
                              }}
                              className="flex-1 bg-gray-100 text-gray-700 text-xs font-medium py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Back
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <Calendar
                      className="mx-auto h-10 w-10 text-gray-300 mb-3"
                      strokeWidth={1.5}
                    />
                    <p className="font-medium">No bookings found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {searchQuery
                        ? "Try adjusting your search."
                        : "Bookings will appear here once customers start booking."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && filteredBookings.length > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-100 sm:px-6 flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">{filteredBookings.length}</span>{" "}
              bookings
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
