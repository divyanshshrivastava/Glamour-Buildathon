import Hero from "@/components/hero/Hero";
import FeaturedSalons from "@/components/salons/FeaturedSalons";
import PopularServices from "@/components/services/PopularServices";
import HowItWorks from "@/components/how-it-works/HowItWorks";
import WhyChooseUs from "@/components/why-choose-us/WhyChooseUs";
import CustomerReviews from "@/components/reviews/CustomerReviews";
import PartnerCTA from "@/components/partner/PartnerCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedSalons />
      <PopularServices />
      <HowItWorks />
      <WhyChooseUs />
      <CustomerReviews />
      <PartnerCTA />
    </>
  );
}
