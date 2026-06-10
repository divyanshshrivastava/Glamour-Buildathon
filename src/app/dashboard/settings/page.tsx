"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { getMySalon, updateSalon, SalonWithStats } from "@/lib/api/dashboard";
import {
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MapPin,
  Phone,
  Globe,
  Mail,
  Clock,
} from "lucide-react";
import Button from "@/components/shared/Button";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const AMENITIES_OPTIONS = [
  "Wi-Fi",
  "Parking",
  "A/C",
  "Wheelchair Accessible",
  "Waiting Area",
  "Restrooms",
  "Refreshments",
  "Kids Play Area",
];

interface HoursEntry {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

export default function SettingsPage() {
  const { token } = useAuth();
  const [salon, setSalon] = useState<SalonWithStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [hours, setHours] = useState<HoursEntry[]>(
    DAYS.map((d) => ({ day: d, open: "09:00", close: "18:00", closed: false }))
  );

  useEffect(() => {
    const init = async () => {
      if (!token) return;
      try {
        const data = await getMySalon(token);
        setSalon(data);

        // Populate form
        setName(data.name || "");
        setTagline(data.tagline || "");
        setDescription(data.description || "");
        setPhoneNum(data.phone || "");
        setWebsite(data.website || "");
        setAddress(data.address || "");
        setCity(data.city || "");
        setAmenities(data.amenities || []);

        // Populate hours
        if (data.openingHours && data.openingHours.length > 0) {
          const hoursMap: Record<string, HoursEntry> = {};
          data.openingHours.forEach((h) => {
            hoursMap[h.day] = {
              day: h.day,
              open: h.open || "09:00",
              close: h.close || "18:00",
              closed: h.closed || false,
            };
          });
          setHours(
            DAYS.map(
              (d) =>
                hoursMap[d] || { day: d, open: "09:00", close: "18:00", closed: false }
            )
          );
        }
      } catch (err) {
        console.error("Failed to load salon:", err);
        setError("Failed to load salon data.");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [token]);

  const handleAmenityToggle = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleHoursChange = (
    index: number,
    field: keyof HoursEntry,
    value: string | boolean
  ) => {
    setHours((prev) =>
      prev.map((h, i) => (i === index ? { ...h, [field]: value } : h))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !salon) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await updateSalon(token, salon.id, {
        name: name.trim(),
        tagline: tagline.trim() || undefined,
        description: description.trim() || undefined,
        phone: phoneNum.trim(),
        website: website.trim() || undefined,
        address: address.trim(),
        city: city.trim(),
        amenities,
        openingHours: hours.map((h) => ({
          day: h.day,
          open: h.open,
          close: h.close,
          closed: h.closed,
        })),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Salon Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Update your salon&apos;s profile information.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-start gap-3">
          <AlertCircle className="mt-0.5 flex-shrink-0" size={18} />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 flex-shrink-0" size={18} />
          <p className="font-medium">Changes saved successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-semibold text-gray-900">Basic Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salon Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-violet-500 focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-violet-500 focus:border-violet-500"
                placeholder="A brief catchy tagline for your salon"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-violet-500 focus:border-violet-500"
                rows={4}
                placeholder="Describe your salon, specialties, and what makes you unique..."
              />
            </div>
          </div>
        </div>

        {/* Contact & Location */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-semibold text-gray-900">Contact & Location</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone size={14} className="inline mr-1 text-gray-400" />
                  Phone
                </label>
                <input
                  type="text"
                  value={phoneNum}
                  onChange={(e) => setPhoneNum(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-violet-500 focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Globe size={14} className="inline mr-1 text-gray-400" />
                  Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-violet-500 focus:border-violet-500"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin size={14} className="inline mr-1 text-gray-400" />
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-violet-500 focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-semibold text-gray-900">Amenities</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-3">
              {AMENITIES_OPTIONS.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => handleAmenityToggle(amenity)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    amenities.includes(amenity)
                      ? "bg-violet-50 text-violet-700 border-violet-300 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {amenities.includes(amenity) ? "✓ " : ""}
                  {amenity}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock size={18} className="text-violet-500" />
              Opening Hours
            </h2>
          </div>
          <div className="p-6 space-y-3">
            {hours.map((h, idx) => (
              <div
                key={h.day}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                  h.closed ? "bg-gray-50" : "bg-white"
                }`}
              >
                <span className="text-sm font-medium text-gray-700 w-24">
                  {h.day}
                </span>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={h.closed}
                    onChange={(e) =>
                      handleHoursChange(idx, "closed", e.target.checked)
                    }
                    className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm text-gray-500">Closed</span>
                </label>

                {!h.closed && (
                  <div className="flex items-center gap-2 ml-auto">
                    <input
                      type="time"
                      value={h.open}
                      onChange={(e) =>
                        handleHoursChange(idx, "open", e.target.value)
                      }
                      className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-violet-500 focus:border-violet-500"
                    />
                    <span className="text-gray-400 text-sm">to</span>
                    <input
                      type="time"
                      value={h.close}
                      onChange={(e) =>
                        handleHoursChange(idx, "close", e.target.value)
                      }
                      className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-violet-500 focus:border-violet-500"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={saving}
            className="bg-violet-600 hover:bg-violet-700 border-none px-8 py-2.5 shadow-sm"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin mr-2" />
            ) : (
              <Save size={18} className="mr-2" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
