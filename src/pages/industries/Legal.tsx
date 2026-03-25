import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import { ArrowRight, Search, Eye, Brain, Megaphone, Link2, FileText, MessageSquare } from "lucide-react";

const faqs = [
  { question: "Do you understand legal marketing regulations?", answer: "Yes. We understand SRA regulations, advertising standards for legal services, and the nuances of marketing in the legal sector. Every campaign is compliance-aware." },
  { question: "What types of law firms do you work with?", answer: "We work with commercial law firms, personal injury practices, family law, conveyancing, and specialist legal services. Our approach adapts to the competitive dynamics of each practice area." },
  { question: "How does AI visibility help law firms?", answer: "Consumers increasingly ask AI platforms for law firm recommendations, legal comparisons, and solicitor advice. If your firm isn't being cited in these conversations, potential clients are being directed to competitors." },
];

const jsonLd = [
  { "@context": "https://schema.org", "@type": "Service", name: "Digital Marketing for Law Firms", provider: { "@type": "Organization", name: "Wolfstone Digital" }, description: "AI SEO and GEO for law firms. SRA-compliant marketing for legal practices.", areaServed: "GB" },
  { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://wolfstonedigital.co.uk/" },
    { "@type": "ListItem", position: 2, name: "Industries", item: "https://wolfstonedigital.co.uk/industries/" },
    { "@type": "ListItem", position: 3, name: "Legal", item: "https://wolfstonedigital.co.uk/industries/legal/" },
  ]},
  { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) },
];

const services = [
  { icon: Search, title: "SEO", path: "/services/seo/" }, { icon: Eye, title: "GEO", path: "/services/geo/" }, { icon: Brain, title: "LLM brand exposure", path: "/services/llm-brand-exposure/" }, { icon: Megaphone, title: "Digital PR", path: "/services/digital-pr/" }, { icon: Link2, title: "Backlinks", path: "/services/backlinks/" }, { icon: FileText, title: "Content", path: "/services/content/" }, { icon: MessageSquare, title: "Social media", path: "/services/social-media/" },
];

const LegalPage = () => (
  <main className="pt-20">
    <SEOHead title="Digital Marketing for Law Firms UK | AI SEO for Legal | Wolfstone Digital" description="AI SEO and GEO for law firms. SRA-compliant digital marketing for legal practices. Get your firm cited by AI search platforms." canonical="/industries/legal/" jsonLd={jsonLd} />

    <section className="bg-wd-navy py-20 md:py-28">
      <div className="container">
        <Breadcrumbs items={[{ label: "Industries", path: "/services" }, { label: "Legal" }]} />
        <ScrollReveal><span className="text-overline text-primary mb-4 block">Legal industry</span></ScrollReveal>
        <ScrollReveal delay={0.1}><h1 className="text-display max-w-[18ch] mb-6">AI SEO and digital marketing for law firms</h1></ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="text-body-lg text-wd-muted max-ch-70">
            The legal sector faces unique marketing challenges: SRA compliance, competitive local markets, and an increasingly AI-driven discovery landscape. Wolfstone Digital helps law firms build organic authority, rank for high-value practice areas, and get cited by AI platforms when potential clients ask for recommendations. We combine <Link to="/services/seo/" className="text-primary hover:text-accent transition-colors">technical SEO</Link>, <Link to="/services/geo/" className="text-primary hover:text-accent transition-colors">generative engine optimisation</Link>, and <Link to="/services/digital-pr/" className="text-primary hover:text-accent transition-colors">digital PR</Link> to drive measurable client acquisition.
          </p>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-wd-ice py-20 md:py-28">
      <div className="container">
        <ScrollReveal><h2 className="text-h1 text-wd-navy mb-6">Why AI visibility matters for law firms</h2></ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="text-body-lg text-[#4A6080] max-ch-70 mb-6">
            When someone asks ChatGPT "What's the best personal injury solicitor in Manchester?" or asks Perplexity to compare conveyancing firms — your firm needs to be in that answer. AI-driven discovery is reshaping how clients find legal services. The firms that invest in <Link to="/services/llm-brand-exposure/" className="text-wd-blue font-bold hover:underline">LLM brand exposure</Link> now will dominate their markets for years.
          </p>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-wd-navy py-20 md:py-28">
      <div className="container">
        <ScrollReveal><h2 className="text-h1 mb-10">Services for law firms</h2></ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <ScrollReveal key={s.path} delay={i * 0.06}>
              <Link to={s.path} className="block bg-card border border-primary/[0.15] rounded-[12px] p-6 hover:border-primary/[0.45] transition-colors h-full">
                <s.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-h3 mb-2">{s.title}</h3>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    <FAQSection faqs={faqs} />
    <CTASection heading="Get your law firm found by AI" body="Most law firms are invisible to AI search. We change that. Book a consultation to discuss how we can grow your firm's digital visibility." />
  </main>
);

export default LegalPage;
