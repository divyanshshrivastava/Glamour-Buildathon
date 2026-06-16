"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import SalonCard from "@/components/salons/SalonCard";
import AnimateIn from "@/components/shared/AnimateIn";
import { getAllSalons, searchSalons } from "@/lib/api/salons";
import type { Salon } from "@/types";

import AIConciergeBar from "@/components/salons/AIConciergeBar";

const CITIES = [
  "All Cities",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Chandigarh",
  "Indore",
  "Goa",
  "Noida",
  "Gurgaon",
];

export default function SalonsPage() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [filteredSalons, setFilteredSalons] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Load salons and set default city from localStorage
  useEffect(() => {
    const loadSalons = async () => {
      try {
        const data = await getAllSalons();
        setSalons(data);
        
        // Set default city from localStorage (set during registration/login)
        const userCity = localStorage.getItem("user_default_city");
        if (userCity) {
          setSelectedCity(userCity);
        }
      } catch (error) {
        console.error("Failed to load salons:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSalons();
  }, []);

  // Filter salons whenever search query or city changes
  useEffect(() => {
    let results = salons;

    // Filter by city
    if (selectedCity && selectedCity !== "All Cities") {
      results = results.filter(
        (salon) => salon.city.toLowerCase() === selectedCity.toLowerCase()
      );
    }

    // Filter by search query (name, tagline, or service names)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (salon) =>
          salon.name.toLowerCase().includes(q) ||
          salon.tagline.toLowerCase().includes(q) ||
          salon.services.some((s) => s.name.toLowerCase().includes(q)) ||
          salon.services.some((s) => s.category.toLowerCase().includes(q))
      );
    }

    setFilteredSalons(results);
  }, [salons, selectedCity, searchQuery]);

  // Get unique cities from actual salon data (merged with preset list)
  const availableCities = Array.from(
    new Set(["All Cities", ...salons.map((s) => s.city).filter(Boolean).sort()])
  );

  return (
    <div className="pt-24 pb-16">
      <div className="container-page">
        {/* Page header */}
        <AnimateIn direction="up">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Browse Salons
            </h1>
            <p className="mt-3 text-lg text-muted max-w-xl">
              Discover verified salons across India. Find the perfect match for
              your needs.
            </p>
          </div>
        </AnimateIn>

        {/* AI Concierge Search */}
        <AnimateIn direction="up" delay={0.05}>
          <AIConciergeBar />
        </AnimateIn>

        {/* Search & Filter Bar */}
        <AnimateIn direction="up" delay={0.1}>
          <div className="bg-white rounded-2xl border border-border-light p-4 mb-10 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex items-center gap-3 flex-1 px-4 py-2 rounded-xl bg-background">
                <Search size={18} className="text-muted" />
                <input
                  type="text"
                  placeholder="Search salons by name or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm bg-transparent outline-none text-foreground placeholder:text-muted/60"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* City Dropdown */}
              <div className="relative md:w-52">
                <button
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl bg-background text-sm text-foreground cursor-pointer hover:bg-accent/30 transition-colors"
                >
                  <MapPin size={18} className="text-muted flex-shrink-0" />
                  <span className="flex-1 text-left truncate">
                    {selectedCity}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-muted transition-transform duration-200 ${
                      showCityDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showCityDropdown && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowCityDropdown(false)}
                    />
                    {/* Dropdown */}
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-border-light shadow-lg z-20 max-h-64 overflow-y-auto">
                      {availableCities.map((city) => (
                        <button
                          key={city}
                          onClick={() => {
                            setSelectedCity(city);
                            setShowCityDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer first:rounded-t-xl last:rounded-b-xl ${
                            selectedCity === city
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-foreground hover:bg-accent/30"
                          }`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Clear filters button */}
              {(selectedCity !== "All Cities" || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCity("All Cities");
                    setSearchQuery("");
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-white text-sm font-medium hover:bg-foreground/90 transition-colors cursor-pointer"
                >
                  <X size={16} />
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </AnimateIn>

        {/* Results count */}
        <AnimateIn direction="up" delay={0.15}>
          <p className="text-sm text-muted mb-6">
            Showing{" "}
            <span className="font-medium text-foreground">
              {filteredSalons.length}
            </span>{" "}
            {filteredSalons.length === 1 ? "salon" : "salons"}
            {selectedCity !== "All Cities" && (
              <span>
                {" "}
                in{" "}
                <span className="font-medium text-foreground">
                  {selectedCity}
                </span>
              </span>
            )}
          </p>
        </AnimateIn>

        {/* Loading state */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-border-light overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-accent/30" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-accent/30 rounded w-3/4" />
                  <div className="h-4 bg-accent/20 rounded w-1/2" />
                  <div className="h-4 bg-accent/20 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredSalons.length > 0 ? (
          /* Salon grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSalons.map((salon, index) => (
              <AnimateIn key={salon.id} delay={index * 0.06} direction="up">
                <SalonCard salon={salon} />
              </AnimateIn>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-accent/30 flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No salons found
            </h3>
            <p className="text-sm text-muted max-w-md mx-auto">
              {selectedCity !== "All Cities"
                ? `No salons found in ${selectedCity}. Try selecting a different city or clear the filters.`
                : "No salons match your search. Try a different keyword."}
            </p>
            <button
              onClick={() => {
                setSelectedCity("All Cities");
                setSearchQuery("");
              }}
              className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer"
            >
              Show All Salons
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
