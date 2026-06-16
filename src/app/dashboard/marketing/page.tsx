"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Megaphone,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  Camera,
  Globe,
  MessageCircle,
  Image as ImageIcon,
  Hash,
  ChevronDown,
  Wand2,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { generateMarketing, refineMarketing } from "@/lib/api/ai";
import type { MarketingContent, MarketingInput, MarketingRefineInput } from "@/types/ai";

const TONES = [
  { value: "premium", label: "Premium", emoji: "✨" },
  { value: "luxury", label: "Luxury", emoji: "💎" },
  { value: "friendly", label: "Friendly", emoji: "😊" },
  { value: "professional", label: "Professional", emoji: "💼" },
  { value: "trendy", label: "Trendy", emoji: "🔥" },
  { value: "festive", label: "Festive", emoji: "🎉" },
] as const;

const PLATFORMS = [
  { value: "instagram" as const, label: "Instagram", icon: Camera, color: "from-pink-500 to-purple-600" },
  { value: "facebook" as const, label: "Facebook", icon: Globe, color: "from-blue-500 to-blue-700" },
  { value: "whatsapp" as const, label: "WhatsApp", icon: MessageCircle, color: "from-green-500 to-emerald-600" },
];

const REFINE_ACTIONS = [
  { value: "rewrite", label: "Rewrite" },
  { value: "shorten", label: "Shorten" },
  { value: "expand", label: "Expand" },
  { value: "more_premium", label: "More Premium" },
  { value: "more_persuasive", label: "More Persuasive" },
] as const;

export default function MarketingPage() {
  const { token } = useAuth();

  // Form state
  const [service, setService] = useState("");
  const [offer, setOffer] = useState("");
  const [discount, setDiscount] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [occasion, setOccasion] = useState("");
  const [businessGoal, setBusinessGoal] = useState("");
  const [tone, setTone] = useState<MarketingInput["tone"]>("professional");
  const [selectedPlatforms, setSelectedPlatforms] = useState<MarketingInput["platforms"]>(["instagram"]);

  // Result state
  const [contents, setContents] = useState<MarketingContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [refiningIndex, setRefiningIndex] = useState<number | null>(null);

  const togglePlatform = (platform: MarketingInput["platforms"][number]) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleGenerate = async () => {
    if (!service.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generateMarketing({
        service: service.trim(),
        offer: offer.trim() || undefined,
        discount: discount.trim() || undefined,
        targetAudience: targetAudience.trim() || undefined,
        occasion: occasion.trim() || undefined,
        businessGoal: businessGoal.trim() || undefined,
        tone,
        platforms: selectedPlatforms,
      });
      setContents(result.contents || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRefine = async (content: MarketingContent, action: string, index: number) => {
    setRefiningIndex(index);
    try {
      const result = await refineMarketing({
        originalContent: content.text,
        action: action as MarketingRefineInput["action"],
        platform: content.platform,
      });
      setContents((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], ...result };
        return updated;
      });
    } catch (err) {
      console.error("Refine failed:", err);
    } finally {
      setRefiningIndex(null);
    }
  };

  const platformIcon = (platform: string) => {
    const p = PLATFORMS.find((pl) => pl.value === platform);
    if (!p) return <Megaphone size={16} />;
    const Icon = p.icon;
    return <Icon size={16} />;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <Megaphone size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Marketing Assistant</h1>
            <p className="text-sm text-gray-500">Create professional marketing content in seconds</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-5">Content Details</h2>

            <div className="space-y-4">
              {/* Service */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Service *
                </label>
                <input
                  type="text"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder="e.g. Bridal Makeup Package"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all"
                />
              </div>

              {/* Offer & Discount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Offer
                  </label>
                  <input
                    type="text"
                    value={offer}
                    onChange={(e) => setOffer(e.target.value)}
                    placeholder="e.g. Free trial"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Discount
                  </label>
                  <input
                    type="text"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="e.g. 20% off"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all"
                  />
                </div>
              </div>

              {/* Target Audience & Occasion */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. Brides-to-be"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Occasion
                  </label>
                  <input
                    type="text"
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    placeholder="e.g. Diwali, Wedding"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all"
                  />
                </div>
              </div>

              {/* Business Goal */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Business Goal
                </label>
                <input
                  type="text"
                  value={businessGoal}
                  onChange={(e) => setBusinessGoal(e.target.value)}
                  placeholder="e.g. Increase weekend bookings"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all"
                />
              </div>

              {/* Tone */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Tone
                </label>
                <div className="flex flex-wrap gap-2">
                  {TONES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTone(t.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        tone === t.value
                          ? "bg-violet-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-violet-50 hover:text-violet-700"
                      }`}
                    >
                      {t.emoji} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platforms */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Platforms
                </label>
                <div className="flex gap-2">
                  {PLATFORMS.map((p) => {
                    const Icon = p.icon;
                    const isSelected = selectedPlatforms.includes(p.value);
                    return (
                      <button
                        key={p.value}
                        onClick={() => togglePlatform(p.value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                          isSelected
                            ? `bg-gradient-to-r ${p.color} text-white shadow-md`
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <Icon size={14} />
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading || !service.trim() || selectedPlatforms.length === 0}
                className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Content
                  </>
                )}
              </button>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Generated Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {contents.length === 0 && !loading ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-violet-100 flex items-center justify-center mb-6">
                  <Wand2 size={32} className="text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Ready to create content
                </h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  Fill in the details and click Generate to create professional
                  marketing content for your salon.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {contents.map((content, i) => (
                  <motion.div
                    key={`${content.platform}-${i}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
                  >
                    {/* Platform Header */}
                    <div className={`px-5 py-3 bg-gradient-to-r ${
                      PLATFORMS.find((p) => p.value === content.platform)?.color || "from-gray-500 to-gray-600"
                    } text-white flex items-center justify-between`}>
                      <div className="flex items-center gap-2">
                        {platformIcon(content.platform)}
                        <span className="font-medium text-sm capitalize">
                          {content.platform}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(content.text, i)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors"
                      >
                        {copiedIndex === i ? (
                          <>
                            <Check size={12} />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-5">
                      {/* Content Text */}
                      <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                          {content.text}
                        </p>
                      </div>

                      {/* Hashtags */}
                      {content.hashtags?.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Hash size={12} className="text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">
                              Hashtags
                            </span>
                            <button
                              onClick={() =>
                                handleCopy(
                                  content.hashtags.map((h) => `#${h}`).join(" "),
                                  i + 100
                                )
                              }
                              className="ml-auto text-xs text-violet-600 hover:text-violet-700"
                            >
                              Copy all
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {content.hashtags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 bg-violet-50 text-violet-700 text-xs rounded-md"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Image Prompt */}
                      {content.imagePrompt && (
                        <div className="mb-4">
                          <div className="flex items-center gap-1.5 mb-2">
                            <ImageIcon size={12} className="text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">
                              AI Image Prompt
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 italic">
                            {content.imagePrompt}
                          </p>
                        </div>
                      )}

                      {/* Refine Actions */}
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                        {REFINE_ACTIONS.map((action) => (
                          <button
                            key={action.value}
                            onClick={() => handleRefine(content, action.value, i)}
                            disabled={refiningIndex === i}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-violet-100 text-gray-600 hover:text-violet-700 text-xs rounded-lg font-medium transition-all disabled:opacity-50 flex items-center gap-1"
                          >
                            {refiningIndex === i ? (
                              <Loader2 size={10} className="animate-spin" />
                            ) : (
                              <RefreshCw size={10} />
                            )}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
