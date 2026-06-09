import {
  ShieldCheck,
  MessageSquare,
  Receipt,
  Zap,
  Award,
  Crown,
} from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";
import AnimateIn from "@/components/shared/AnimateIn";
import { WHY_CHOOSE_US } from "@/lib/constants";

const iconMap: Record<string, React.ReactNode> = {
  ShieldCheck: <ShieldCheck size={24} />,
  MessageSquare: <MessageSquare size={24} />,
  Receipt: <Receipt size={24} />,
  Zap: <Zap size={24} />,
  Award: <Award size={24} />,
  Crown: <Crown size={24} />,
};

export default function WhyChooseUs() {
  return (
    <section className="section-padding bg-white">
      <div className="container-page">
        <SectionHeader
          title="Why Choose Glamour"
          subtitle="We're building the most trusted salon marketplace in India."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {WHY_CHOOSE_US.map((item, index) => (
            <AnimateIn key={item.title} delay={index * 0.08} direction="up">
              <div className="p-6 md:p-8 rounded-2xl border border-border-light hover:border-primary/20 transition-all duration-300 bg-background">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
                  {iconMap[item.icon]}
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  {item.description}
                </p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
