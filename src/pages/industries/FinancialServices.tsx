import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import { ArrowRight, Search, Eye, Brain, Megaphone, Link2, FileText, MessageSquare } from "lucide-react";

const faqs = [
  { question: "Can you work with FCA-regulated brands?", answer: "Yes. We have extensive experience with FCA-regulated brands including IG, Pepperstone, eToro, Trading 212, and Spreadex. Every campaign, piece of content, and link placement is compliance-aware." },
  { question: "Do you understand broker compliance?", answer: "We don't just understand it — we operate in it. We operate our own live comparison platform in the FCA-regulated space. We know the compliance requirements firsthand." },
  { question: "What financial services brands have you worked with?", answer: "IG (world leader in online trading), Pepperstone, eToro, Trading 212, and Spreadex. We've helped grow some of the largest brands in the financial sector." },
  { question: "How does AI visibility work for financial services?", answer: "Consumers increasingly ask AI platforms to compare brokers, recommend financial products, and research providers. If your brand isn't being cited in these conversations, you're losing potential clients to competitors who are." },
];

const services = [
  { icon: Search, title: "SEO", path: "/services/seo/", desc: "Technical audits and enterprise SEO for financial services" },
  { icon: Eye, title: "GEO", path: "/services/geo/", desc: "Get cited by AI when consumers compare financial products" },
  { icon: Brain, title: "LLM brand exposure", path: "/services/llm-brand-exposure/", desc: "Our proven methodology for financial brand visibility in AI" },
  { icon: Megaphone, title: "Digital PR", path: "/services/digital-pr/", desc: "Compliance-aware PR for regulated financial brands" },
  { icon: Link2, title: "Backlinks", path: "/services/backlinks/", desc: "Premium link placements for domain authority growth" },
  { icon: FileText, title: "Content", path: "/services/content/", desc: "FCA-compliant content strategy and production" },
  { icon: MessageSquare, title: "Social media", path: "/services/social-media/", desc: "Community engagement and Reddit brand exposure" },
];

const jsonLd = [
  { "@context": "https://schema.org", "@type": "Service", name: "AI SEO for Financial Services", provider: { "@type": "Organization", name: "Wolfstone Digital" }, description: "Specialist AI SEO and GEO for financial services. FCA-compliant marketing for brokers, fintechs and financial brands.", areaServed: "GB" },
  { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://wolfstonedigital.co.uk/" },
    { "@type": "ListItem", position: 2, name: "Industries", item: "https://wolfstonedigital.co.uk/industries/" },
    { "@type": "ListItem", position: 3, name: "Financial Services", item: "https://wolfstonedigital.co.uk/industries/financial-services/" },
  ]},
  { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) },
];

const FinancialServicesPage = () => (
  <main className="pt-20">
    <SEOHead title="AI SEO for Financial Services | Fintech & Finance Marketing | Wolfstone Digital" description="Specialist AI SEO and GEO for financial services. FCA-compliant marketing for brokers, fintechs & financial brands. Founded by financial services professionals." canonical="/industries/financial-services/" jsonLd={jsonLd} />

    <section className="bg-wd-navy wd-ambient-glow py-20 md:py-28">
      <div className="container">
        <Breadcrumbs items={[{ label: "Industries", path: "/industries/financial-services" }, { label: "Financial services" }]} />
        <ScrollReveal><span className="text-overline text-primary mb-4 block">Financial services</span></ScrollReveal>
        <ScrollReveal delay={0.1}><h1 className="text-display max-w-[18ch] mb-6">AI SEO and GEO for financial services</h1></ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="text-body-lg text-wd-muted max-ch-70">
            We founded and operate our own international finance brand competing in one of the most saturated niches online — the most AI-cited independent source amongst our competitors across every major LLM. Our background is in this industry. No one else has this proof.
          </p>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-wd-ice py-20 md:py-28">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <ScrollReveal><h2 className="text-h1 text-wd-navy mb-6">The challenge of marketing in financial services</h2></ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="text-body text-[#4A6080] mb-4">Financial services is one of the hardest sectors to market in. FCA regulations constrain messaging. Advertising standards limit creative freedom. Compliance teams slow execution. Big spenders dominate paid channels.</p>
              <p className="text-body text-[#4A6080]">The brands that win in finance are the ones that build organic authority — through SEO, content, and now AI visibility. That's where we come in.</p>
            </ScrollReveal>
          </div>
          <div>
            <ScrollReveal delay={0.15}><h2 className="text-h1 text-wd-navy mb-6">Why generic providers fail in finance</h2></ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="text-body text-[#4A6080] mb-4">Generic marketing providers don't understand compliance. They don't know what FCA regulations mean for content. They don't understand risk warnings, financial promotions rules, or the nuances of broker marketing.</p>
              <p className="text-body text-[#4A6080] font-bold">We do — because we've operated in the space, not just advised on it.</p>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>

    <section className="bg-wd-navy wd-ambient-glow py-20 md:py-28">
      <div className="container">
        <ScrollReveal><h2 className="text-h1 mb-6">Our financial services experience</h2></ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="text-body-lg text-wd-muted max-ch-70 mb-8">We've worked with the biggest names in UK financial services:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["IG — World leader in online trading", "Pepperstone — Global forex and CFD broker", "eToro — Social trading and multi-asset platform", "Trading 212 — Commission-free investing platform", "Spreadex — Financial and sports spread betting"].map((client, i) => (
              <div key={i} className="flex gap-3 items-center">
                <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                <p className="text-body text-wd-muted">{client}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-wd-midnight py-20 md:py-28">
      <div className="container">
        <ScrollReveal><h2 className="text-h1 mb-6">Our own finance brand: competing at the top</h2></ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="text-body-lg text-wd-muted max-ch-70 mb-10">We don't just advise — we compete. We founded and operate an international finance brand in one of the most competitive niches on the internet.</p>
        </ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
          {[
            { value: "#1", label: "Most AI-cited independent source" },
            { value: "900+", label: "Clients delivered" },
            { value: "100x", label: "Outperforming bigger budgets" },
            { value: "5", label: "AI platforms citing us" },
            { value: "0", label: "Paid placements" },
          ].map((s, i) => (
            <ScrollReveal key={i} delay={i * 0.06}>
              <div className="wd-glow-card p-5 text-center">
                <div className="text-[clamp(1.5rem,2.5vw,2rem)] font-black leading-none text-accent mb-2">{s.value}</div>
                <div className="text-overline text-wd-muted">{s.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal delay={0.3}>
          <Link to="/contact" className="text-primary hover:text-accent transition-colors text-body font-bold">Book a consultation to learn more →</Link>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-wd-navy wd-ambient-glow py-20 md:py-28">
      <div className="container">
        <ScrollReveal><h2 className="text-h1 mb-10">Services for financial brands</h2></ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <ScrollReveal key={s.path} delay={i * 0.06}>
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
    <CTASection heading="Ready to grow your financial brand?" body="We've helped IG, Pepperstone, eToro, Trading 212, and Spreadex. Let's do the same for you." />
  </main>
);

export default FinancialServicesPage;
