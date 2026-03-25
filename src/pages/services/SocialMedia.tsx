import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import { ArrowRight } from "lucide-react";

const faqs = [
  { question: "How does social media help AI visibility?", answer: "Domains with significant Reddit and forum mentions have 4x higher AI citation rates. Social signals and community presence are increasingly important for LLM indexing and brand recommendation." },
  { question: "Do you manage Reddit presence?", answer: "Yes. Reddit is one of the most powerful platforms for building AI visibility. We manage genuine community engagement, brand exposure, and thought leadership across relevant subreddits." },
  { question: "What social platforms do you cover?", answer: "We cover LinkedIn, X (Twitter), Instagram, Reddit, and relevant industry forums. Platform selection is based on where your target audience is most active and where AI citation signals are strongest." },
  { question: "Do you create all content in-house?", answer: "Yes. Our in-house editor and producer handles end-to-end social content creation — from strategy and scripting to production and distribution. No outsourcing, no generic templates." },
];

const jsonLd = [
  { "@context": "https://schema.org", "@type": "Service", name: "Social Media & Community Marketing", provider: { "@type": "Organization", name: "Wolfstone Digital" }, description: "End-to-end social content creation, Reddit and forum brand exposure for enterprise brands.", areaServed: "GB" },
  { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://wolfstonedigital.co.uk/" },
    { "@type": "ListItem", position: 2, name: "Services", item: "https://wolfstonedigital.co.uk/services/" },
    { "@type": "ListItem", position: 3, name: "Social Media", item: "https://wolfstonedigital.co.uk/services/social-media/" },
  ]},
  { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) },
];

const SocialMediaPage = () => (
  <main className="pt-20">
    <SEOHead title="Social Media & Community Marketing | Reddit & Forum Exposure | Wolfstone Digital" description="End-to-end social content creation, Reddit and forum brand exposure. Domains with Reddit mentions have 4x higher AI citation rates." canonical="/services/social-media/" jsonLd={jsonLd} />

    <section className="bg-wd-navy py-20 md:py-28">
      <div className="container">
        <Breadcrumbs items={[{ label: "Services", path: "/services" }, { label: "Social media" }]} />
        <ScrollReveal><span className="text-overline text-primary mb-4 block">Social media & community</span></ScrollReveal>
        <ScrollReveal delay={0.1}><h1 className="text-display max-w-[18ch] mb-6">Social media and community brand exposure</h1></ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="text-body-lg text-wd-muted max-ch-70">
            End-to-end social content creation, Reddit and forum brand exposure. Domains with millions of Reddit mentions have 4x higher AI citation rates — social isn't just engagement, it's a <Link to="/services/geo/" className="text-primary hover:text-accent transition-colors">GEO signal</Link>. We build genuine community presence that drives both brand awareness and <Link to="/services/llm-brand-exposure/" className="text-primary hover:text-accent transition-colors">LLM brand exposure</Link>.
          </p>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-wd-ice py-20 md:py-28">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <ScrollReveal><h2 className="text-h1 text-wd-navy mb-6">Social content creation</h2></ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="space-y-4">
                {["End-to-end social content strategy and production", "Platform-specific content for LinkedIn, X, Instagram", "Video and podcast content with in-house production", "Brand voice development and content guidelines", "Performance reporting and optimisation"].map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <ArrowRight className="w-4 h-4 text-wd-blue mt-1 shrink-0" />
                    <p className="text-body text-[#4A6080]">{item}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
          <div>
            <ScrollReveal delay={0.15}><h2 className="text-h1 text-wd-navy mb-6">Reddit & community exposure</h2></ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="text-body text-[#4A6080] mb-4">Reddit is one of the most powerful platforms for building AI visibility. Domains mentioned across Reddit have significantly higher AI citation rates — it's a direct signal to LLMs.</p>
              <p className="text-body text-[#4A6080]">We build genuine community presence through thought leadership, valuable contributions, and strategic brand exposure across relevant subreddits and forums.</p>
              <div className="bg-white border border-wd-navy/[0.06] rounded-[12px] p-5 text-center shadow-sm mt-6">
                <div className="text-[2.5rem] font-black leading-none text-wd-blue mb-2">4x</div>
                <div className="text-overline text-[#4A6080]">Higher AI citation rate for domains with Reddit mentions</div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>

    <FAQSection faqs={faqs} />
    <CTASection />
  </main>
);

export default SocialMediaPage;
