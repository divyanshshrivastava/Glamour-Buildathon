"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getDashboardStats } from "@/lib/api/admin";
import { DashboardStats } from "@/types";
import { 
  Users, 
  Store, 
  Calendar, 
  Star, 
  TrendingUp, 
  Clock,
  ArrowRight
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      
      try {
        const data = await getDashboardStats(token);
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setError("Failed to load dashboard statistics.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-border-light p-6 animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-6 w-24 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 w-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
        {error || "Something went wrong loading the dashboard."}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Salons",
      value: stats.totalSalons,
      icon: Store,
      color: "bg-blue-500",
      link: "/admin/salons"
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: Calendar,
      color: "bg-green-500",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-purple-500",
    },
    {
      title: "Total Reviews",
      value: stats.totalReviews,
      icon: Star,
      color: "bg-amber-500",
    },
    {
      title: "Pending Applications",
      value: stats.pendingApplications,
      icon: Clock,
      color: "bg-orange-500",
      link: "/admin/applications"
    },
    {
      title: "Pending Reviews",
      value: stats.pendingReviews,
      icon: TrendingUp,
      color: "bg-indigo-500",
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back to the Glamour admin panel.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-xl shadow-sm border border-border-light p-6 relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 transition-transform group-hover:scale-150 ${card.color}`}></div>
              
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-sm ${card.color}`}>
                  <Icon size={24} />
                </div>
                {card.link && (
                  <a href={card.link} className="text-gray-400 hover:text-primary transition-colors">
                    <ArrowRight size={20} />
                  </a>
                )}
              </div>
              
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{card.value.toLocaleString()}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue and Top Salons Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Salons */}
        <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden">
          <div className="px-6 py-4 border-b border-border-light flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-900">Top Rated Salons</h2>
            <a href="/admin/salons" className="text-sm font-medium text-primary hover:text-primary-dark">View all</a>
          </div>
          <ul className="divide-y divide-border-light">
            {stats.topSalons.length > 0 ? (
              stats.topSalons.map((salon, index) => (
                <li key={salon.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-500">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{salon.name}</p>
                      <p className="text-sm text-gray-500">{salon.bookings} bookings</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                    <Star className="text-amber-500" size={14} fill="currentColor" />
                    <span className="text-sm font-semibold text-amber-700">{salon.rating.toFixed(1)}</span>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-6 py-8 text-center text-gray-500 text-sm">
                No salons found yet.
              </li>
            )}
          </ul>
        </div>

        {/* Revenue (Mock/Future) */}
        <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden">
          <div className="px-6 py-4 border-b border-border-light bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-900">Platform Revenue</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">This Month</p>
                <div className="flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-gray-900">
                    {formatPrice(stats.revenue?.thisMonth || 0)}
                  </h3>
                  <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-md mb-1">+12.5%</span>
                </div>
              </div>
              
              <div className="pt-6 border-t border-border-light">
                <p className="text-sm font-medium text-gray-500 mb-1">This Year</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatPrice(stats.revenue?.thisYear || 0)}
                </h3>
              </div>
              
              <div className="mt-4 bg-blue-50 text-blue-800 text-sm p-4 rounded-lg border border-blue-100">
                <p className="font-medium">Note</p>
                <p className="mt-1 opacity-90">Revenue tracking is currently simulated. Full Stripe integration required for live data.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
