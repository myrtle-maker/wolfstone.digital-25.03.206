import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import { Search, Eye, Brain, Megaphone, Link2, FileText, MessageSquare } from "lucide-react";

const faqs = [
  { question: "What leisure businesses do you work with?", answer: "Hotels, restaurants, travel companies, entertainment venues, sports brands, and hospitality groups. Our approach adapts to the competitive dynamics and seasonal patterns of each leisure sub-sector." },
  { question: "How does AI visibility help leisure brands?", answer: "Consumers ask AI for travel recommendations, restaurant suggestions, hotel comparisons, and activity ideas. AI-powered discovery is replacing traditional travel search for a growing number of consumers." },
  { question: "Do you handle seasonal marketing?", answer: "Yes. Leisure businesses have distinct seasonal patterns. Our strategy accounts for peak booking periods, event-driven demand, and off-peak optimisation opportunities." },
];

const jsonLd = [
  { "@context": "https://schema.org", "@type": "Service", name: "Digital Marketing for Leisure Industry", provider: { "@type": "Organization", name: "Wolfstone Digital" }, description: "AI SEO and digital marketing for leisure, hospitality, and travel brands.", areaServed: "GB" },
  { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://wolfstonedigital.co.uk/" },
    { "@type": "ListItem", position: 2, name: "Industries", item: "https://wolfstonedigital.co.uk/industries/" },
    { "@type": "ListItem", position: 3, name: "Leisure", item: "https://wolfstonedigital.co.uk/industries/leisure/" },
  ]},
  { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) },
];

const services = [
  { icon: Search, title: "SEO", path: "/services/seo/" }, { icon: Eye, title: "GEO", path: "/services/geo/" }, { icon: Brain, title: "LLM brand exposure", path: "/services/llm-brand-exposure/" }, { icon: Megaphone, title: "Digital PR", path: "/services/digital-pr/" }, { icon: Link2, title: "Backlinks", path: "/services/backlinks/" }, { icon: FileText, title: "Content", path: "/services/content/" }, { icon: MessageSquare, title: "Social media", path: "/services/social-media/" },
];

const LeisurePage = () => (
  <main className="pt-20">
    <SEOHead title="Digital Marketing for Leisure Industry UK | AI SEO | Wolfstone Digital" description="AI SEO and digital marketing for leisure, hospitality, and travel brands. Get recommended by AI when consumers plan trips, dining, and experiences." canonical="/industries/leisure/" jsonLd={jsonLd} />

    <section className="bg-wd-navy wd-ambient-glow py-20 md:py-28">
      <div className="container">
        <Breadcrumbs items={[{ label: "Industries", path: "/services" }, { label: "Leisure" }]} />
        <ScrollReveal><span className="text-overline text-primary mb-4 block">Leisure industry</span></ScrollReveal>
        <ScrollReveal delay={0.1}><h1 className="text-display max-w-[18ch] mb-6">Digital marketing for leisure and hospitality brands</h1></ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="text-body-lg text-wd-muted max-ch-70">
            The leisure industry is being transformed by AI-driven discovery. Consumers ask ChatGPT for hotel recommendations, restaurant suggestions, and travel plans. Wolfstone Digital helps leisure brands build the organic authority and AI visibility needed to capture this demand. We combine <Link to="/services/seo/" className="text-primary hover:text-accent transition-colors">SEO</Link>, <Link to="/services/geo/" className="text-primary hover:text-accent transition-colors">GEO</Link>, <Link to="/services/content/" className="text-primary hover:text-accent transition-colors">content</Link>, and <Link to="/services/social-media/" className="text-primary hover:text-accent transition-colors">social media</Link> to drive bookings and revenue.
          </p>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-wd-ice py-20 md:py-28">
      <div className="container">
        <ScrollReveal><h2 className="text-h1 text-foreground mb-6">AI is reshaping leisure discovery</h2></ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="text-body-lg text-muted-foreground max-ch-70 mb-6">"What are the best restaurants in Edinburgh?" "Recommend a spa hotel in the Cotswolds." "Where should I go for a stag do in the UK?" — these are real queries consumers ask AI every day. The brands that appear in AI-generated answers capture demand at the highest-intent moment.</p>
          <p className="text-body text-muted-foreground max-ch-70">Our <Link to="/services/llm-brand-exposure/" className="text-wd-blue font-bold hover:underline">LLM brand exposure methodology</Link> gets leisure brands into these conversations.</p>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-wd-navy wd-ambient-glow py-20 md:py-28">
      <div className="container">
        <ScrollReveal><h2 className="text-h1 mb-10">Services for leisure brands</h2></ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <ScrollReveal key={s.path} delay={i * 0.06}>
              <Link to={s.path} className="block wd-glow-card p-6 transition-colors h-full">
                <s.icon className="w-8 h-8 text-primary mb-4" /><h3 className="text-h3 mb-2">{s.title}</h3>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    <FAQSection faqs={faqs} />
    <CTASection heading="Get your leisure brand recommended by AI" body="When consumers ask AI where to go, eat, stay, or play — make sure your brand is the answer." />
  </main>
);

export default LeisurePage;
