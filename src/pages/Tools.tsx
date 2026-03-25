import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import CTASection from "@/components/CTASection";
import FAQSection from "@/components/FAQSection";
import { Brain, Link2, Globe, ArrowRight, Lock, Sparkles, TrendingUp } from "lucide-react";

const tools = [
  {
    icon: Brain,
    title: "Free AI Visibility Checker",
    desc: "Check whether ChatGPT, Gemini, Perplexity, Copilot, and Claude are citing or recommending your brand. Instant analysis across all 5 major AI platforms.",
    path: "/tools/ai-visibility-checker",
    cta: "Check your brand",
  },
  {
    icon: Link2,
    title: "Free Backlink Checker",
    desc: "Paste any URL to get an instant AI-powered analysis of its backlink value — domain authority, spam risk, content quality, and estimated link worth.",
    path: "/tools/backlink-checker",
    cta: "Check a backlink",
  },
  {
    icon: Globe,
    title: "Free AI Crawlability Checker",
    desc: "Analyse how well AI systems can crawl and understand your website. We check heading hierarchy, semantic HTML, schema markup, page weight, and more.",
    path: "/tools/ai-crawlability-checker",
    cta: "Check crawlability",
  },
];

const faqs = [
  { question: "Are these tools really free?", answer: "Yes — completely free, no credit card required. We gate the detailed report behind a name and email, but the headline score is always visible immediately." },
  { question: "How do these tools work?", answer: "Each tool uses AI to analyse real data — we scrape pages, query AI platforms, and run structured analysis. Results are generated in real-time, not from cached databases." },
  { question: "Why does Wolfstone Digital offer free SEO tools?", answer: "We built these tools to demonstrate our methodology. If the free analysis shows gaps in your AI visibility, backlink profile, or crawlability — we're the team that can fix them." },
  { question: "Can I use these tools for competitor analysis?", answer: "Absolutely. The AI visibility checker and backlink checker work on any brand or URL. Use them to benchmark your competitors and identify opportunities." },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Free SEO & AI Visibility Tools",
    description: "Free SEO tools from Wolfstone Digital — AI visibility checker, backlink checker, and AI crawlability checker. Instant analysis, no signup required.",
    url: "https://wolfstonedigital.co.uk/tools/",
    provider: { "@type": "Organization", name: "Wolfstone Digital" },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://wolfstonedigital.co.uk/" },
      { "@type": "ListItem", position: 2, name: "Free SEO Tools", item: "https://wolfstonedigital.co.uk/tools/" },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  },
];

const ToolsPage = () => (
  <main className="pt-20">
    <SEOHead
      title="Free SEO Tools | AI Visibility, Backlink & Crawlability Checker | Wolfstone Digital"
      description="Free SEO tools from Wolfstone Digital — check your AI visibility across ChatGPT & Gemini, analyse backlink value, and audit your site's AI crawlability. Instant results."
      canonical="/tools/"
      jsonLd={jsonLd}
    />

    <section className="bg-wd-navy wd-ambient-glow py-20 md:py-28">
      <div className="container">
        <Breadcrumbs items={[{ label: "Free SEO Tools" }]} />
        <ScrollReveal>
          <span className="text-overline text-primary mb-4 block">Free tools</span>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <h1 className="text-display max-w-[20ch] mb-6">Free SEO & AI visibility tools</h1>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="text-body-lg text-wd-muted max-ch-70">
            Audit your brand's AI visibility, check the value of any backlink, and test how well your site is structured for AI consumption. Built by the team behind the most AI-cited independent finance source amongst our competitors.
          </p>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-wd-midnight py-20 md:py-28">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tools.map((tool, i) => (
            <ScrollReveal key={tool.path} delay={i * 0.1}>
              <Link
                to={tool.path}
                className="block wd-glow-card p-8 transition-all duration-200 h-full group"
              >
                <tool.icon className="w-10 h-10 text-primary mb-5" />
                <h2 className="text-h2 mb-4">{tool.title}</h2>
                <p className="text-body text-wd-muted mb-8">{tool.desc}</p>
                <span className="inline-flex items-center gap-2 text-primary text-[13px] font-bold tracking-[0.05em] uppercase group-hover:gap-3 transition-all duration-200">
                  {tool.cta} <ArrowRight size={16} />
                </span>
              </Link>
            </ScrollReveal>
          ))}

          {/* Pro tools card */}
          <ScrollReveal delay={tools.length * 0.1}>
            <Link
              to="/tools/pro"
              className="block wd-glow-card p-8 transition-all duration-200 h-full group relative overflow-hidden"
            >
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  <Lock size={10} /> Pro
                </span>
              </div>
              <Lock className="w-10 h-10 text-primary mb-5" />
              <h2 className="text-h2 mb-4">Pro Tools</h2>
              <p className="text-body text-muted-foreground mb-8">
                Bulk backlink analysis, AI exposure scanning across Claude, Gemini & ChatGPT — power tools for partners with access.
              </p>
              <span className="inline-flex items-center gap-2 text-primary text-[13px] font-bold tracking-[0.05em] uppercase group-hover:gap-3 transition-all duration-200">
                Get access <ArrowRight size={16} />
              </span>
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </section>

    {/* Client portal CTA */}
    <section className="bg-wd-navy wd-ambient-glow py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
      <div className="container relative">
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Free for all clients</span>
            </div>
            <h2 className="text-h1 mb-4">
              Want to track your AI visibility <span className="wd-gradient-text">every single day?</span>
            </h2>
            <p className="text-body-lg text-wd-muted mb-4 max-w-xl mx-auto">
              Our clients get free access to the AI Visibility Tracking Portal — automated daily scans across ChatGPT, Gemini & Claude, with trend data and project dashboards.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
              {[
                "Daily automated scanning",
                "Track multiple brands",
                "Visibility trends over time",
              ].map(item => (
                <span key={item} className="flex items-center gap-2 text-body-sm text-wd-muted">
                  <TrendingUp className="w-4 h-4 text-primary shrink-0" /> {item}
                </span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/portal/login"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-accent transition-colors duration-200 active:scale-[0.97]"
              >
                Access the portal <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-primary/30 text-primary text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-primary/10 transition-colors duration-200"
              >
                Become a client
              </Link>
            </div>
            <p className="text-[11px] text-wd-muted/40 mt-5">
              Not a client yet? Request access or get in touch — we'd love to chat.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>

    <FAQSection faqs={faqs} />
    <CTASection />
  </main>
);

export default ToolsPage;
