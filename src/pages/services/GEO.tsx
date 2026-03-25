import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import { ArrowRight, Search, Brain, Eye } from "lucide-react";

const faqs = [
  { question: "What is generative engine optimisation?", answer: "Generative engine optimisation (GEO) is the practice of structuring content and building authority so that AI platforms — ChatGPT, Gemini, Perplexity, Copilot, Claude — cite and recommend your brand in their responses. It's a distinct discipline from traditional SEO." },
  { question: "How do I check if my brand is cited by AI?", answer: "You can use our free AI visibility audit tool to get an instant analysis across 5 major LLMs. For ongoing monitoring, we track citation rates, recommendation frequency, and brand sentiment across every AI platform weekly." },
  { question: "How long does GEO take to show results?", answer: "AI citation improvements can appear within weeks as LLM crawlers re-index optimised content. Full results typically build over 3–6 months as authority signals strengthen across platforms." },
  { question: "What is answer engine optimisation?", answer: "Answer engine optimisation (AEO) is an earlier term for what we now call GEO. It refers to optimising content to appear in AI-generated answers. We use GEO as the comprehensive term covering all AI search platforms." },
  { question: "Is GEO different from SEO?", answer: "Yes. SEO optimises for search engine ranking algorithms. GEO optimises for AI extraction and citation. They share foundations but require different tactics — content structure, brand authority signals, and indexing priority work differently for AI models." },
];

const comparisonRows = [
  { aspect: "Primary goal", seo: "Rank on search results pages", geo: "Get cited in AI-generated answers" },
  { aspect: "Optimises for", seo: "Google, Bing ranking algorithms", geo: "ChatGPT, Gemini, Perplexity, Copilot, Claude" },
  { aspect: "Content format", seo: "Keyword-targeted, long-form", geo: "In-depth, well-sourced, structured for clarity and depth" },
  { aspect: "Success metric", seo: "Rankings, organic traffic, CTR", geo: "Citation rate, recommendation frequency, AI share of voice" },
  { aspect: "Timeline", seo: "3–6 months for rankings", geo: "Weeks for citations, 3–6 months for authority" },
  { aspect: "Link building", seo: "Domain authority growth", geo: "Entity authority + cross-platform signals" },
];

const jsonLd = [
  { "@context": "https://schema.org", "@type": "Service", name: "Generative Engine Optimisation (GEO)", provider: { "@type": "Organization", name: "Wolfstone Digital" }, description: "Get your brand cited by ChatGPT, Gemini, Perplexity and Google AI with specialist GEO services.", areaServed: "GB" },
  { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://wolfstonedigital.co.uk/" },
    { "@type": "ListItem", position: 2, name: "Services", item: "https://wolfstonedigital.co.uk/services/" },
    { "@type": "ListItem", position: 3, name: "GEO", item: "https://wolfstonedigital.co.uk/services/geo/" },
  ]},
  { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) },
];

const GEOPage = () => (
  <main className="pt-20">
    <SEOHead title="Generative Engine Optimisation (GEO) UK | Wolfstone Digital" description="Get your brand cited by ChatGPT, Gemini, Perplexity & Google AI. We built the most AI-cited independent finance source on the internet. GEO that works." canonical="/services/geo/" jsonLd={jsonLd} />

    <section className="bg-wd-navy wd-ambient-glow py-20 md:py-28">
      <div className="container">
        <Breadcrumbs items={[{ label: "Services", path: "/services" }, { label: "GEO" }]} />
        <ScrollReveal><span className="text-overline text-primary mb-4 block">GEO services</span></ScrollReveal>
        <ScrollReveal delay={0.1}><h1 className="text-display max-w-[20ch] mb-6 text-foreground">Generative engine optimisation that gets your brand cited by AI</h1></ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="text-body-lg text-muted-foreground max-w-[70ch]">
            Generative engine optimisation (GEO) is the practice of getting your brand cited, recommended, and referenced by AI platforms. Most brands are invisible to ChatGPT, Gemini, Perplexity, Copilot, and Claude. We built the most AI-cited independent finance source on the internet — competing against brands with 100x our budget. We know exactly what it takes — because we've done it ourselves.
          </p>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-wd-ice py-20 md:py-28">
      <div className="container">
        <ScrollReveal><h2 className="text-h1 text-foreground mb-6">What is generative engine optimisation?</h2></ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="text-body-lg text-muted-foreground max-ch-70 mb-8">
            GEO is the discipline of structuring content, building entity authority, and optimising for AI crawlers so that large language models cite and recommend your brand. It's fundamentally different from <Link to="/services/seo/" className="text-primary font-bold hover:underline">traditional SEO</Link> — though the two work best together.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <div className="overflow-x-auto">
            <table className="w-full bg-card rounded-[12px] border border-border shadow-sm overflow-hidden">
              <thead>
                <tr className="bg-wd-navy text-white">
                  <th className="text-left p-4 text-overline">Aspect</th>
                  <th className="text-left p-4 text-overline">Traditional SEO</th>
                  <th className="text-left p-4 text-overline">GEO</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="p-4 text-body-sm font-bold text-foreground">{row.aspect}</td>
                    <td className="p-4 text-body-sm text-muted-foreground">{row.seo}</td>
                    <td className="p-4 text-body-sm text-muted-foreground">{row.geo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-wd-navy wd-ambient-glow py-20 md:py-28">
      <div className="container">
        <ScrollReveal><h2 className="text-h1 mb-10">Why GEO matters in 2026</h2></ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {[
            { value: "60%+", label: "Google searches show AI Overviews" },
            { value: "900M+", label: "Weekly ChatGPT users" },
            { value: "357%", label: "YoY AI referral traffic growth" },
            { value: "77%", label: "Use ChatGPT as a search engine" },
          ].map((s, i) => (
            <ScrollReveal key={i} delay={i * 0.07}>
              <div className="wd-glow-card p-5 text-center">
                <div className="text-[clamp(1.75rem,3vw,2.5rem)] font-black leading-none text-accent mb-2">{s.value}</div>
                <div className="text-overline text-wd-muted">{s.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal delay={0.2}>
          <p className="text-body-lg text-wd-muted max-ch-70">
            Traditional search is declining. AI-powered discovery is accelerating. Brands not being cited by AI are losing market share to competitors who are. The shift isn't coming — it's here.
          </p>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-wd-midnight py-20 md:py-28">
      <div className="container">
        <ScrollReveal><h2 className="text-h1 mb-6">How we optimise for AI search engines</h2></ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="text-body-lg text-wd-muted max-ch-70 mb-10">
            We've developed a <Link to="/services/llm-brand-exposure/" className="text-primary hover:text-accent transition-colors">proprietary methodology</Link> for increasing brand visibility across AI platforms. While we protect the specifics, our approach covers four key areas:
          </p>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: "Content structure optimisation", desc: "Restructuring your content so AI crawlers can extract and cite it. Most sites fail here — their content is invisible to AI models regardless of quality." },
            { title: "Building brand authority for AI", desc: "Strengthening the brand authority signals LLMs use to decide which brands to recommend. This includes structured data, cross-platform presence, and authoritative content." },
            { title: "AI indexing efficiency", desc: "AI crawlers operate on an indexing priority. If your content isn't prioritised for extraction, it won't be indexed. We ensure maximum indexing efficiency." },
            { title: "Cross-platform strategy", desc: "ChatGPT, Gemini, Perplexity, Copilot, and Claude each have different retrieval methods. We optimise for all five simultaneously." },
          ].map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.08}>
              <div className="wd-glow-card p-6 transition-colors duration-200 h-full">
                <h3 className="text-h3 mb-3">{item.title}</h3>
                <p className="text-body-sm text-wd-muted">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-wd-navy wd-ambient-glow py-20 md:py-28">
      <div className="container">
        <ScrollReveal>
          <h2 className="text-h1 mb-6">Our GEO results</h2>
          <p className="text-body-lg text-wd-muted max-ch-70 mb-10">
            Our own finance brand — built, owned, and operated by the Wolfstone team — is one of the UK's most-cited independent finance sources across AI platforms.
          </p>
        </ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {[
            { value: "#1", label: "Most AI-cited independent source" },
            { value: "5", label: "AI platforms citing us" },
            { value: "100x", label: "Outperforming bigger budgets" },
            { value: "900+", label: "Clients delivered" },
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
      </div>
    </section>

    <FAQSection faqs={faqs} />
    <CTASection heading="Is your brand being cited by AI?" body="If you don't know, it probably isn't. Get a free AI visibility audit and find out exactly where you stand." buttonLink="/tools/ai-visibility-checker" buttonText="Get your free audit" />
  </main>
);

export default GEOPage;
