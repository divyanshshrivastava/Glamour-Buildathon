"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import Button from "@/components/shared/Button";

export default function PartnerForm() {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Salon Name
          </label>
          <input
            type="text"
            placeholder="Your salon name"
            className="w-full px-4 py-3 rounded-lg border border-border-light bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Owner Name
          </label>
          <input
            type="text"
            placeholder="Your full name"
            className="w-full px-4 py-3 rounded-lg border border-border-light bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Email
          </label>
          <input
            type="email"
            placeholder="you@salon.com"
            className="w-full px-4 py-3 rounded-lg border border-border-light bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Phone
          </label>
          <input
            type="tel"
            placeholder="+91 98765 43210"
            className="w-full px-4 py-3 rounded-lg border border-border-light bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          City
        </label>
        <input
          type="text"
          placeholder="Which city is your salon in?"
          className="w-full px-4 py-3 rounded-lg border border-border-light bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Message (Optional)
        </label>
        <textarea
          rows={4}
          placeholder="Tell us about your salon..."
          className="w-full px-4 py-3 rounded-lg border border-border-light bg-background text-sm text-foreground outline-none focus:border-primary transition-colors resize-none"
        />
      </div>

      <Button size="lg" className="w-full rounded-xl">
        Submit Application
        <ArrowRight size={18} />
      </Button>

      <div className="flex items-start gap-2 text-xs text-muted">
        <CheckCircle2
          size={14}
          className="text-primary mt-0.5 flex-shrink-0"
        />
        <span>
          By submitting, you agree to our Terms of Service and Privacy Policy.
        </span>
      </div>
    </form>
  );
}
