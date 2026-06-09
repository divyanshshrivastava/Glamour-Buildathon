import type { Metadata } from "next";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";
import SalonCard from "@/components/salons/SalonCard";
import AnimateIn from "@/components/shared/AnimateIn";
import { getAllSalons } from "@/lib/api/salons";

export const metadata: Metadata = {
  title: "Browse Salons",
  description:
    "Explore verified salons near you. Compare ratings, reviews, and pricing to find the perfect salon for your needs.",
};

export default async function SalonsPage() {
  const salons = await getAllSalons();

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
              Discover {salons.length}+ verified salons across India. Find the
              perfect match for your needs.
            </p>
          </div>
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
                  className="w-full text-sm bg-transparent outline-none text-foreground placeholder:text-muted/60"
                />
              </div>

              {/* Location */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-background md:w-48">
                <MapPin size={18} className="text-muted" />
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full text-sm bg-transparent outline-none text-foreground placeholder:text-muted/60"
                />
              </div>

              {/* Filter button */}
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground text-white text-sm font-medium hover:bg-foreground/90 transition-colors cursor-pointer">
                <SlidersHorizontal size={16} />
                Filters
              </button>
            </div>
          </div>
        </AnimateIn>

        {/* Results count */}
        <AnimateIn direction="up" delay={0.15}>
          <p className="text-sm text-muted mb-6">
            Showing <span className="font-medium text-foreground">{salons.length}</span>{" "}
            salons
          </p>
        </AnimateIn>

        {/* Salon grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {salons.map((salon, index) => (
            <AnimateIn key={salon.id} delay={index * 0.06} direction="up">
              <SalonCard salon={salon} />
            </AnimateIn>
          ))}
        </div>

        {/* Pagination placeholder */}
        {/* TODO BACKEND: Implement real pagination with page/limit params */}
        <div className="mt-12 flex items-center justify-center gap-2">
          <button className="w-10 h-10 rounded-lg bg-primary text-white text-sm font-medium">
            1
          </button>
          <button className="w-10 h-10 rounded-lg bg-white border border-border-light text-sm text-muted hover:border-primary/40 transition-colors cursor-pointer">
            2
          </button>
          <button className="w-10 h-10 rounded-lg bg-white border border-border-light text-sm text-muted hover:border-primary/40 transition-colors cursor-pointer">
            3
          </button>
        </div>
      </div>
    </div>
  );
}
