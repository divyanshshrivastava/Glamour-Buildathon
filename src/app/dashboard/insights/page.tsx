"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  Target,
  Zap,
  Calendar,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Package,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getMySalon } from "@/lib/api/dashboard";
import { getBusinessInsights } from "@/lib/api/ai";
import type { BusinessInsightsResult } from "@/types/ai";

const impactColors = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-blue-50 text-blue-700 border-blue-200",
};

const categoryIcons: Record<string, React.ReactNode> = {
  revenue: <DollarSign size={16} />,
  operations: <BarChart3 size={16} />,
  marketing: <Target size={16} />,
  pricing: <TrendingUp size={16} />,
};

export default function InsightsPage() {
  const { token } = useAuth();
  const [salonId, setSalonId] = useState<string | null>(null);
  const [insights, setInsights] = useState<BusinessInsightsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const salon = await getMySalon(token);
        setSalonId(salon.id);
        const data = await getBusinessInsights(salon.id);
        setInsights(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load insights");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const handleRefresh = async () => {
    if (!salonId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getBusinessInsights(salonId);
      setInsights(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to refresh");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-violet-600">
        <Loader2 size={24} className="animate-spin" />
        <span className="font-medium">Analyzing your business data…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={40} className="mx-auto text-red-400 mb-4" />
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-5 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Business Insights</h1>
            <p className="text-sm text-gray-500">AI-powered analysis of your salon performance</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Bookings", value: insights.metrics.totalBookings, icon: Calendar, color: "text-violet-600 bg-violet-100" },
          { label: "Revenue", value: `₹${insights.metrics.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-600 bg-emerald-100" },
          { label: "Cancellation Rate", value: `${insights.metrics.cancellationRate}%`, icon: AlertCircle, color: "text-amber-600 bg-amber-100" },
          { label: "Repeat Customers", value: `${insights.metrics.repeatCustomerRate}%`, icon: Users, color: "text-blue-600 bg-blue-100" },
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-gray-200 p-4"
          >
            <div className={`w-9 h-9 rounded-xl ${metric.color} flex items-center justify-center mb-3`}>
              <metric.icon size={18} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            <p className="text-xs text-gray-500 mt-1">{metric.label}</p>
          </motion.div>
        ))}
      </div>

      {/* AI Insights */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-violet-500" />
          Key Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                    {categoryIcons[insight.category] || <Zap size={16} />}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{insight.title}</h3>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${impactColors[insight.impact]}`}>
                  {insight.impact}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{insight.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pricing Recommendations */}
      {insights.pricingRecommendations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-emerald-500" />
            Pricing Recommendations
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Current</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Suggested</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Reasoning</th>
                </tr>
              </thead>
              <tbody>
                {insights.pricingRecommendations.map((rec, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">{rec.serviceName}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">₹{rec.currentPrice}</td>
                    <td className="px-5 py-3 text-sm font-semibold">
                      <span className={rec.action === "increase" ? "text-emerald-600" : rec.action === "decrease" ? "text-red-600" : "text-violet-600"}>
                        ₹{rec.suggestedPrice}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                        rec.action === "increase" ? "bg-emerald-50 text-emerald-700" :
                        rec.action === "decrease" ? "bg-red-50 text-red-700" :
                        rec.action === "bundle" ? "bg-violet-50 text-violet-700" :
                        "bg-gray-50 text-gray-700"
                      }`}>
                        {rec.action === "increase" && <ArrowUpRight size={10} />}
                        {rec.action === "decrease" && <ArrowDownRight size={10} />}
                        {rec.action === "bundle" && <Package size={10} />}
                        {rec.action === "keep" && <CheckCircle2 size={10} />}
                        {rec.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500 hidden sm:table-cell max-w-xs">{rec.reasoning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Revenue Opportunities */}
      {insights.revenueOpportunities.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap size={18} className="text-amber-500" />
            Revenue Opportunities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.revenueOpportunities.map((opp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5"
              >
                <h3 className="font-semibold text-gray-900 text-sm mb-2">{opp.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{opp.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-700">{opp.estimatedRevenue}</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    opp.effort === "low" ? "bg-emerald-100 text-emerald-700" :
                    opp.effort === "medium" ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {opp.effort} effort
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Demand Forecast */}
      {insights.demandForecast && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-blue-500" />
            Demand Forecast
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h4 className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-3">High Demand</h4>
              <div className="space-y-2">
                {insights.demandForecast.highDemandPeriods.map((period) => (
                  <span key={period} className="block text-sm text-gray-700 flex items-center gap-2">
                    <ArrowUpRight size={12} className="text-emerald-500" />
                    {period}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h4 className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-3">Low Demand</h4>
              <div className="space-y-2">
                {insights.demandForecast.lowDemandPeriods.map((period) => (
                  <span key={period} className="block text-sm text-gray-700 flex items-center gap-2">
                    <ArrowDownRight size={12} className="text-amber-500" />
                    {period}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h4 className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-3">Opportunities</h4>
              <div className="space-y-2">
                {insights.demandForecast.seasonalOpportunities.map((opp) => (
                  <span key={opp} className="block text-sm text-gray-700 flex items-center gap-2">
                    <Sparkles size={12} className="text-violet-500" />
                    {opp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top 5 Action Items */}
      {insights.actionItems.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target size={18} className="text-rose-500" />
            Top Actions This Month
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <ol className="space-y-3">
              {insights.actionItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700 pt-1">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
