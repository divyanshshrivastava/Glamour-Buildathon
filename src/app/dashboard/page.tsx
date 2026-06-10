"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getMySalon, getSalonBookings, SalonWithStats, SalonBooking } from "@/lib/api/dashboard";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Scissors,
  Star,
  TrendingUp,
  ArrowRight,
  Users,
} from "lucide-react";

export default function DashboardOverview() {
  const { token } = useAuth();
  const [salon, setSalon] = useState<SalonWithStats | null>(null);
  const [todayBookings, setTodayBookings] = useState<SalonBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        const salonData = await getMySalon(token);
        setSalon(salonData);

        // Fetch today's bookings
        const today = new Date().toISOString().split("T")[0];
        try {
          const bookings = await getSalonBookings(token, salonData.id, {
            date: today,
            limit: 50,
          });
          setTodayBookings(bookings);
        } catch {
          // Bookings may not exist yet
          setTodayBookings([]);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard. Make sure you have a salon associated with your account.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-200 rounded mt-2 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse"
            >
              <div className="h-10 w-10 bg-gray-200 rounded-lg mb-4" />
              <div className="h-6 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-8 w-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !salon) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200">
        <p className="font-medium">Dashboard Error</p>
        <p className="mt-1 text-sm">
          {error || "Something went wrong loading the dashboard."}
        </p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Bookings",
      value: salon.stats.totalBookings,
      icon: Calendar,
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      title: "Pending",
      value: salon.stats.pendingBookings,
      icon: Clock,
      gradient: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
      text: "text-amber-600",
      link: "/dashboard/bookings?status=pending",
    },
    {
      title: "Confirmed",
      value: salon.stats.confirmedBookings,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-green-600",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    {
      title: "Services",
      value: salon.services.length,
      icon: Scissors,
      gradient: "from-violet-500 to-purple-600",
      bg: "bg-violet-50",
      text: "text-violet-600",
      link: "/dashboard/services",
    },
    {
      title: "Avg. Rating",
      value: salon.rating.toFixed(1),
      icon: Star,
      gradient: "from-yellow-500 to-amber-500",
      bg: "bg-yellow-50",
      text: "text-yellow-600",
    },
    {
      title: "Total Reviews",
      value: salon.stats.totalReviews,
      icon: TrendingUp,
      gradient: "from-pink-500 to-rose-500",
      bg: "bg-pink-50",
      text: "text-pink-600",
      link: "/dashboard/reviews",
    },
  ];

  const upcomingBookings = todayBookings
    .filter((b) => b.status === "confirmed" || b.status === "pending")
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
          Welcome back{salon.name ? `, ${salon.name}` : ""}!
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here&apos;s what&apos;s happening with your salon today.
        </p>
      </div>

      {/* Verification badge */}
      {!salon.verified && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Clock className="text-amber-500 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Verification Pending
            </p>
            <p className="text-sm text-amber-700 mt-0.5">
              Your salon is awaiting admin verification. Once verified, it will
              appear in search results and get the verified badge.
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          const inner = (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div
                className={`absolute top-0 right-0 w-28 h-28 -mr-10 -mt-10 rounded-full bg-gradient-to-br ${card.gradient} opacity-[0.07] transition-transform group-hover:scale-150`}
              />

              <div className="flex items-center justify-between">
                <div
                  className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center`}
                >
                  <Icon size={22} className={card.text} />
                </div>
                {card.link && (
                  <ArrowRight
                    size={18}
                    className="text-gray-300 group-hover:text-violet-500 transition-colors"
                  />
                )}
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">
                  {card.title}
                </p>
                <h3 className="text-3xl font-bold text-gray-900 mt-0.5">
                  {typeof card.value === "number"
                    ? card.value.toLocaleString()
                    : card.value}
                </h3>
              </div>
            </div>
          );

          return card.link ? (
            <a key={card.title} href={card.link}>
              {inner}
            </a>
          ) : (
            <div key={card.title}>{inner}</div>
          );
        })}
      </div>

      {/* Today's Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar size={20} className="text-violet-500" />
            Today&apos;s Appointments
          </h2>
          <a
            href="/dashboard/bookings"
            className="text-sm font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </a>
        </div>

        {upcomingBookings.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {upcomingBookings.slice(0, 5).map((booking) => (
              <li
                key={booking.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center">
                    <Users size={18} className="text-violet-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {booking.customerName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.service?.name || "Service"} •{" "}
                      {booking.service?.duration || ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 tabular-nums">
                    {booking.time}
                  </p>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-12 text-center">
            <Calendar
              className="mx-auto h-10 w-10 text-gray-300 mb-3"
              strokeWidth={1.5}
            />
            <p className="text-gray-500 font-medium">
              No appointments for today
            </p>
            <p className="text-sm text-gray-400 mt-1">
              New bookings will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
