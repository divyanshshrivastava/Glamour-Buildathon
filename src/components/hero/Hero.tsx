"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Calendar, Sparkles } from "lucide-react";
import Button from "@/components/shared/Button";
import { heroSalonsMock } from "@/mock/salons";

const salonPins = heroSalonsMock.map((salon) => ({
  id: salon.id,
  name: salon.name,
  rating: salon.rating,
  tagline: salon.tagline,
  x: salon.coordinates.x,
  y: salon.coordinates.y,
}));

export default function Hero() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-12 overflow-hidden">
      <div className="container-page w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column — Content */}
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[3.5rem] xl:text-6xl font-bold tracking-tight leading-[1.1] text-foreground">
                Find Your Perfect
                <br />
                <span className="text-primary">Salon Experience</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.15,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              className="mt-6 text-lg md:text-xl text-muted leading-relaxed max-w-lg"
            >
              Discover, compare, and book trusted salons near you in seconds.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.3,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              className="mt-8"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-border-light p-2 md:p-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-0">
                  {/* Location */}
                  <div className="flex items-center gap-3 px-4 py-3 md:border-r border-border-light">
                    <MapPin size={18} className="text-muted flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted uppercase tracking-wider">
                        Location
                      </p>
                      <input
                        type="text"
                        placeholder="Your city"
                        className="w-full text-sm text-foreground placeholder:text-muted/60 bg-transparent outline-none mt-0.5"
                      />
                    </div>
                  </div>

                  {/* Service */}
                  <div className="flex items-center gap-3 px-4 py-3 md:border-r border-border-light">
                    <Search size={18} className="text-muted flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted uppercase tracking-wider">
                        Service
                      </p>
                      <input
                        type="text"
                        placeholder="Haircut, facial..."
                        className="w-full text-sm text-foreground placeholder:text-muted/60 bg-transparent outline-none mt-0.5"
                      />
                    </div>
                  </div>

                  {/* Date + Button */}
                  <div className="flex items-center gap-2 px-4 py-3">
                    <Calendar size={18} className="text-muted flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted uppercase tracking-wider">
                        Date
                      </p>
                      <input
                        type="text"
                        placeholder="Pick a date"
                        className="w-full text-sm text-foreground placeholder:text-muted/60 bg-transparent outline-none mt-0.5"
                      />
                    </div>
                    <Button size="sm" className="hidden md:flex rounded-xl">
                      <Search size={16} />
                    </Button>
                  </div>
                </div>

                {/* Mobile search button */}
                <div className="md:hidden mt-2">
                  <Button size="md" className="w-full rounded-xl">
                    <Search size={16} />
                    Search Salons
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.45,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              className="mt-6 flex flex-wrap gap-4"
            >
              <Button href="/salons" size="lg">
                Explore Salons
              </Button>
              <Button href="/ai/beauty-consultant" variant="outline" size="lg">
                <Sparkles size={16} />
                AI Beauty Consultant
              </Button>
            </motion.div>

            {/* Trust signals */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 flex items-center gap-6 text-sm text-muted"
            >
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                500+ Salons
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                50+ Cities
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                10K+ Bookings
              </span>
            </motion.div>
          </div>

          {/* Right Column — Map Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.21, 0.47, 0.32, 0.98],
            }}
            className="order-1 lg:order-2 relative"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto lg:max-w-none">
              {/* Map background */}
              <div className="absolute inset-0 bg-white rounded-3xl shadow-lg border border-border-light overflow-hidden">
                {/* Stylized city grid */}
                <svg
                  viewBox="0 0 400 400"
                  className="w-full h-full"
                  fill="none"
                >
                  {/* Grid roads */}
                  <defs>
                    <pattern
                      id="grid"
                      width="50"
                      height="50"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 50 0 L 0 0 0 50"
                        fill="none"
                        stroke="#F0EDE8"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect width="400" height="400" fill="#FAFAF8" />
                  <rect width="400" height="400" fill="url(#grid)" />

                  {/* Main roads */}
                  <line
                    x1="0"
                    y1="200"
                    x2="400"
                    y2="200"
                    stroke="#E8D8B4"
                    strokeWidth="3"
                    opacity="0.5"
                  />
                  <line
                    x1="200"
                    y1="0"
                    x2="200"
                    y2="400"
                    stroke="#E8D8B4"
                    strokeWidth="3"
                    opacity="0.5"
                  />
                  <line
                    x1="0"
                    y1="100"
                    x2="400"
                    y2="100"
                    stroke="#F0EDE8"
                    strokeWidth="2"
                    opacity="0.6"
                  />
                  <line
                    x1="0"
                    y1="300"
                    x2="400"
                    y2="300"
                    stroke="#F0EDE8"
                    strokeWidth="2"
                    opacity="0.6"
                  />
                  <line
                    x1="100"
                    y1="0"
                    x2="100"
                    y2="400"
                    stroke="#F0EDE8"
                    strokeWidth="2"
                    opacity="0.6"
                  />
                  <line
                    x1="300"
                    y1="0"
                    x2="300"
                    y2="400"
                    stroke="#F0EDE8"
                    strokeWidth="2"
                    opacity="0.6"
                  />

                  {/* Diagonal road */}
                  <line
                    x1="50"
                    y1="350"
                    x2="350"
                    y2="50"
                    stroke="#F0EDE8"
                    strokeWidth="2"
                    opacity="0.4"
                  />

                  {/* Building blocks */}
                  {[
                    { x: 60, y: 120, w: 30, h: 25 },
                    { x: 120, y: 60, w: 35, h: 20 },
                    { x: 220, y: 110, w: 40, h: 30 },
                    { x: 310, y: 60, w: 25, h: 35 },
                    { x: 70, y: 230, w: 30, h: 40 },
                    { x: 150, y: 250, w: 35, h: 25 },
                    { x: 260, y: 220, w: 28, h: 28 },
                    { x: 320, y: 270, w: 35, h: 30 },
                    { x: 110, y: 320, w: 40, h: 25 },
                    { x: 240, y: 330, w: 30, h: 30 },
                    { x: 170, y: 150, w: 20, h: 35 },
                    { x: 280, y: 160, w: 25, h: 20 },
                  ].map((block, i) => (
                    <rect
                      key={i}
                      x={block.x}
                      y={block.y}
                      width={block.w}
                      height={block.h}
                      rx="3"
                      fill="#F0EDE8"
                      opacity="0.7"
                    />
                  ))}

                  {/* Park area */}
                  <ellipse
                    cx="160"
                    cy="200"
                    rx="35"
                    ry="25"
                    fill="#E8D8B4"
                    opacity="0.2"
                  />

                  {/* Location pins */}
                  {salonPins.map((pin) => {
                    const cx = (pin.x / 100) * 400;
                    const cy = (pin.y / 100) * 400;
                    const isActive = activeId === pin.id;
                    return (
                      <g
                        key={pin.id}
                        onMouseEnter={() => setActiveId(pin.id)}
                        onMouseLeave={() => setActiveId(null)}
                        className="cursor-pointer"
                      >
                        {/* Pulse ring */}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isActive ? 18 : 14}
                          fill="#C9A86A"
                          opacity={isActive ? 0.15 : 0.1}
                          className="transition-all duration-300"
                        />
                        {/* Pin dot */}
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isActive ? 7 : 5}
                          fill="#C9A86A"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                          className="transition-all duration-300"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Floating salon cards */}
              {salonPins.map((pin, index) => {
                const isActive = activeId === pin.id;
                const positions = [
                  { top: "8%", right: "5%", translate: "0" },
                  { top: "38%", left: "3%", translate: "0" },
                  { bottom: "22%", right: "8%", translate: "0" },
                  { bottom: "5%", left: "10%", translate: "0" },
                ];
                const pos = positions[index % positions.length];

                return (
                  <motion.div
                    key={pin.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.5 + index * 0.12,
                      ease: [0.21, 0.47, 0.32, 0.98],
                    }}
                    onMouseEnter={() => setActiveId(pin.id)}
                    onMouseLeave={() => setActiveId(null)}
                    className={`absolute z-10 ${
                      isActive ? "z-20" : ""
                    }`}
                    style={{
                      ...pos,
                    }}
                  >
                    <div
                      className={`bg-white rounded-xl px-4 py-3 shadow-md border transition-all duration-300 cursor-pointer ${
                        isActive
                          ? "border-primary shadow-lg scale-105"
                          : "border-border-light hover:border-primary/40 hover:shadow-lg"
                      }`}
                    >
                      <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                        {pin.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-primary">
                          ★ {pin.rating}
                        </span>
                        <span className="text-xs text-muted">
                          {pin.tagline}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
