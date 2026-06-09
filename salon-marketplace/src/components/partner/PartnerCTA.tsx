import { ArrowRight } from "lucide-react";
import AnimateIn from "@/components/shared/AnimateIn";
import Button from "@/components/shared/Button";
import { STATS } from "@/lib/constants";

export default function PartnerCTA() {
  return (
    <section className="section-padding bg-foreground text-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container-page relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <AnimateIn direction="up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Grow Your Salon
              <br />
              <span className="text-primary">Business</span>
            </h2>
          </AnimateIn>

          <AnimateIn direction="up" delay={0.1}>
            <p className="mt-6 text-lg md:text-xl text-white/60 leading-relaxed max-w-xl mx-auto">
              Reach more customers and manage appointments effortlessly. Join
              hundreds of salons already growing with Glamour.
            </p>
          </AnimateIn>

          {/* Stats */}
          <AnimateIn direction="up" delay={0.2}>
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl md:text-3xl font-bold text-primary">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-white/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </AnimateIn>

          <AnimateIn direction="up" delay={0.3}>
            <div className="mt-10">
              <Button
                href="/partner"
                size="lg"
                className="bg-primary text-white hover:bg-primary-hover"
              >
                Become a Partner
                <ArrowRight size={18} />
              </Button>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
