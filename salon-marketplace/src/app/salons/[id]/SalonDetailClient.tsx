"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  Check,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/shared/Button";
import StarRating from "@/components/shared/StarRating";
import { formatPrice } from "@/lib/utils";
import type { Salon, Review, Service } from "@/types";

interface SalonDetailClientProps {
  salon: Salon;
  reviews: Review[];
}

export default function SalonDetailClient({
  salon,
  reviews,
}: SalonDetailClientProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showAllServices, setShowAllServices] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const displayedServices = showAllServices
    ? salon.services
    : salon.services.slice(0, 5);

  const mockTimeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "17:00",
  ];

  return (
    <div className="pt-20 pb-16">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative h-64 md:h-80 lg:h-96 bg-accent/30"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <span className="text-4xl font-bold text-primary">
                {salon.name.charAt(0)}
              </span>
            </div>
            <p className="text-sm text-muted">Salon Cover Photo</p>
          </div>
        </div>

        {/* Back button */}
        <div className="absolute top-6 left-6">
          <Link
            href="/salons"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90 text-sm font-medium text-foreground hover:bg-white transition-colors shadow-sm"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>

        {salon.verified && (
          <div className="absolute top-6 right-6 bg-white/90 px-3 py-1.5 rounded-full text-sm font-medium text-foreground shadow-sm">
            ✓ Verified Salon
          </div>
        )}
      </motion.div>

      <div className="container-page mt-8 md:mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Salon Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                    {salon.name}
                  </h1>
                  <p className="mt-1 text-lg text-muted">{salon.tagline}</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-border-light">
                  <Star size={18} className="fill-primary text-primary" />
                  <span className="text-xl font-bold text-foreground">
                    {salon.rating}
                  </span>
                  <span className="text-sm text-muted">
                    ({salon.reviewCount} reviews)
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted">
                <span className="flex items-center gap-1.5">
                  <MapPin size={15} />
                  {salon.address}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone size={15} />
                  {salon.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail size={15} />
                  {salon.email}
                </span>
                {salon.website && (
                  <span className="flex items-center gap-1.5">
                    <Globe size={15} />
                    Website
                  </span>
                )}
              </div>

              <p className="mt-6 text-base text-foreground/80 leading-relaxed">
                {salon.description}
              </p>
            </motion.div>

            {/* Services & Pricing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Services & Pricing
              </h2>
              <div className="space-y-3">
                {displayedServices.map((service) => (
                  <div
                    key={service.id}
                    onClick={() =>
                      setSelectedService(
                        selectedService?.id === service.id ? null : service
                      )
                    }
                    className={`p-5 rounded-xl border cursor-pointer transition-all duration-200 ${
                      selectedService?.id === service.id
                        ? "border-primary bg-primary/5"
                        : "border-border-light bg-white hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-foreground">
                            {service.name}
                          </h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/50 text-muted">
                            {service.category}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted">
                          {service.description}
                        </p>
                        <p className="mt-2 text-xs text-muted flex items-center gap-1">
                          <Clock size={12} />
                          {service.duration}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-foreground">
                          {formatPrice(service.price)}
                        </p>
                        {selectedService?.id === service.id && (
                          <Check
                            size={16}
                            className="text-primary mt-1 ml-auto"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {salon.services.length > 5 && (
                <button
                  onClick={() => setShowAllServices(!showAllServices)}
                  className="mt-4 flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover transition-colors cursor-pointer"
                >
                  {showAllServices ? (
                    <>
                      Show less <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      Show all {salon.services.length} services{" "}
                      <ChevronDown size={16} />
                    </>
                  )}
                </button>
              )}
            </motion.div>

            {/* Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Gallery
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {salon.gallery.map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-xl bg-accent/20 border border-border-light flex items-center justify-center"
                  >
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1">
                        <span className="text-sm font-semibold text-primary">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-xs text-muted">Photo {index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Customer Reviews
              </h2>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-5 rounded-xl border border-border-light bg-white"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-primary">
                            {review.initials}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {review.author}
                          </p>
                          <div className="flex items-center gap-2">
                            <StarRating rating={review.rating} size={12} />
                            <span className="text-xs text-muted">
                              {new Date(review.date).toLocaleDateString(
                                "en-IN",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {review.text}
                      </p>
                      {review.helpful && (
                        <p className="mt-3 text-xs text-muted">
                          {review.helpful} people found this helpful
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted py-8 text-center">
                  No reviews yet. Be the first to leave a review!
                </p>
              )}
            </motion.div>

            {/* Business Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Business Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Opening Hours */}
                <div className="p-5 rounded-xl border border-border-light bg-white">
                  <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-primary" />
                    Opening Hours
                  </h3>
                  <div className="space-y-2">
                    {salon.openingHours.map((hours) => (
                      <div
                        key={hours.day}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted">{hours.day}</span>
                        <span className="font-medium text-foreground">
                          {hours.closed
                            ? "Closed"
                            : `${hours.open} - ${hours.close}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div className="p-5 rounded-xl border border-border-light bg-white">
                  <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Check size={18} className="text-primary" />
                    Amenities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {salon.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="text-sm px-3 py-1.5 rounded-lg bg-accent/30 text-foreground"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="sticky top-24"
            >
              <div className="bg-white rounded-2xl border border-border-light p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-foreground mb-1">
                  Book Appointment
                </h3>
                <p className="text-sm text-muted mb-6">
                  Select a service and pick your preferred time.
                </p>

                {/* Selected Service */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Service
                  </label>
                  {selectedService ? (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-sm font-semibold text-foreground">
                        {selectedService.name}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {selectedService.duration} ·{" "}
                        {formatPrice(selectedService.price)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted p-3 rounded-lg bg-background border border-border-light">
                      Select a service from the list →
                    </p>
                  )}
                </div>

                {/* Date */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Date
                  </label>
                  <div className="relative">
                    <Calendar
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-border-light bg-background text-foreground outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Time Slots */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Time
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {mockTimeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                          selectedTime === time
                            ? "bg-primary text-white"
                            : "bg-background border border-border-light text-foreground hover:border-primary/40"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Summary */}
                {selectedService && (
                  <div className="mb-6 p-4 rounded-lg bg-background border border-border-light">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">Service</span>
                      <span className="font-medium text-foreground">
                        {formatPrice(selectedService.price)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-muted">Platform fee</span>
                      <span className="font-medium text-foreground">₹0</span>
                    </div>
                    <div className="border-t border-border-light mt-3 pt-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">
                        Total
                      </span>
                      <span className="text-lg font-bold text-foreground">
                        {formatPrice(selectedService.price)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <Button
                  size="lg"
                  className="w-full rounded-xl"
                  disabled={!selectedService || !selectedDate || !selectedTime}
                >
                  {/* TODO BACKEND: Integrate with createBooking API */}
                  Book Now
                </Button>

                <p className="mt-3 text-xs text-center text-muted">
                  Free cancellation up to 24 hours before
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
