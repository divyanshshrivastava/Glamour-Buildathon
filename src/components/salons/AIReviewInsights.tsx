"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Heart,
  AlertTriangle,
  Award,
  MessageCircle,
  Send,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getReviewInsights, askReviewQuestion } from "@/lib/api/ai";
import type { ReviewInsights, ReviewQAResult } from "@/types/ai";

export default function AIReviewInsights({ salonId }: { salonId: string }) {
  const [insights, setInsights] = useState<ReviewInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Q&A
  const [question, setQuestion] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const [qaResult, setQaResult] = useState<ReviewQAResult | null>(null);
  const [qaError, setQaError] = useState<string | null>(null);

  const loadInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReviewInsights(salonId);
      setInsights(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to load AI insights"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim() || question.trim().length < 5) return;
    setQaLoading(true);
    setQaError(null);
    try {
      const data = await askReviewQuestion(salonId, question.trim());
      setQaResult(data);
    } catch (err: unknown) {
      setQaError(
        err instanceof Error ? err.message : "Failed to answer question"
      );
    } finally {
      setQaLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-violet-50/50 via-white to-fuchsia-50/30 rounded-2xl border border-violet-200/60 overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => {
          setExpanded(!expanded);
          if (!expanded && !insights && !loading) loadInsights();
        }}
        className="w-full flex items-center justify-between px-5 sm:px-6 py-4 hover:bg-violet-50/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
              AI Review Intelligence
            </h3>
            <p className="text-xs text-gray-500">
              AI-powered analysis of customer reviews
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp size={18} className="text-gray-400" />
        ) : (
          <ChevronDown size={18} className="text-gray-400" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-6">
              {loading && (
                <div className="flex items-center justify-center py-12 gap-3 text-violet-600">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-sm font-medium">
                    Analyzing reviews with AI…
                  </span>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              {insights && !loading && (
                <div className="space-y-5">
                  {/* Summary */}
                  {insights.summary && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <p className="text-sm text-gray-700 leading-relaxed italic">
                        &ldquo;{insights.summary}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Sentiment Bars */}
                  {insights.sentiment &&
                    (insights.sentiment.positive > 0 ||
                      insights.sentiment.neutral > 0 ||
                      insights.sentiment.negative > 0) && (
                      <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                          Sentiment Analysis
                        </h4>
                        <div className="flex rounded-full overflow-hidden h-3 bg-gray-100">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${insights.sentiment.positive}%`,
                            }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="bg-emerald-500"
                            title={`Positive: ${insights.sentiment.positive}%`}
                          />
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${insights.sentiment.neutral}%`,
                            }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="bg-amber-400"
                            title={`Neutral: ${insights.sentiment.neutral}%`}
                          />
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${insights.sentiment.negative}%`,
                            }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="bg-red-400"
                            title={`Negative: ${insights.sentiment.negative}%`}
                          />
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Positive {insights.sentiment.positive}%
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            Neutral {insights.sentiment.neutral}%
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-red-400" />
                            Negative {insights.sentiment.negative}%
                          </span>
                        </div>
                      </div>
                    )}

                  {/* Three columns */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* What Customers Love */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Heart size={14} className="text-rose-500" />
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Customers Love
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {insights.whatCustomersLove.map((item) => (
                          <span
                            key={item}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full font-medium"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Common Complaints */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle size={14} className="text-amber-500" />
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Could Improve
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {insights.commonComplaints.map((item) => (
                          <span
                            key={item}
                            className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs rounded-full font-medium"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Strength Areas */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Award size={14} className="text-violet-500" />
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Strengths
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {insights.strengthAreas.map((item) => (
                          <span
                            key={item}
                            className="px-2.5 py-1 bg-violet-50 text-violet-700 text-xs rounded-full font-medium"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Q&A Section */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageCircle size={14} className="text-blue-500" />
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Ask about this salon
                      </h4>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                        placeholder="e.g. Is this salon good for bridal makeup?"
                        className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all"
                      />
                      <button
                        onClick={handleAsk}
                        disabled={
                          qaLoading || !question.trim() || question.trim().length < 5
                        }
                        className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
                      >
                        {qaLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Send size={14} />
                        )}
                      </button>
                    </div>

                    {/* Quick questions */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[
                        "Is this salon good for bridal makeup?",
                        "Are customers happy with hair coloring?",
                        "Is this salon expensive?",
                      ].map((q) => (
                        <button
                          key={q}
                          onClick={() => {
                            setQuestion(q);
                            setQaLoading(true);
                            setQaError(null);
                            askReviewQuestion(salonId, q)
                              .then(setQaResult)
                              .catch((e) => setQaError(e.message))
                              .finally(() => setQaLoading(false));
                          }}
                          className="text-xs px-2.5 py-1 bg-gray-50 hover:bg-violet-50 text-gray-500 hover:text-violet-700 rounded-full transition-colors border border-gray-200 hover:border-violet-200"
                        >
                          {q}
                        </button>
                      ))}
                    </div>

                    {/* QA Result */}
                    <AnimatePresence>
                      {qaResult && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 bg-violet-50 border border-violet-200 rounded-xl p-4"
                        >
                          <p className="text-sm text-gray-800 leading-relaxed">
                            {qaResult.answer}
                          </p>
                          {qaResult.relevantReviews.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-xs text-gray-500 font-medium">
                                Based on:
                              </p>
                              {qaResult.relevantReviews.map((r) => (
                                <div
                                  key={r.id}
                                  className="text-xs text-gray-600 bg-white rounded-lg px-3 py-2 border border-violet-100"
                                >
                                  <span className="font-medium">
                                    {r.authorName}
                                  </span>{" "}
                                  ({r.rating}★): &ldquo;
                                  {r.text.length > 120
                                    ? r.text.slice(0, 120) + "…"
                                    : r.text}
                                  &rdquo;
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {qaError && (
                      <p className="mt-2 text-xs text-red-600">{qaError}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
