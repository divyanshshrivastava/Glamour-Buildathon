import type { Metadata } from "next";
import {
  Users,
  Calendar,
  BarChart3,
  Shield,
  ArrowRight,
} from "lucide-react";
import AnimateIn from "@/components/shared/AnimateIn";
import Button from "@/components/shared/Button";
import PartnerForm from "@/components/partner/PartnerForm";
import { STATS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Partner With Us",
  description:
    "Grow your salon business with Glamour. Reach more customers, manage appointments effortlessly, and grow your revenue.",
};

const benefits = [
  {
    icon: <Users size={24} />,
    title: "Reach More Customers",
    description:
      "Get discovered by thousands of beauty enthusiasts actively looking for salon services in your area.",
  },
  {
    icon: <Calendar size={24} />,
    title: "Smart Booking Management",
    description:
      "Manage all your appointments from one dashboard. Reduce no-shows with automated reminders.",
  },
  {
    icon: <BarChart3 size={24} />,
    title: "Business Analytics",
    description:
      "Understand your business better with detailed insights on bookings, revenue, and customer preferences.",
  },
  {
    icon: <Shield size={24} />,
    title: "Verified Badge",
    description:
      "Stand out with a verified badge that builds trust and increases booking rates by up to 40%.",
  },
];

const partnerSteps = [
  {
    step: "01",
    title: "Apply Online",
    description: "Fill out a simple form with your salon details and services.",
  },
  {
    step: "02",
    title: "Get Verified",
    description:
      "Our team reviews your application and verifies your salon quality.",
  },
  {
    step: "03",
    title: "Go Live",
    description:
      "Your salon profile goes live and customers can start booking instantly.",
  },
];

export default function PartnerPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="section-padding">
        <div className="container-page">
          <div className="max-w-3xl mx-auto text-center">
            <AnimateIn direction="up">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                Grow Your Salon
                <br />
                <span className="text-primary">Business</span>
              </h1>
            </AnimateIn>

            <AnimateIn direction="up" delay={0.1}>
              <p className="mt-6 text-lg md:text-xl text-muted leading-relaxed max-w-xl mx-auto">
                Reach more customers and manage appointments effortlessly.
                Join hundreds of salons already growing with Glamour.
              </p>
            </AnimateIn>

            <AnimateIn direction="up" delay={0.2}>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button size="lg" href="#apply">
                  Apply Now
                  <ArrowRight size={18} />
                </Button>
                <Button variant="outline" size="lg" href="#benefits">
                  Learn More
                </Button>
              </div>
            </AnimateIn>

            {/* Stats */}
            <AnimateIn direction="up" delay={0.3}>
              <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {STATS.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl md:text-3xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-muted">{stat.label}</p>
                  </div>
                ))}
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="section-padding bg-white">
        <div className="container-page">
          <AnimateIn direction="up">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                Why Partner With Us
              </h2>
              <p className="mt-4 text-lg text-muted max-w-xl mx-auto">
                Everything you need to grow your salon business, all in one
                platform.
              </p>
            </div>
          </AnimateIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <AnimateIn key={benefit.title} delay={index * 0.1} direction="up">
                <div className="p-6 md:p-8 rounded-2xl border border-border-light bg-background hover:border-primary/20 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* How it works for partners */}
      <section className="section-padding">
        <div className="container-page">
          <AnimateIn direction="up">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                Get Started in 3 Steps
              </h2>
            </div>
          </AnimateIn>

          <div className="max-w-2xl mx-auto space-y-6">
            {partnerSteps.map((step, index) => (
              <AnimateIn key={step.step} delay={index * 0.12} direction="left">
                <div className="flex gap-6 p-6 rounded-2xl border border-border-light bg-white hover:border-primary/20 transition-all duration-300">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {step.step}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* Sign Up Form */}
      <section id="apply" className="section-padding bg-white">
        <div className="container-page">
          <div className="max-w-xl mx-auto">
            <AnimateIn direction="up">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                  Join Glamour Today
                </h2>
                <p className="mt-4 text-lg text-muted">
                  Fill in your details and we&apos;ll get back to you within 24
                  hours.
                </p>
              </div>
            </AnimateIn>

            <AnimateIn direction="up" delay={0.1}>
              {/* TODO BACKEND: Connect to partner registration API */}
              {/* Endpoint: POST /api/partners/register */}
              {/* Authentication: Not Required */}
              <PartnerForm />
            </AnimateIn>
          </div>
        </div>
      </section>
    </div>
  );
}
