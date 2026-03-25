import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import CTASection from "@/components/CTASection";
import FAQSection from "@/components/FAQSection";
import { Globe, ArrowRight, Loader2, Code2, Heading, FileJson, Search } from "lucide-react";

const faqs = [
  { question: "What does the AI crawlability checker analyse?", answer: "We scrape your page and examine HTML structure, heading hierarchy, semantic HTML usage, structured data (JSON-LD), meta tags, content-to-code ratio, image alt text, internal linking, and crawl accessibility — everything that affects how AI systems consume your content." },
  { question: "Why does AI crawlability matter?", answer: "AI platforms like ChatGPT, Gemini, and Perplexity need to extract and understand your content to cite it. Poorly structured pages with missing schema, broken heading hierarchies, or bloated HTML get skipped in favour of cleaner, better-structured competitors." },
  { question: "Is this the same as a regular SEO audit?", answer: "No — traditional SEO audits focus on rankings and indexation. AI crawlability specifically measures how easily AI systems can parse, understand, and reference your content. Many pages that rank well in Google are still invisible to AI platforms because they lack the structural signals AI relies on." },
  { question: "What's a good crawlability score?", answer: "Scores above 70 indicate strong AI readiness. Between 40-70 means there are significant improvements needed. Below 40 suggests fundamental structural issues that are likely preventing AI platforms from properly consuming your content." },
];

const CrawlabilityChecker = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || loading) return;
    navigate(`/tools/ai-crawlability-checker/results?url=${encodeURIComponent(url.trim())}`);
  };

  return (
    <main className="pt-20">
      <SEOHead
        title="Free AI Crawlability Checker | Test How AI Reads Your Website | Wolfstone Digital"
        description="Free AI crawlability checker — analyse your website's HTML structure, heading hierarchy, schema markup, semantic HTML, and content-to-code ratio. Find out if AI can read your site."
        canonical="/tools/ai-crawlability-checker/"
        jsonLd={[
          { "@context": "https://schema.org", "@type": "WebApplication", name: "AI Crawlability Checker", url: "https://wolfstonedigital.co.uk/tools/ai-crawlability-checker/", applicationCategory: "SEO Tool", provider: { "@type": "Organization", name: "Wolfstone Digital" }, description: "Free tool to check how well AI systems can crawl and understand your website.", offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" } },
          { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://wolfstonedigital.co.uk/" },
            { "@type": "ListItem", position: 2, name: "Free SEO Tools", item: "https://wolfstonedigital.co.uk/tools/" },
            { "@type": "ListItem", position: 3, name: "AI Crawlability Checker", item: "https://wolfstonedigital.co.uk/tools/ai-crawlability-checker/" },
          ]},
        ]}
      />

      {/* Hero */}
      <section className="bg-wd-navy py-20 md:py-28">
        <div className="container">
          <Breadcrumbs items={[{ label: "Free SEO Tools", path: "/tools" }, { label: "AI Crawlability Checker" }]} />
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-h1 mb-4">Free AI crawlability checker</h1>
              <p className="text-body-lg text-wd-muted mb-10 max-w-2xl mx-auto">
                Paste any URL to get an instant analysis of how well your page is structured for AI consumption. We check heading hierarchy, semantic HTML, schema markup, page weight, and more — so you know exactly what to fix.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
                <div className="flex-1 relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-wd-muted/50" />
                  <input
                    type="text"
                    className="w-full border border-white/10 rounded-md pl-12 pr-4 py-4 text-foreground placeholder:text-wd-muted/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors text-body bg-white/5"
                    placeholder="https://yourwebsite.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    maxLength={500}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-accent transition-colors duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {loading ? (<><Loader2 size={16} className="animate-spin" /> Checking...</>) : (<>Check crawlability <ArrowRight size={16} /></>)}
                </button>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* What we check */}
      <section className="bg-wd-midnight py-16 md:py-20">
        <div className="container">
          <ScrollReveal><h2 className="text-h2 mb-10 text-center">What we analyse</h2></ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Heading, title: "Heading hierarchy", desc: "Is there a single H1? Do headings follow a logical structure? AI systems rely on heading hierarchy to understand content organisation." },
              { icon: Code2, title: "Semantic HTML", desc: "Does your page use <main>, <article>, <section>, and other semantic elements — or is it div soup that AI can't parse?" },
              { icon: FileJson, title: "Structured data", desc: "Is JSON-LD schema markup present? This is how AI systems extract entity information and understand what your page is about." },
              { icon: Search, title: "Crawl signals", desc: "HTML page size, content-to-code ratio, meta tags, image alt text, and robots directives — every signal that affects AI consumption." },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.08}>
                <div className="bg-card border border-primary/[0.15] rounded-[12px] p-6 hover:border-primary/[0.45] transition-colors duration-200 h-full">
                  <item.icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-h3 mb-2">{item.title}</h3>
                  <p className="text-body-sm text-wd-muted">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <FAQSection faqs={faqs} />
      <CTASection />
    </main>
  );
};

export default CrawlabilityChecker;
