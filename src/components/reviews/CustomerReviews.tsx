import { Quote } from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";
import AnimateIn from "@/components/shared/AnimateIn";
import StarRating from "@/components/shared/StarRating";
import { getTestimonials } from "@/lib/api/reviews";

export default async function CustomerReviews() {
  const reviews = await getTestimonials();

  return (
    <section id="reviews" className="section-padding">
      <div className="container-page">
        <SectionHeader
          title="What Our Customers Say"
          subtitle="Real experiences from real people. Every review is from a verified booking."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <AnimateIn key={review.id} delay={index * 0.08} direction="up">
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-border-light hover:border-primary/20 transition-all duration-300 h-full flex flex-col">
                <Quote size={20} className="text-primary/30 mb-4" />

                <p className="text-sm md:text-base text-foreground leading-relaxed flex-1">
                  &ldquo;{review.text}&rdquo;
                </p>

                <div className="mt-6 pt-4 border-t border-border-light">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">
                        {review.initials}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {review.author}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRating rating={review.rating} size={12} />
                        {review.salonName && (
                          <span className="text-xs text-muted">
                            at {review.salonName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
