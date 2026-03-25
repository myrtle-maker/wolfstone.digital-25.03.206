import { useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import { Send, CheckCircle, ChevronDown } from "lucide-react";
import { z } from "zod";

const budgetOptions = [
  "Under £5,000/month",
  "£5,000–£10,000/month",
  "£10,000–£20,000/month",
  "£20,000–£50,000/month",
  "£50,000+/month",
  "Not sure yet",
];

const serviceOptions = [
  "AI Visibility / GEO",
  "SEO",
  "Digital PR",
  "Backlinks",
  "Content Strategy",
  "Social Media",
  "LLM Brand Exposure",
  "Full-service (all of the above)",
];

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  company: z.string().trim().min(1, "Company name is required").max(100),
  website: z.string().trim().max(200).optional(),
  location: z.string().trim().min(1, "Please let us know where you're based").max(100),
  budget: z.string().trim().min(1, "Please select a budget range"),
  services: z.array(z.string()).min(1, "Please select at least one service"),
  goals: z.string().trim().min(1, "Please tell us about your goals").max(2000),
});

type FormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const [form, setForm] = useState<FormData>({
    name: "", email: "", company: "", website: "", location: "",
    budget: "", services: [], goals: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const toggleService = (service: string) => {
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitted(true);
  };

  const inputClass = "w-full bg-[hsl(var(--wd-stone))] border border-white/[0.08] rounded-[12px] px-4 py-3 text-[hsl(var(--wd-navy-text))] placeholder:text-[hsl(var(--wd-navy-text))]/40 focus:outline-none focus:border-[hsl(var(--wd-blue))] focus:ring-1 focus:ring-[hsl(var(--wd-blue))]/20 transition-colors duration-200 text-body";
  const labelClass = "text-overline text-[hsl(var(--wd-navy-text))]/55 block mb-2";

  return (
    <main className="pt-20">
      <SEOHead
        title="Contact Us — Wolfstone Digital"
        description="Get in touch to discuss how we can scale your brand's digital visibility across search, AI, and beyond."
        canonical="/contact/"
      />

      <section className="bg-wd-navy wd-ambient-glow py-20 md:py-28">
        <div className="container">
          <ScrollReveal>
            <span className="text-overline text-primary mb-4 block">Get in touch</span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-display mb-6 text-white">Let's talk.</h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-wd-muted max-ch-70">
              Get in touch to discuss how we can scale your brand's digital visibility — across search, AI, and beyond.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="bg-[hsl(var(--wd-cream))] wd-texture py-20 md:py-28">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <ScrollReveal>
                <div className="space-y-6">
                  <div className="border-l-2 border-[hsl(var(--wd-blue))]/30 pl-6">
                    <h3 className="text-h3 text-[hsl(var(--wd-navy-text))] mb-1">Premium partnerships</h3>
                    <p className="text-body-sm text-[hsl(var(--wd-navy-text))]/55">£50,000+/month — full strategic control, category exclusivity, and our complete team dedicated to your brand.</p>
                  </div>
                  <div className="border-l-2 border-[hsl(var(--wd-blue))]/30 pl-6">
                    <h3 className="text-h3 text-[hsl(var(--wd-navy-text))] mb-1">Enterprise engagements</h3>
                    <p className="text-body-sm text-[hsl(var(--wd-navy-text))]/55">£20,000–£50,000/month — multi-channel strategies across SEO, GEO, PR, and content with priority execution.</p>
                  </div>
                  <div className="border-l-2 border-[hsl(var(--wd-blue))]/30 pl-6">
                    <h3 className="text-h3 text-[hsl(var(--wd-navy-text))] mb-1">Growth retainers</h3>
                    <p className="text-body-sm text-[hsl(var(--wd-navy-text))]/55">From £5,000/month — focused execution on one or two disciplines. Every engagement is bespoke.</p>
                  </div>
                  <div className="mt-8 p-5 bg-white/60 border border-[hsl(var(--wd-warm-grey))] rounded-[12px]">
                    <p className="text-body-sm text-[hsl(var(--wd-navy-text))]/70">
                      <span className="font-bold text-[hsl(var(--wd-navy-text))]">Why the questions?</span> We're selective about who we work with — it means every client gets our full strategic attention. These questions help us understand if we're the right fit before we both invest time.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            <div>
              <ScrollReveal delay={0.15}>
                {submitted ? (
                  <div className="bg-white border border-[hsl(var(--wd-warm-grey))] rounded-[12px] p-10 text-center shadow-sm">
                    <CheckCircle className="w-12 h-12 text-[hsl(var(--wd-blue))] mx-auto mb-4" />
                    <h3 className="text-h2 text-[hsl(var(--wd-navy-text))] mb-2">Application received.</h3>
                    <p className="text-body text-[hsl(var(--wd-navy-text))]/55">We review every enquiry personally. If there's a fit, we'll be in touch within 24 hours to schedule a discovery call.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="bg-white border border-[hsl(var(--wd-warm-grey))] rounded-[12px] p-8 space-y-5 shadow-sm">
                    {/* Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className={labelClass}>Name *</label>
                        <input id="name" type="text" className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                        {errors.name && <p className="text-caption text-destructive mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <label htmlFor="email" className={labelClass}>Email *</label>
                        <input id="email" type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" />
                        {errors.email && <p className="text-caption text-destructive mt-1">{errors.email}</p>}
                      </div>
                    </div>

                    {/* Company & Website */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="company" className={labelClass}>Company *</label>
                        <input id="company" type="text" className={inputClass} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Your company" />
                        {errors.company && <p className="text-caption text-destructive mt-1">{errors.company}</p>}
                      </div>
                      <div>
                        <label htmlFor="website" className={labelClass}>Website</label>
                        <input id="website" type="text" className={inputClass} value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://yoursite.com" />
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label htmlFor="location" className={labelClass}>Where are you based? *</label>
                      <input id="location" type="text" className={inputClass} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. London, UK" />
                      {errors.location && <p className="text-caption text-destructive mt-1">{errors.location}</p>}
                    </div>

                    {/* Budget */}
                    <div>
                      <label htmlFor="budget" className={labelClass}>Monthly marketing budget *</label>
                      <div className="relative">
                        <select
                          id="budget"
                          className={`${inputClass} appearance-none cursor-pointer`}
                          value={form.budget}
                          onChange={(e) => setForm({ ...form, budget: e.target.value })}
                        >
                          <option value="">Select a range</option>
                          {budgetOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--wd-navy-text))]/40 pointer-events-none" />
                      </div>
                      {errors.budget && <p className="text-caption text-destructive mt-1">{errors.budget}</p>}
                    </div>

                    {/* Services interest */}
                    <div>
                      <label className={labelClass}>What are you most interested in? *</label>
                      <div className="flex flex-wrap gap-2">
                        {serviceOptions.map(service => (
                          <button
                            key={service}
                            type="button"
                            onClick={() => toggleService(service)}
                            className={`px-3 py-2 rounded-md text-[12px] font-bold tracking-wide transition-all border ${
                              form.services.includes(service)
                                ? "bg-[hsl(var(--wd-blue))] text-white border-[hsl(var(--wd-blue))]"
                                : "bg-[hsl(var(--wd-stone))] text-[hsl(var(--wd-navy-text))]/60 border-[hsl(var(--wd-warm-grey))] hover:border-[hsl(var(--wd-blue))]/40"
                            }`}
                          >
                            {service}
                          </button>
                        ))}
                      </div>
                      {errors.services && <p className="text-caption text-destructive mt-1">{errors.services}</p>}
                    </div>

                    {/* Goals / free text */}
                    <div>
                      <label htmlFor="goals" className={labelClass}>Tell us about your goals *</label>
                      <textarea
                        id="goals"
                        rows={4}
                        className={inputClass + " resize-none"}
                        value={form.goals}
                        onChange={(e) => setForm({ ...form, goals: e.target.value })}
                        placeholder="What challenges are you facing? What does success look like for you? Any specific services or outcomes you're looking for?"
                      />
                      {errors.goals && <p className="text-caption text-destructive mt-1">{errors.goals}</p>}
                    </div>

                    <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[hsl(var(--wd-blue))] text-white text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-primary transition-colors duration-200 active:scale-[0.97]">
                      Submit enquiry <Send size={16} />
                    </button>

                    <p className="text-[10px] text-[hsl(var(--wd-navy-text))]/30 text-center">
                      We typically respond within 24 hours. Only qualified enquiries will receive a reply.
                    </p>
                  </form>
                )}
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Contact;
