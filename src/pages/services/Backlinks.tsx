import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import { ArrowRight } from "lucide-react";

const faqs = [
  { question: "What makes your backlinks different?", answer: "We have access to a market-leading link inventory with premium placements that competitors can't access. Every link is from a genuine, high-authority domain — no PBNs, no low-quality directories, no risk to your brand." },
  { question: "How much do backlinks cost?", answer: "Link acquisition is included as part of our retainer engagements starting from £5,000/month. The cost per link varies based on the authority of the placement — we prioritise quality over volume." },
  { question: "Can backlinks hurt my site?", answer: "Low-quality links can. Ours don't. We only place links on genuine, high-authority domains with real editorial standards. Every placement is vetted for quality, relevance, and compliance." },
  { question: "How do backlinks help AI visibility?", answer: "Backlinks build domain authority, which is one of the key signals LLMs use to determine which brands to cite. High-authority domains are more likely to be crawled, indexed, and referenced by AI platforms." },
];

const jsonLd = [
  { "@context": "https://schema.org", "@type": "Service", name: "Backlink Acquisition", provider: { "@type": "Organization", name: "Wolfstone Digital" }, description: "Market-leading backlink inventory with premium placements for enterprise brands.", areaServed: "GB" },
  { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://wolfstonedigital.co.uk/" },
    { "@type": "ListItem", position: 2, name: "Services", item: "https://wolfstonedigital.co.uk/services/" },
    { "@type": "ListItem", position: 3, name: "Backlinks", item: "https://wolfstonedigital.co.uk/services/backlinks/" },
  ]},
  { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) },
];

const BacklinksPage = () => (
  <main className="pt-20">
    <SEOHead title="Premium Link Building UK | Backlink Acquisition | Wolfstone Digital" description="Market-leading backlink inventory with premium placements competitors can't access. High-quality link building for enterprise brands." canonical="/services/backlinks/" jsonLd={jsonLd} />

    <section className="bg-wd-navy wd-ambient-glow py-20 md:py-28">
      <div className="container">
        <Breadcrumbs items={[{ label: "Services", path: "/services" }, { label: "Backlinks" }]} />
        <ScrollReveal><span className="text-overline text-primary mb-4 block">Backlink acquisition</span></ScrollReveal>
        <ScrollReveal delay={0.1}><h1 className="text-display max-w-[18ch] mb-6">Premium backlink acquisition for enterprise brands</h1></ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="text-body-lg text-wd-muted max-ch-70">
            Wolfstone Digital has access to a market-leading backlink inventory with the highest quality placements available. We've built our own finance brand into the most AI-cited independent source in its sector, with thousands of backlinks and referring domains. Premium placements that competitors can't access — because we control the supply chain.
          </p>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-wd-ice py-20 md:py-28">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <ScrollReveal><h2 className="text-h1 text-wd-navy mb-6">Why our link inventory is different</h2></ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="space-y-4">
                {["Market-leading link sellers with exclusive access to premium domains", "Every placement is genuine, high-authority editorial coverage", "Strict quality control — no PBNs, no link farms, no risk to your brand", "Cross-referenced with <a href='/services/digital-pr/' class='text-wd-blue font-bold hover:underline'>digital PR</a> for maximum authority building", "Placements competitors can't access because we control the supply chain"].map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <ArrowRight className="w-4 h-4 text-wd-blue mt-1 shrink-0" />
                    <p className="text-body text-[#4A6080]" dangerouslySetInnerHTML={{ __html: item }} />
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
          <div>
            <ScrollReveal delay={0.15}>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: "#1", label: "Most AI-cited independent source" },
                  { value: "900+", label: "Clients delivered" },
                  { value: "100x", label: "Outperforming bigger budgets" },
                  { value: "5", label: "AI platforms citing us" },
                ].map((s) => (
                  <div key={s.label} className="bg-white border border-wd-navy/[0.06] rounded-[12px] p-5 text-center shadow-sm">
                    <div className="text-[clamp(1.5rem,3vw,2rem)] font-black leading-none text-wd-blue mb-2">{s.value}</div>
                    <div className="text-overline text-[#4A6080]">{s.label}</div>
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

export default BacklinksPage;
