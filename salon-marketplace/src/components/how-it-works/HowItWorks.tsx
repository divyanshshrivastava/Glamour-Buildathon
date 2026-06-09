import {
  Search,
  SlidersHorizontal,
  CalendarCheck,
  Sparkles,
} from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";
import AnimateIn from "@/components/shared/AnimateIn";
import { HOW_IT_WORKS_STEPS } from "@/lib/constants";

const iconMap: Record<string, React.ReactNode> = {
  Search: <Search size={24} />,
  SlidersHorizontal: <SlidersHorizontal size={24} />,
  CalendarCheck: <CalendarCheck size={24} />,
  Sparkles: <Sparkles size={24} />,
};

export default function HowItWorks() {
  return (
    <section className="section-padding">
      <div className="container-page">
        <SectionHeader
          title="How It Works"
          subtitle="Book your perfect salon experience in four simple steps."
        />

        <div className="relative">
          {/* Connecting line — desktop */}
          <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-px bg-border" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <AnimateIn key={step.step} delay={index * 0.12} direction="up">
                <div className="relative text-center">
                  {/* Step circle */}
                  <div className="relative z-10 w-14 h-14 rounded-full bg-white border-2 border-primary flex items-center justify-center mx-auto shadow-sm">
                    <span className="text-primary">
                      {iconMap[step.icon]}
                    </span>
                  </div>

                  {/* Step number */}
                  <div className="mt-4 inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {step.step}
                  </div>

                  <h3 className="mt-3 text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed max-w-[240px] mx-auto">
                    {step.description}
                  </p>

                  {/* Vertical connector — mobile */}
                  {index < HOW_IT_WORKS_STEPS.length - 1 && (
                    <div className="md:hidden w-px h-8 bg-border mx-auto mt-6" />
                  )}
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
