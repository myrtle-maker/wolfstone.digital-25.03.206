import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import CTASection from "@/components/CTASection";
import FAQSection from "@/components/FAQSection";
import { Link2, ArrowRight, Loader2, Shield, AlertTriangle, BarChart3, Zap } from "lucide-react";

const faqs = [
  { question: "How does the backlink value checker work?", answer: "We scrape the linking page to analyse real signals — outgoing links, content quality, ad density, and spam indicators — then combine that with AI analysis of the domain's authority and reputation to give you an honest assessment." },
  { question: "Is this a replacement for Ahrefs or Moz?", answer: "No — it's a quick triage tool. Use it to evaluate whether a backlink opportunity is worth pursuing before you spend time or money. For full-scale analysis, dedicated SEO tools are still essential." },
  { question: "What makes a backlink valuable?", answer: "High domain authority, relevant content, low outgoing link count, real organic traffic, editorial context, and no spam signals. A link from a trusted industry publication is worth 100x more than a random guest post on a link farm." },
  { question: "Can I check any URL?", answer: "Yes — paste any URL where you're considering getting (or already have) a backlink. We'll analyse the page and domain to tell you if it's worth it." },
];

const BacklinkChecker = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || loading) return;
    navigate(`/tools/backlink-checker/results?url=${encodeURIComponent(url.trim())}`);
  };

  return (
    <main className="pt-20">
      <SEOHead
        title="Free Backlink Checker | Check Backlink Value & Quality | Wolfstone Digital"
        description="Free backlink checker — AI-powered analysis of any backlink's domain authority, spam risk, content quality, and link equity. Check if your backlinks are worth it."
        canonical="/tools/backlink-checker/"
        jsonLd={[
          { "@context": "https://schema.org", "@type": "WebApplication", name: "Backlink Checker", url: "https://wolfstonedigital.co.uk/tools/backlink-checker/", applicationCategory: "SEO Tool", provider: { "@type": "Organization", name: "Wolfstone Digital" }, description: "Free tool to check the real value of any backlink.", offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" } },
          { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://wolfstonedigital.co.uk/" },
            { "@type": "ListItem", position: 2, name: "Free SEO Tools", item: "https://wolfstonedigital.co.uk/tools/" },
            { "@type": "ListItem", position: 3, name: "Backlink Checker", item: "https://wolfstonedigital.co.uk/tools/backlink-checker/" },
          ]},
        ]}
      />

      {/* Hero */}
      <section className="bg-wd-navy py-20 md:py-28">
        <div className="container">
          <Breadcrumbs items={[{ label: "Free SEO Tools", path: "/tools" }, { label: "Backlink Checker" }]} />
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-h1 mb-4">Free backlink checker</h1>
              <p className="text-body-lg text-wd-muted mb-10 max-w-2xl mx-auto">
                Paste any URL to get an instant AI-powered analysis of its backlink value. We scrape the page, count outgoing links, assess content quality, and flag spam signals — so you know whether to pursue it or walk away.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
                <div className="flex-1 relative">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-wd-muted/50" />
                  <input
                    type="text"
                    className="w-full border border-white/10 rounded-md pl-12 pr-4 py-4 text-foreground placeholder:text-wd-muted/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors text-body bg-white/5"
                    placeholder="https://example.com/page-with-your-backlink"
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
                  {loading ? (<><Loader2 size={16} className="animate-spin" /> Checking...</>) : (<>Check backlink <ArrowRight size={16} /></>)}
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
              { icon: Shield, title: "Domain authority", desc: "How authoritative and trusted is the linking domain? Brand recognition, age, and industry standing." },
              { icon: BarChart3, title: "Outgoing link profile", desc: "How many other links are on the page? Too many dilutes your link equity significantly." },
              { icon: AlertTriangle, title: "Spam & red flags", desc: "PBN signals, link farms, keyword stuffing, excessive ads, thin content, and other toxic indicators." },
              { icon: Zap, title: "Content quality", desc: "Is the content original, well-written, and relevant? Or AI-generated filler on a ghost site?" },
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

export default BacklinkChecker;
