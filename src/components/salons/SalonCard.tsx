import Link from "next/link";
import { MapPin } from "lucide-react";
import StarRating from "@/components/shared/StarRating";
import Button from "@/components/shared/Button";
import { formatPrice } from "@/lib/utils";
import type { Salon } from "@/types";

interface SalonCardProps {
  salon: Salon;
}

export default function SalonCard({ salon }: SalonCardProps) {
  return (
    <Link href={`/salons/${salon.id}`} className="group block">
      <article className="bg-white rounded-2xl overflow-hidden border border-border-light transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1">
        {/* Cover image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-accent/30">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl font-bold text-primary">
                  {salon.name.charAt(0)}
                </span>
              </div>
              <p className="text-xs text-muted">Photo</p>
            </div>
          </div>
          {salon.verified && (
            <span className="absolute top-3 left-3 bg-white/95 text-xs font-medium text-foreground px-2.5 py-1 rounded-full">
              ✓ Verified
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {salon.name}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-sm font-semibold text-foreground">
                {salon.rating}
              </span>
              <StarRating rating={salon.rating} size={14} />
            </div>
          </div>

          <p className="mt-1 text-sm text-muted">{salon.tagline}</p>

          <div className="mt-3 flex items-center gap-4 text-sm text-muted">
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {salon.city}
            </span>
            <span>{salon.reviewCount} reviews</span>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted">
              From{" "}
              <span className="text-foreground font-semibold">
                {formatPrice(salon.startingPrice)}
              </span>
            </p>
            <Button size="sm" variant="secondary" className="rounded-lg text-xs">
              Book Appointment
            </Button>
          </div>
        </div>
      </article>
    </Link>
  );
}
