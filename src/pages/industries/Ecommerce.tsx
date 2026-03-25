import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import { Search, Eye, Brain, Megaphone, Link2, FileText, MessageSquare } from "lucide-react";

const faqs = [
  { question: "How does AI visibility help ecommerce brands?", answer: "Consumers are increasingly asking AI platforms for product recommendations, comparisons, and reviews. If your brand isn't being cited when someone asks 'What's the best [product]?', you're losing sales to competitors who are." },
  { question: "Can you work with large ecommerce catalogues?", answer: "Yes. We handle technical SEO for sites with thousands of product pages, optimising crawlability, site architecture, and content strategy at scale." },
  { question: "Do you offer category exclusivity for ecommerce?", answer: "For premium engagements at £20,000+/month, we offer category exclusivity — meaning we won't work with your direct competitors." },
];

const jsonLd = [
  { "@context": "https://schema.org", "@type": "Service", name: "AI SEO for Ecommerce", provider: { "@type": "Organization", name: "Wolfstone Digital" }, description: "AI SEO and GEO for ecommerce brands. Get your products cited and recommended by AI platforms.", areaServed: "GB" },
  { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://wolfstonedigital.co.uk/" },
    { "@type": "ListItem", position: 2, name: "Industries", item: "https://wolfstonedigital.co.uk/industries/" },
    { "@type": "ListItem", position: 3, name: "Ecommerce", item: "https://wolfstonedigital.co.uk/industries/ecommerce/" },
  ]},
  { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) },
];

const services = [
  { icon: Search, title: "SEO", path: "/services/seo/" }, { icon: Eye, title: "GEO", path: "/services/geo/" }, { icon: Brain, title: "LLM brand exposure", path: "/services/llm-brand-exposure/" }, { icon: Megaphone, title: "Digital PR", path: "/services/digital-pr/" }, { icon: Link2, title: "Backlinks", path: "/services/backlinks/" }, { icon: FileText, title: "Content", path: "/services/content/" }, { icon: MessageSquare, title: "Social media", path: "/services/social-media/" },
];

const EcommercePage = () => (
  <main className="pt-20">
    <SEOHead title="AI SEO for Ecommerce UK | GEO for Online Retail | Wolfstone Digital" description="AI SEO and GEO for ecommerce brands. Get your products recommended by ChatGPT, Gemini, and AI search platforms. Enterprise-grade delivery." canonical="/industries/ecommerce/" jsonLd={jsonLd} />

    <section className="bg-wd-navy py-20 md:py-28">
      <div className="container">
        <Breadcrumbs items={[{ label: "Industries", path: "/services" }, { label: "Ecommerce" }]} />
        <ScrollReveal><span className="text-overline text-primary mb-4 block">Ecommerce</span></ScrollReveal>
        <ScrollReveal delay={0.1}><h1 className="text-display max-w-[18ch] mb-6">AI SEO and GEO for ecommerce brands</h1></ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="text-body-lg text-wd-muted max-ch-70">
            Ecommerce is being reshaped by AI discovery. When consumers ask ChatGPT "What's the best [product]?" or use Perplexity to compare brands, they trust AI recommendations over traditional search results. Wolfstone Digital helps ecommerce brands build the organic authority and AI visibility needed to win in this new landscape. We combine <Link to="/services/seo/" className="text-primary hover:text-accent transition-colors">enterprise SEO</Link> with <Link to="/services/geo/" className="text-primary hover:text-accent transition-colors">generative engine optimisation</Link> to drive product discovery through both channels.
          </p>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-wd-ice py-20 md:py-28">
      <div className="container">
        <ScrollReveal><h2 className="text-h1 text-wd-navy mb-6">The ecommerce AI opportunity</h2></ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="text-body-lg text-[#4A6080] max-ch-70 mb-6">
            Product recommendation queries are among the fastest-growing AI use cases. Consumers are asking LLMs to compare products, suggest alternatives, and validate purchases. The brands that appear in these AI-generated answers capture demand at the highest-intent moment — the point of decision.
          </p>
          <p className="text-body text-[#4A6080] max-ch-70">
            Our <Link to="/services/llm-brand-exposure/" className="text-wd-blue font-bold hover:underline">LLM brand exposure methodology</Link> — proven by making our own finance brand the most AI-cited independent source amongst our competitors — applies directly to ecommerce product visibility.
          </p>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-wd-navy py-20 md:py-28">
      <div className="container">
        <ScrollReveal><h2 className="text-h1 mb-10">Services for ecommerce brands</h2></ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <ScrollReveal key={s.path} delay={i * 0.06}>
              <Link to={s.path} className="block bg-card border border-primary/[0.15] rounded-[12px] p-6 hover:border-primary/[0.45] transition-colors h-full">
                <s.icon className="w-8 h-8 text-primary mb-4" /><h3 className="text-h3 mb-2">{s.title}</h3>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    <FAQSection faqs={faqs} />
    <CTASection heading="Get your products recommended by AI" body="Consumers are asking AI what to buy. Make sure your brand is the answer." />
  </main>
);

export default EcommercePage;
