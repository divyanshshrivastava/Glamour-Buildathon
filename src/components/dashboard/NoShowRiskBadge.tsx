"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  Loader2,
  ChevronDown,
  X,
  Sparkles,
} from "lucide-react";
import { getBookingRisk } from "@/lib/api/ai";
import type { NoShowRisk } from "@/types/ai";

const riskStyles = {
  low: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: ShieldCheck,
    dot: "bg-emerald-500",
  },
  medium: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Shield,
    dot: "bg-amber-500",
  },
  high: {
    badge: "bg-red-50 text-red-700 border-red-200",
    icon: ShieldAlert,
    dot: "bg-red-500",
  },
};

interface NoShowRiskBadgeProps {
  bookingId: string;
  /** If provided from bulk overview, skips the API call */
  precomputed?: {
    riskLevel: "low" | "medium" | "high";
    probability: number;
  };
}

export default function NoShowRiskBadge({
  bookingId,
  precomputed,
}: NoShowRiskBadgeProps) {
  const [risk, setRisk] = useState<NoShowRisk | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const riskLevel = risk?.riskLevel || precomputed?.riskLevel;
  const probability = risk?.probability || precomputed?.probability;
  const style = riskLevel ? riskStyles[riskLevel] : null;

  const handleClick = async () => {
    if (risk) {
      setShowDetail(!showDetail);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getBookingRisk(bookingId);
      setRisk(data);
      setShowDetail(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to analyze risk");
    } finally {
      setLoading(false);
    }
  };

  if (!precomputed && !risk && !loading) {
    return (
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-md transition-colors"
        title="Check AI no-show risk"
      >
        <Sparkles size={10} />
        Risk
      </button>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border transition-all ${
          style ? style.badge : "bg-gray-50 text-gray-500 border-gray-200"
        }`}
        title={
          riskLevel
            ? `${riskLevel} risk (${probability}%)`
            : "Analyzing risk…"
        }
      >
        {loading ? (
          <Loader2 size={10} className="animate-spin" />
        ) : style ? (
          <>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {riskLevel}
            {probability !== undefined && (
              <span className="opacity-70">{probability}%</span>
            )}
          </>
        ) : (
          "…"
        )}
      </button>

      {error && (
        <span className="ml-1 text-xs text-red-500" title={error}>⚠</span>
      )}

      {/* Detail popover */}
      <AnimatePresence>
        {showDetail && risk && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl border border-gray-200 shadow-xl z-50 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                <Sparkles size={14} className="text-violet-500" />
                AI Risk Analysis
              </h4>
              <button
                onClick={() => setShowDetail(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={12} className="text-gray-400" />
              </button>
            </div>

            {/* Risk bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">Risk Probability</span>
                <span className="font-bold text-gray-900">
                  {risk.probability}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${risk.probability}%` }}
                  transition={{ duration: 0.6 }}
                  className={`h-2 rounded-full ${
                    risk.riskLevel === "high"
                      ? "bg-red-500"
                      : risk.riskLevel === "medium"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                />
              </div>
            </div>

            {/* Explanation */}
            <p className="text-xs text-gray-600 leading-relaxed mb-3">
              {risk.explanation}
            </p>

            {/* Actions */}
            {risk.recommendedActions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">
                  Recommended Actions:
                </p>
                <ul className="space-y-1">
                  {risk.recommendedActions.map((action, i) => (
                    <li
                      key={i}
                      className="text-xs text-gray-600 flex items-start gap-1.5"
                    >
                      <span className="text-violet-500 mt-0.5 flex-shrink-0">
                        →
                      </span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
