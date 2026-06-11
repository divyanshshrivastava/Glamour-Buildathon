"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Button from "@/components/shared/Button";
import { submitPartnerApplication } from "@/lib/api/partners";

export default function PartnerForm() {
  const [salonName, setSalonName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!salonName.trim() || !ownerName.trim() || !email.trim() || !phone.trim() || !city.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitPartnerApplication({
        salonName,
        ownerName,
        email,
        phone,
        city,
        message: message.trim() || undefined,
      });

      setSuccess(true);
      // Reset form
      setSalonName("");
      setOwnerName("");
      setEmail("");
      setPhone("");
      setCity("");
      setMessage("");
    } catch (err: any) {
      console.error("Partner application failed:", err);
      const msg = err.message || "Something went wrong. Please try again later.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 p-8 rounded-xl border border-green-100 text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-xl font-bold text-green-800">Application Submitted!</h3>
        <p className="text-green-700 max-w-md mx-auto">
          Thank you for your interest in joining Glamour. We have received your application and will review it shortly. Keep an eye on your email for updates!
        </p>
        <Button 
          variant="outline" 
          onClick={() => setSuccess(false)}
          className="mt-4"
        >
          Submit Another Application
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 flex items-start gap-3">
          <AlertCircle className="mt-0.5 flex-shrink-0" size={18} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Salon Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={salonName}
            onChange={(e) => setSalonName(e.target.value)}
            placeholder="Your salon name"
            className="w-full px-4 py-3 rounded-lg border border-border-light bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Owner Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="Your full name"
            className="w-full px-4 py-3 rounded-lg border border-border-light bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@salon.com"
            className="w-full px-4 py-3 rounded-lg border border-border-light bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full px-4 py-3 rounded-lg border border-border-light bg-background text-sm text-foreground outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          City <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
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
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your salon..."
          className="w-full px-4 py-3 rounded-lg border border-border-light bg-background text-sm text-foreground outline-none focus:border-primary transition-colors resize-none"
        />
      </div>

      <Button size="lg" className="w-full rounded-xl" disabled={isSubmitting}>
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin" />
            Submitting...
          </span>
        ) : (
          <>
            Submit Application
            <ArrowRight size={18} />
          </>
        )}
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
