import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import { ArrowRight, Search, FileText, Link2, Eye, Shield } from "lucide-react";

const auditSteps = [
  { num: "01", title: "Crawlability audit", desc: "Ensuring search engines — and AI crawlers — can find, crawl, and index all valuable content on your site. We identify orphan pages, crawl traps, and indexation gaps." },
  { num: "02", title: "On-page optimisation", desc: "Metadata optimisation, site structure, internal linking architecture, keyword targeting. Every page built to rank and to be cited by AI." },
  { num: "03", title: "Off-page SEO & link building", desc: "Backlink profile analysis, domain authority growth, competitor gap analysis. Cross-referenced with our market-leading link inventory." },
  { num: "04", title: "Content plan", desc: "Strategy-led content calendars with fully SEO and GEO optimised copy. Every piece built to rank in traditional search and be cited by AI." },
  { num: "05", title: "GEO readiness assessment", desc: "Audit of how your brand currently appears in AI-generated answers. Citation analysis across ChatGPT, Gemini, Perplexity, Copilot, and Claude." },
];

const faqs = [
  { question: "How much does an AI SEO audit cost?", answer: "Our comprehensive AI SEO audits are included as part of retainer engagements starting from £5,000/month. The audit forms the foundation of your strategy and covers technical SEO, on-page, off-page, and GEO readiness." },
  { question: "How long does it take to see SEO results?", answer: "Most clients see measurable improvements within 3–6 months. AI citation improvements can appear faster — within weeks — as LLM crawlers re-index optimised content. We provide monthly reporting from day one." },
  { question: "What's the difference between traditional SEO and AI SEO?", answer: "Traditional SEO optimises for Google's ranking algorithm. AI SEO also optimises for LLM crawlers and citation engines — ensuring your brand is cited by ChatGPT, Gemini, and other AI platforms. We do both." },
  { question: "Do you work with regulated industries?", answer: "Yes. We specialise in highly regulated sectors including financial services, legal, and healthcare. We understand FCA compliance, advertising standards, and sector-specific restrictions." },
  { question: "Can you audit our existing SEO provider's work?", answer: "Absolutely. We regularly audit work done by other providers and offer an honest assessment of what's working, what's not, and what's missing — particularly around AI search readiness." },
];

const jsonLd = [
  { "@context": "https://schema.org", "@type": "Service", name: "AI SEO Services", provider: { "@type": "Organization", name: "Wolfstone Digital" }, description: "Technical SEO audits, on-page optimisation, off-page strategy and AI search readiness for enterprise brands.", areaServed: "GB" },
  { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://wolfstonedigital.co.uk/" },
    { "@type": "ListItem", position: 2, name: "Services", item: "https://wolfstonedigital.co.uk/services/" },
    { "@type": "ListItem", position: 3, name: "SEO", item: "https://wolfstonedigital.co.uk/services/seo/" },
  ]},
  { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) },
  { "@context": "https://schema.org", "@type": "HowTo", name: "AI SEO Audit Process", step: auditSteps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.desc })) },
];

const SEOPage = () => (
  <main className="pt-20">
    <SEOHead title="AI SEO Consultancy UK | Technical Audits & Enterprise SEO | Wolfstone Digital" description="Technical SEO audits, on-page optimisation, off-page strategy & AI search readiness. Built for regulated industries. Free audit available." canonical="/services/seo/" jsonLd={jsonLd} />

    <section className="bg-wd-navy wd-ambient-glow py-20 md:py-28">
      <div className="container">
        <Breadcrumbs items={[{ label: "Services", path: "/services" }, { label: "SEO" }]} />
        <ScrollReveal><span className="text-overline text-primary mb-4 block">SEO services</span></ScrollReveal>
        <ScrollReveal delay={0.1}><h1 className="text-display max-w-[18ch] mb-6">AI-ready SEO for enterprise brands</h1></ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="text-body-lg text-wd-muted max-ch-70 mb-6">
            Wolfstone Digital delivers technical SEO audits, on-page optimisation, and off-page strategy built for both Google rankings and AI citation. Our own finance brand is the most AI-cited independent source amongst our competitors — we know what works because we do it ourselves in one of the most competitive regulated markets online.
          </p>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-wd-ice py-20 md:py-28">
      <div className="container">
        <ScrollReveal><h2 className="text-h1 text-wd-navy mb-6">What AI SEO means in 2026</h2></ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="text-body-lg text-[#4A6080] max-ch-70 mb-4">
            60%+ of Google searches now show AI Overviews. 900 million weekly ChatGPT users ask AI for recommendations instead of scrolling search results. Traditional SEO alone isn't enough — your content needs to be structured for both search engine crawlers and LLM extractors.
          </p>
          <p className="text-body text-[#4A6080] max-ch-70">
            AI SEO combines technical optimisation with <Link to="/services/geo/" className="text-wd-blue font-bold hover:underline">generative engine optimisation (GEO)</Link> to ensure your brand ranks in traditional search and gets cited by AI platforms. It's the difference between being found and being recommended.
          </p>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-wd-navy wd-ambient-glow py-20 md:py-28">
      <div className="container">
        <ScrollReveal><span className="text-overline text-primary mb-4 block">Our process</span><h2 className="text-h1 mb-12">Our technical SEO audit process</h2></ScrollReveal>
        <div className="space-y-6">
          {auditSteps.map((step, i) => (
            <ScrollReveal key={step.num} delay={i * 0.07}>
              <div className="wd-glow-card p-6 md:p-8 transition-colors duration-200 flex gap-6 items-start">
                <span className="text-[2.5rem] font-black text-primary/20 leading-none shrink-0">{step.num}</span>
                <div><h3 className="text-h3 mb-2">{step.title}</h3><p className="text-body text-wd-muted">{step.desc}</p></div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-wd-midnight py-20 md:py-28">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <ScrollReveal><h2 className="text-h1 mb-6">SEO for regulated industries</h2></ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="text-body text-wd-muted mb-6">
                Generic SEO providers don't understand compliance frameworks, FCA regulations, or the nuances of marketing in <Link to="/industries/financial-services/" className="text-primary hover:text-accent transition-colors">financial services</Link>, <Link to="/industries/legal/" className="text-primary hover:text-accent transition-colors">legal</Link>, or other regulated sectors. We do — because we've operated in them.
              </p>
              <p className="text-body text-wd-muted">Every piece of content, every link placement, every technical change is made with compliance in mind. No shortcuts. No risk to your brand.</p>
            </ScrollReveal>
          </div>
          <div>
            <ScrollReveal delay={0.15}>
              <h2 className="text-h1 mb-6">Results</h2>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: "900+", label: "Clients delivered" },
                  { value: "#1", label: "Most AI-cited independent source" },
                  { value: "100x", label: "Outperforming bigger budgets" },
                  { value: "5", label: "AI platforms citing us" },
                ].map((s) => (
                  <div key={s.label} className="wd-glow-card p-5 text-center">
                    <div className="text-[clamp(1.75rem,3vw,2.5rem)] font-black leading-none text-accent mb-2">{s.value}</div>
                    <div className="text-overline text-wd-muted">{s.label}</div>
                  </div>
                ))}
              </div>
              <p className="text-body-sm text-wd-muted mt-4">
                Results from our own international finance brand — founded, owned, and operated by the Wolfstone team.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>

    <section className="bg-wd-ice py-16 md:py-20">
      <div className="container">
        <ScrollReveal><h2 className="text-h1 text-wd-navy mb-8">Related services</h2></ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Eye, title: "Generative engine optimisation", path: "/services/geo/", desc: "Get cited by AI platforms — not just ranked on Google." },
            { icon: Link2, title: "Backlink acquisition", path: "/services/backlinks/", desc: "Market-leading link inventory with premium placements." },
            { icon: FileText, title: "Content strategy", path: "/services/content/", desc: "SEO & GEO optimised content that ranks and converts." },
          ].map((s, i) => (
            <ScrollReveal key={s.path} delay={i * 0.07}>
              <Link to={s.path} className="block bg-white border border-wd-navy/[0.06] rounded-[12px] p-6 hover:border-wd-blue/30 transition-colors duration-200 h-full shadow-sm group">
                <s.icon className="w-8 h-8 text-wd-blue mb-4" />
                <h3 className="text-h3 text-wd-navy mb-2 group-hover:text-wd-blue transition-colors">{s.title}</h3>
                <p className="text-body-sm text-[#4A6080]">{s.desc}</p>
                <span className="text-body-sm text-wd-blue font-bold mt-3 inline-flex items-center gap-1">Learn more <ArrowRight size={14} /></span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    <FAQSection faqs={faqs} />
    <CTASection heading="Get a free AI SEO audit" body="Find out how your brand performs across search engines and AI platforms. We'll identify every gap and build a roadmap to fix them." buttonLink="/tools/ai-visibility-checker" buttonText="Get your free audit" />
  </main>
);

export default SEOPage;
