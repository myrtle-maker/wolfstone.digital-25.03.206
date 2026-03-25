import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import { Search, Eye, Megaphone, Link2, FileText, MessageSquare, Brain, ArrowRight } from "lucide-react";

const services = [
  { icon: Search, title: "SEO", desc: "Technical audits, crawlability, on-page & off-page optimisation to drive sustainable organic growth." },
  { icon: Brain, title: "AI search visibility", subtitle: "GEO & LLM brand exposure", desc: "Get your brand cited and recommended by ChatGPT, Gemini, Perplexity, Copilot & Claude. Our proven methodology — built through operating our own finance brand in one of the hardest regulated markets online — covers both generative engine optimisation and LLM-specific brand exposure." },
  { icon: Megaphone, title: "Digital PR", desc: "PR campaigns, earned media, and brand authority building that moves the needle." },
  { icon: Link2, title: "Backlinks", desc: "Market-leading link inventory with the highest quality placements available." },
  { icon: FileText, title: "Content", desc: "SEO & GEO optimised content plans, strategy, and writing that ranks and converts." },
  { icon: MessageSquare, title: "Social media & community", desc: "End-to-end social content creation, Reddit & forum brand exposure." },
];

const seoDetails = [
  "Crawlability — ensuring search engines can find, crawl, and index all valuable content",
  "On-page SEO — metadata optimisation, site structure, internal linking architecture, keyword targeting",
  "Off-page SEO — backlink profile analysis, domain authority growth, competitor gap analysis",
  "Content plan — strategy-led content calendars with fully SEO & GEO optimised copy",
  "GEO readiness — audit of how your brand currently appears in AI-generated answers",
];

const Services = () => {
  return (
    <main className="pt-20">
      <section className="bg-wd-navy py-20 md:py-28">
        <div className="container">
          <ScrollReveal>
            <span className="text-overline text-primary mb-4 block">Services</span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-display max-w-[18ch] mb-6">
              What we <span className="wd-gradient-text">deliver.</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-wd-muted max-ch-70">
              Six disciplines. One objective: measurable commercial growth for your brand.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="bg-[hsl(var(--wd-cream))] wd-texture py-20 md:py-28">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <ScrollReveal key={s.title} delay={i * 0.06}>
                <div className="bg-white border border-[hsl(var(--wd-warm-grey))] rounded-[12px] p-6 hover:shadow-md hover:border-[hsl(var(--wd-blue))]/30 transition-all duration-200 h-full flex flex-col shadow-sm">
                  <s.icon className="w-8 h-8 text-[hsl(var(--wd-blue))] mb-4" />
                  <h3 className="text-h3 text-[hsl(var(--wd-navy-text))] mb-1">{s.title}</h3>
                  {s.subtitle && <p className="text-caption text-[hsl(var(--wd-blue))] mb-2">{s.subtitle}</p>}
                  <p className="text-body-sm text-[hsl(var(--wd-navy-text))]/55 mt-1 flex-1">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[hsl(var(--wd-stone))] py-20 md:py-28">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <ScrollReveal>
                <span className="text-overline text-[hsl(var(--wd-blue))] mb-4 block">Deep dive</span>
                <h2 className="text-h1 text-[hsl(var(--wd-navy-text))] mb-6">Technical SEO & audits</h2>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <div className="space-y-4">
                  {seoDetails.map((d) => (
                    <div key={d} className="flex gap-3 items-start">
                      <ArrowRight className="w-4 h-4 text-[hsl(var(--wd-blue))] mt-1 shrink-0" />
                      <p className="text-body text-[hsl(var(--wd-navy-text))]/70">{d}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>

            <div>
              <ScrollReveal delay={0.15}>
                <span className="text-overline text-[hsl(var(--wd-blue))] mb-4 block">Deep dive</span>
                <h2 className="text-h1 text-[hsl(var(--wd-navy-text))] mb-6">LLM brand exposure</h2>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <p className="text-body text-[hsl(var(--wd-navy-text))]/70 mb-6">
                  The way consumers discover brands is changing. Large language models — ChatGPT, Gemini, Perplexity, Copilot — are increasingly used to research, compare, and recommend products. Most brands are invisible in this space. We change that.
                </p>
                <div className="bg-white border border-[hsl(var(--wd-warm-grey))] rounded-[12px] p-6 shadow-sm">
                  <h4 className="text-h3 text-[hsl(var(--wd-blue))] mb-3">Why it matters</h4>
                  <p className="text-body-sm text-[hsl(var(--wd-navy-text))]/55 mb-4">
                    AI-powered search is here. Consumers ask LLMs for recommendations instead of Google. LLM crawlers operate on a crawl budget — if content isn't structured for easy extraction, it won't get indexed.
                  </p>
                  <p className="text-body-sm text-[hsl(var(--wd-navy-text))] font-bold">
                    If your brand isn't being cited, you're losing market share.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-wd-navy py-20 md:py-28 text-center">
        <div className="container">
          <ScrollReveal>
            <h2 className="text-h1 mb-6 text-white">Ready to outperform?</h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-accent transition-colors duration-200 active:scale-[0.97]"
            >
              Book a consultation <ArrowRight size={16} />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
};

export default Services;
