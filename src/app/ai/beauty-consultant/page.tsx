"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Upload,
  Camera,
  X,
  Star,
  ArrowRight,
  Palette,
  Scissors,
  Zap,
  Heart,
  Loader2,
} from "lucide-react";
import { analyzeBeauty } from "@/lib/api/ai";
import type { BeautyConsultResult, BeautyRecommendation } from "@/types/ai";

const categoryIcons: Record<string, React.ReactNode> = {
  hairstyle: <Scissors size={16} />,
  color: <Palette size={16} />,
  treatment: <Zap size={16} />,
  grooming: <Star size={16} />,
  occasion: <Heart size={16} />,
};

const categoryColors: Record<string, string> = {
  hairstyle: "from-violet-500 to-purple-600",
  color: "from-amber-500 to-orange-600",
  treatment: "from-emerald-500 to-teal-600",
  grooming: "from-blue-500 to-indigo-600",
  occasion: "from-rose-500 to-pink-600",
};

export default function BeautyConsultantPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BeautyConsultResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPEG, PNG, or WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }
    setError(null);
    setImageFile(file);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeBeauty(imageFile);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-violet-50/30 to-rose-50/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Sparkles size={14} />
              AI-Powered Beauty Analysis
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              AI Beauty Consultant
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Upload a selfie and get personalized hairstyle, color, and
              treatment recommendations powered by AI
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-xl mx-auto"
            >
              {/* Upload Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden ${
                  dragOver
                    ? "border-violet-400 bg-violet-50 scale-[1.02]"
                    : imagePreview
                    ? "border-violet-300 bg-white"
                    : "border-gray-300 bg-white hover:border-violet-300 hover:bg-violet-50/30"
                }`}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Your selfie"
                      className="w-full max-h-[400px] object-contain"
                    />
                    <button
                      onClick={resetAll}
                      className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center py-16 px-6 cursor-pointer">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mb-6">
                      <Camera
                        size={32}
                        className="text-violet-600"
                      />
                    </div>
                    <p className="text-lg font-semibold text-gray-800 mb-2">
                      Upload your selfie
                    </p>
                    <p className="text-sm text-gray-500 mb-6 text-center">
                      Drag & drop or click to browse. JPEG, PNG, WebP up
                      to 5MB.
                    </p>
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors text-sm">
                      <Upload size={16} />
                      Choose Photo
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center"
                >
                  {error}
                </motion.p>
              )}

              {/* Analyze Button */}
              {imageFile && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-xl font-semibold text-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-violet-600/25"
                >
                  {loading ? (
                    <>
                      <Loader2 size={22} className="animate-spin" />
                      Analyzing your features…
                    </>
                  ) : (
                    <>
                      <Sparkles size={22} />
                      Get AI Recommendations
                    </>
                  )}
                </motion.button>
              )}

              {/* Tips */}
              <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-3">Tips for best results</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-500 mt-0.5">✓</span>
                    Use a clear, well-lit front-facing photo
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-500 mt-0.5">✓</span>
                    Keep hair visible and not covered
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-500 mt-0.5">✓</span>
                    Avoid heavy filters or sunglasses
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-500 mt-0.5">✓</span>
                    Natural lighting works best
                  </li>
                </ul>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Back / New Analysis button */}
              <div className="mb-8 flex items-center justify-between">
                <button
                  onClick={resetAll}
                  className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
                >
                  ← New Analysis
                </button>
              </div>

              {/* Profile Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-8 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-6">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Your photo"
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Sparkles size={20} className="text-violet-600" />
                      Your Appearance Profile
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: "Face Shape", value: result.profile.faceShape },
                        { label: "Skin Tone", value: result.profile.skinTone },
                        { label: "Hair Length", value: result.profile.hairLength },
                        { label: "Hair Texture", value: result.profile.hairTexture },
                      ].map((item) => (
                        <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                            {item.label}
                          </p>
                          <p className="text-sm font-semibold text-gray-900 mt-1 capitalize">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                    {result.profile.styleCharacteristics?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {result.profile.styleCharacteristics.map((trait) => (
                          <span
                            key={trait}
                            className="px-3 py-1 bg-violet-100 text-violet-700 text-xs font-medium rounded-full"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Personalized Recommendations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {result.recommendations.map(
                  (rec: BeautyRecommendation, i: number) => (
                    <motion.div
                      key={rec.name}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-violet-200 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                              categoryColors[rec.category] ||
                              "from-gray-400 to-gray-500"
                            } text-white flex items-center justify-center`}
                          >
                            {categoryIcons[rec.category] || (
                              <Star size={16} />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {rec.name}
                            </h3>
                            <span className="text-xs text-gray-500 capitalize">
                              {rec.category}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">
                          {rec.confidence}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">
                        {rec.explanation}
                      </p>
                      {/* Confidence bar */}
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${rec.confidence}%` }}
                          transition={{ delay: i * 0.06 + 0.3, duration: 0.6 }}
                          className={`h-1.5 rounded-full bg-gradient-to-r ${
                            categoryColors[rec.category] ||
                            "from-gray-400 to-gray-500"
                          }`}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {rec.relatedServices.map((svc) => (
                          <span
                            key={svc}
                            className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md"
                          >
                            {svc}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )
                )}
              </div>

              {/* Matched Salons */}
              {result.matchedSalons.length > 0 && (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Recommended Salons
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.matchedSalons.map((salon, i) => (
                      <motion.a
                        key={salon.id}
                        href={`/salons/${salon.id}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
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
                          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
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
                          <p className="text-xs text-gray-500 mt-1">
                            {salon.city}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {salon.matchedServices
                              .slice(0, 3)
                              .map((svc) => (
                                <span
                                  key={svc.id}
                                  className="px-2 py-0.5 bg-violet-50 text-violet-700 text-xs rounded-md"
                                >
                                  {svc.name} · ₹{svc.price}
                                </span>
                              ))}
                          </div>
                          <div className="mt-4 flex items-center gap-1 text-sm font-medium text-violet-600 group-hover:gap-2 transition-all">
                            Book Now <ArrowRight size={14} />
                          </div>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
