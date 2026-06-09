import SalonCard from "./SalonCard";
import SectionHeader from "@/components/shared/SectionHeader";
import AnimateIn from "@/components/shared/AnimateIn";
import Button from "@/components/shared/Button";
import { getFeaturedSalons } from "@/lib/api/salons";

export default async function FeaturedSalons() {
  const salons = await getFeaturedSalons();

  return (
    <section id="explore" className="section-padding">
      <div className="container-page">
        <SectionHeader
          title="Featured Salons"
          subtitle="Hand-picked salons with exceptional ratings and verified quality standards."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {salons.slice(0, 8).map((salon, index) => (
            <AnimateIn key={salon.id} delay={index * 0.08} direction="up">
              <SalonCard salon={salon} />
            </AnimateIn>
          ))}
        </div>

        <AnimateIn direction="up" delay={0.4} className="mt-12 text-center">
          <Button href="/salons" variant="outline" size="lg">
            View All Salons
          </Button>
        </AnimateIn>
      </div>
    </section>
  );
}
