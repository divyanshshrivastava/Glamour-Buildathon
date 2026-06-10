"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getMySalon, getSalonReviews, SalonReview } from "@/lib/api/dashboard";
import { Star, MessageSquare, ThumbsUp, AlertCircle } from "lucide-react";

export default function ReviewsPage() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<SalonReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState("recent");
  const [avgRating, setAvgRating] = useState(0);
  const [distribution, setDistribution] = useState<Record<number, number>>({});

  useEffect(() => {
    const init = async () => {
      if (!token) return;
      try {
        const salon = await getMySalon(token);
        setAvgRating(salon.rating);

        const data = await getSalonReviews(token, salon.id, sort);
        setReviews(data);

        // Build distribution
        const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        data.forEach((r) => {
          if (dist[r.rating] !== undefined) dist[r.rating]++;
        });
        setDistribution(dist);
      } catch (err) {
        console.error("Failed to load reviews:", err);
        setError("Failed to load reviews.");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [token, sort]);

  const totalReviews = reviews.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Reviews
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          See what customers are saying about your salon.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-start gap-3">
          <AlertCircle className="mt-0.5 flex-shrink-0" size={18} />
          <p>{error}</p>
        </div>
      )}

      {/* Rating Overview */}
      {!isLoading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
            {/* Avg rating */}
            <div className="text-center sm:pr-8 sm:border-r border-gray-200">
              <div className="text-5xl font-bold text-gray-900">
                {avgRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-0.5 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={18}
                    className={
                      s <= Math.round(avgRating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-200"
                    }
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {totalReviews} review{totalReviews !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Distribution bars */}
            <div className="flex-1 space-y-2 w-full">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = distribution[star] || 0;
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 w-6 text-right">
                      {star}
                    </span>
                    <Star size={14} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-8 text-right tabular-nums">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sort */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Sort by:</span>
        <div className="flex gap-2">
          {[
            { key: "recent", label: "Most Recent" },
            { key: "rating", label: "Highest Rating" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSort(opt.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                sort === opt.key
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div>
                  <div className="h-4 w-28 bg-gray-200 rounded" />
                  <div className="h-3 w-20 bg-gray-200 rounded mt-1" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 font-semibold text-sm border border-violet-100">
                    {review.authorInitials}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {review.authorName}
                      {review.verified && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700 border border-green-200">
                          Verified
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={14}
                      className={
                        s <= review.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-200"
                      }
                    />
                  ))}
                </div>
              </div>

              {review.title && (
                <h4 className="font-medium text-gray-900 mb-1">
                  {review.title}
                </h4>
              )}
              <p className="text-sm text-gray-600 leading-relaxed">
                {review.text}
              </p>

              {review.helpful > 0 && (
                <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
                  <ThumbsUp size={12} />
                  <span>{review.helpful} found this helpful</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-xl border border-gray-100 text-center">
          <MessageSquare
            className="mx-auto h-12 w-12 text-gray-300 mb-4"
            strokeWidth={1.5}
          />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No reviews yet
          </h3>
          <p className="text-gray-500">
            Reviews from your customers will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
