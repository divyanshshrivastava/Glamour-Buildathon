"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Search,
  MapPin,
  IndianRupee,
  Calendar,
  Star,
  Loader2,
  X,
  ArrowRight,
  Zap,
} from "lucide-react";
import { conciergeSearch } from "@/lib/api/ai";
import type { ConciergeResult } from "@/types/ai";

const exampleQueries = [
  "Best salon for bridal makeup near me",
  "Affordable haircut for men tomorrow",
  "Keratin treatment under ₹3000",
  "Party makeup and hairstyling this weekend",
];

export default function AIConciergeBar() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConciergeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim() || q.trim().length < 3) return;

    setLoading(true);
    setError(null);
    try {
      const data = await conciergeSearch(q.trim());
      setResult(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Search failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResult(null);
    setQuery("");
    setError(null);
  };

  return (
    <div className="mb-8">
      {/* Search bar */}
      <div className="relative">
        <div
          className={`bg-white rounded-2xl border-2 transition-all duration-300 shadow-sm ${
            isActive
              ? "border-violet-400 shadow-lg shadow-violet-600/10"
              : "border-gray-200 hover:border-violet-200"
          }`}
        >
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="flex-shrink-0">
              {loading ? (
                <Loader2
                  size={20}
                  className="text-violet-600 animate-spin"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <Sparkles size={16} className="text-white" />
                </div>
              )}
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsActive(true)}
              onBlur={() => setTimeout(() => setIsActive(false), 200)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Try: &quot;Bridal makeup under ₹5000 this weekend&quot;"
              className="flex-1 outline-none text-gray-800 placeholder-gray-400 text-sm sm:text-base bg-transparent"
            />
            {query && (
              <button
                onClick={clearResults}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={16} className="text-gray-400" />
              </button>
            )}
            <button
              onClick={() => handleSearch()}
              disabled={loading || query.trim().length < 3}
              className="px-5 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
            >
              <Search size={14} />
              <span className="hidden sm:inline">AI Search</span>
            </button>
          </div>
        </div>

        {/* Example queries */}
        <AnimatePresence>
          {!result && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-3 flex flex-wrap gap-2"
            >
              {exampleQueries.map((eq) => (
                <button
                  key={eq}
                  onClick={() => {
                    setQuery(eq);
                    handleSearch(eq);
                  }}
                  className="px-3 py-1.5 bg-white border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-xs text-gray-600 rounded-full transition-all"
                >
                  {eq}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
        >
          {error}
        </motion.p>
      )}

      {/* AI Understanding + Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6"
          >
            {/* AI Understanding Panel */}
            <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-200 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={16} className="text-violet-600" />
                <span className="text-sm font-semibold text-violet-800">
                  AI understood your query
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.understood.serviceType && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-violet-200 rounded-full text-xs font-medium text-gray-700">
                    <Search size={12} className="text-violet-500" />
                    {result.understood.serviceType}
                  </span>
                )}
                {result.understood.budget?.max && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-violet-200 rounded-full text-xs font-medium text-gray-700">
                    <IndianRupee size={12} className="text-emerald-500" />
                    Under ₹{result.understood.budget.max.toLocaleString()}
                  </span>
                )}
                {result.understood.date && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-violet-200 rounded-full text-xs font-medium text-gray-700">
                    <Calendar size={12} className="text-blue-500" />
                    {result.understood.date}
                  </span>
                )}
                {result.understood.location && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-violet-200 rounded-full text-xs font-medium text-gray-700">
                    <MapPin size={12} className="text-rose-500" />
                    {result.understood.location}
                  </span>
                )}
                {result.understood.ratingPreference && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-violet-200 rounded-full text-xs font-medium text-gray-700">
                    <Star size={12} className="text-amber-500" />
                    {result.understood.ratingPreference}+
                  </span>
                )}
                {result.understood.time && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-violet-200 rounded-full text-xs font-medium text-gray-700">
                    <Calendar size={12} className="text-indigo-500" />
                    {result.understood.time}
                  </span>
                )}
              </div>
            </div>

            {/* AI Recommendation */}
            {result.aiRecommendation && (
              <p className="text-sm text-gray-600 italic mb-4 flex items-start gap-2">
                <Sparkles size={14} className="text-violet-500 mt-0.5 flex-shrink-0" />
                {result.aiRecommendation}
              </p>
            )}

            {/* Results */}
            {result.results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.results.map((salon, i) => (
                  <motion.a
                    key={salon.id}
                    href={`/salons/${salon.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-violet-200 hover:shadow-lg transition-all"
                  >
                    <div className="h-36 bg-gradient-to-br from-violet-100 to-purple-100 relative overflow-hidden">
                      {salon.coverImage && (
                        <img
                          src={salon.coverImage}
                          alt={salon.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {salon.aiScore > 0 && (
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg">
                          <Sparkles size={10} />
                          {salon.aiScore}% match
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                        <Star
                          size={12}
                          className="text-amber-500 fill-amber-500"
                        />
                        <span className="text-xs font-bold text-gray-900">
                          {salon.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 group-hover:text-violet-700 transition-colors">
                        {salon.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <MapPin size={12} />
                        {salon.city}
                        <span className="text-gray-300">·</span>
                        From ₹{salon.startingPrice}
                      </div>
                      {salon.aiReason && (
                        <p className="text-xs text-violet-600 mt-2 italic">
                          {salon.aiReason}
                        </p>
                      )}
                      {salon.matchedServices.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {salon.matchedServices.slice(0, 2).map((svc) => (
                            <span
                              key={svc.id}
                              className="px-2 py-0.5 bg-violet-50 text-violet-700 text-xs rounded-md"
                            >
                              {svc.name} · ₹{svc.price}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-1 text-sm font-medium text-violet-600 group-hover:gap-2 transition-all">
                        View Salon <ArrowRight size={14} />
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <Search size={40} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">
                  No salons found matching your criteria
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Try broadening your search
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
