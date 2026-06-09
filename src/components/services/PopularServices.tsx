import {
  Scissors,
  Palette,
  Sparkles,
  Flower2,
  Hand,
  Heart,
  User,
  Sun,
} from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";
import AnimateIn from "@/components/shared/AnimateIn";
import { serviceCategoriesMock } from "@/mock/services";

const iconMap: Record<string, React.ReactNode> = {
  Scissors: <Scissors size={28} />,
  Palette: <Palette size={28} />,
  Sparkles: <Sparkles size={28} />,
  Flower2: <Flower2 size={28} />,
  Hand: <Hand size={28} />,
  Heart: <Heart size={28} />,
  User: <User size={28} />,
  Sun: <Sun size={28} />,
};

export default function PopularServices() {
  return (
    <section id="services" className="section-padding bg-white">
      <div className="container-page">
        <SectionHeader
          title="Popular Services"
          subtitle="Explore our most booked service categories across hundreds of salons."
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {serviceCategoriesMock.map((category, index) => (
            <AnimateIn key={category.id} delay={index * 0.06} direction="up">
              <div className="group relative p-6 md:p-8 rounded-2xl border border-border-light bg-background hover:bg-accent/20 hover:border-primary/20 transition-all duration-300 cursor-pointer">
                <div className="text-primary mb-4 transition-transform duration-300 group-hover:scale-110">
                  {iconMap[category.icon] || <Scissors size={28} />}
                </div>
                <h3 className="text-base md:text-lg font-semibold text-foreground">
                  {category.name}
                </h3>
                <p className="mt-1.5 text-sm text-muted leading-relaxed">
                  {category.description}
                </p>
                <p className="mt-3 text-xs font-medium text-primary">
                  {category.count} salons
                </p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
