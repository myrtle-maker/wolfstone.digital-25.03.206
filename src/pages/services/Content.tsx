import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import { ArrowRight } from "lucide-react";

const faqs = [
  { question: "What makes your content different?", answer: "Our content is built for both search engines and AI platforms. Every piece is SEO-optimised and GEO-optimised — structured for clarity and depth so AI platforms trust and reference it. We also have in-house editorial and production capability." },
  { question: "Do you write content for regulated industries?", answer: "Yes. We understand FCA compliance, legal advertising standards, and sector-specific restrictions. Every piece of content is reviewed for regulatory compliance before publication." },
  { question: "Do you produce video and podcast content?", answer: "Yes. Our in-house editor and producer has experience on leading UK podcasts. We deliver end-to-end content production — from strategy and scripting to filming, editing, and distribution." },
  { question: "How does content help AI visibility?", answer: "AI models cite content that is well-structured, in-depth, and authoritative. Our content strategy is specifically designed to create authoritative content that AI platforms trust and reference." },
];

const jsonLd = [
  { "@context": "https://schema.org", "@type": "Service", name: "Content Strategy & Production", provider: { "@type": "Organization", name: "Wolfstone Digital" }, description: "SEO and GEO optimised content strategy, writing, and production for enterprise brands.", areaServed: "GB" },
  { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://wolfstonedigital.co.uk/" },
    { "@type": "ListItem", position: 2, name: "Services", item: "https://wolfstonedigital.co.uk/services/" },
    { "@type": "ListItem", position: 3, name: "Content", item: "https://wolfstonedigital.co.uk/services/content/" },
  ]},
  { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) },
];

const ContentPage = () => (
  <main className="pt-20">
    <SEOHead title="SEO & GEO Content UK | AI-Optimised Content Strategy | Wolfstone Digital" description="SEO and GEO optimised content plans, strategy, and writing that ranks in search and gets cited by AI. In-house editorial and production." canonical="/services/content/" jsonLd={jsonLd} />

    <section className="bg-wd-navy py-20 md:py-28">
      <div className="container">
        <Breadcrumbs items={[{ label: "Services", path: "/services" }, { label: "Content" }]} />
        <ScrollReveal><span className="text-overline text-primary mb-4 block">Content services</span></ScrollReveal>
        <ScrollReveal delay={0.1}><h1 className="text-display max-w-[18ch] mb-6">Content built for search engines and AI</h1></ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="text-body-lg text-wd-muted max-ch-70">
            Wolfstone Digital produces content that ranks in Google and gets cited by AI platforms. Strategy-led content calendars, fully <Link to="/services/seo/" className="text-primary hover:text-accent transition-colors">SEO</Link> and <Link to="/services/geo/" className="text-primary hover:text-accent transition-colors">GEO</Link> optimised copy, in-house editorial and production capability. Every piece of content is built to drive measurable commercial outcomes.
          </p>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-wd-ice py-20 md:py-28">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <ScrollReveal><h2 className="text-h1 text-wd-navy mb-6">Content strategy</h2></ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="space-y-4">
                {["Strategy-led content calendars aligned to commercial goals", "Keyword research and topic clustering for SEO authority", "GEO-optimised content structured for clarity and depth", "Competitor content gap analysis and opportunity mapping", "Monthly performance reporting — rankings, traffic, and AI citations"].map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <ArrowRight className="w-4 h-4 text-wd-blue mt-1 shrink-0" />
                    <p className="text-body text-[#4A6080]">{item}</p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
          <div>
            <ScrollReveal delay={0.15}><h2 className="text-h1 text-wd-navy mb-6">Content production</h2></ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="space-y-4">
                {["In-house editor and producer with broadcast experience", "End-to-end social media content creation", "Podcast production — scripting, recording, editing, distribution", "Video content for brand channels and social platforms", "Compliance-reviewed copy for regulated industries"].map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <ArrowRight className="w-4 h-4 text-wd-blue mt-1 shrink-0" />
                    <p className="text-body text-[#4A6080]">{item}</p>
                  </div>
                ))}
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

export default ContentPage;
