import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import { Megaphone, ArrowRight, Link2, FileText } from "lucide-react";

const faqs = [
  { question: "What does a digital PR consultancy do?", answer: "We secure earned media coverage, build brand authority through strategic press placements, and create campaigns that generate high-quality backlinks. Our PR drives both brand awareness and measurable SEO results." },
  { question: "How does digital PR help SEO?", answer: "Every earned media placement is a high-authority backlink. Digital PR builds domain authority faster than any other link building method and creates the entity signals that AI platforms use to cite brands." },
  { question: "Do you work with regulated industries?", answer: "Yes. We have PR specialists experienced in financial services, legal, and other regulated sectors. Every placement is compliance-aware." },
  { question: "How quickly can you scale PR campaigns?", answer: "We can build dedicated PR teams rapidly. We've scaled from single-campaign engagements to full-service retainers within weeks." },
];

const jsonLd = [
  { "@context": "https://schema.org", "@type": "Service", name: "Digital PR", provider: { "@type": "Organization", name: "Wolfstone Digital" }, description: "Strategic digital PR for enterprise brands. Earned media, authority building and scalable PR.", areaServed: "GB" },
  { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://wolfstonedigital.co.uk/" },
    { "@type": "ListItem", position: 2, name: "Services", item: "https://wolfstonedigital.co.uk/services/" },
    { "@type": "ListItem", position: 3, name: "Digital PR", item: "https://wolfstonedigital.co.uk/services/digital-pr/" },
  ]},
  { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) },
];

const DigitalPRPage = () => (
  <main className="pt-20">
    <SEOHead title="Digital PR UK | Earned Media & Brand Authority | Wolfstone Digital" description="Strategic digital PR for enterprise brands. Earned media, authority building & scalable PR. Built for regulated industries." canonical="/services/digital-pr/" jsonLd={jsonLd} />

    <section className="bg-wd-navy wd-ambient-glow py-20 md:py-28">
      <div className="container">
        <Breadcrumbs items={[{ label: "Services", path: "/services" }, { label: "Digital PR" }]} />
        <ScrollReveal><span className="text-overline text-primary mb-4 block">Digital PR</span></ScrollReveal>
        <ScrollReveal delay={0.1}><h1 className="text-display max-w-[18ch] mb-6">Digital PR that builds authority and drives revenue</h1></ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="text-body-lg text-wd-muted max-ch-70">
            Wolfstone Digital delivers strategic digital PR for enterprise brands operating in competitive, regulated markets. We provide scalable PR campaigns, earned media placements, and brand authority building that drives both <Link to="/services/seo/" className="text-primary hover:text-accent transition-colors">SEO results</Link> and <Link to="/services/llm-brand-exposure/" className="text-primary hover:text-accent transition-colors">LLM brand exposure</Link>.
          </p>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-wd-ice py-20 md:py-28">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <ScrollReveal><h2 className="text-h1 text-wd-navy mb-6">PR campaigns that deliver measurable results</h2></ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="text-body text-[#4A6080] mb-4">Every PR campaign we run is designed to achieve three things: build brand authority, generate high-quality backlinks, and increase your AI citation rate. We don't do vanity coverage — every placement must drive commercial value.</p>
              <p className="text-body text-[#4A6080]">We have the ability to scale rapidly — building dedicated teams for client campaigns without compromising on sector expertise or compliance awareness.</p>
            </ScrollReveal>
          </div>
          <div>
            <ScrollReveal delay={0.15}><h2 className="text-h1 text-wd-navy mb-6">What we deliver</h2></ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="space-y-4">
                {["Earned media campaigns in tier 1 and sector-specific publications", "Brand authority building through thought leadership and expert commentary", "High-authority link acquisition through genuine editorial coverage", "Scalable PR — dedicated teams built rapidly", "Compliance-aware campaigns for regulated industries"].map((item, i) => (
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

    <section className="bg-wd-midnight py-16 md:py-20">
      <div className="container">
        <ScrollReveal><h2 className="text-h1 mb-8">Related services</h2></ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Link2, title: "Backlink acquisition", path: "/services/backlinks/", desc: "Premium placements that complement PR-earned links." },
            { icon: FileText, title: "Content strategy", path: "/services/content/", desc: "SEO & GEO content to amplify PR coverage." },
            { icon: Megaphone, title: "Social media & community", path: "/services/social-media/", desc: "Amplify PR campaigns across social channels." },
          ].map((s, i) => (
            <ScrollReveal key={s.path} delay={i * 0.07}>
              <Link to={s.path} className="block wd-glow-card p-6 transition-colors h-full group">
                <s.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-h3 mb-2">{s.title}</h3>
                <p className="text-body-sm text-wd-muted">{s.desc}</p>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    <FAQSection faqs={faqs} />
    <CTASection />
  </main>
);

export default DigitalPRPage;
