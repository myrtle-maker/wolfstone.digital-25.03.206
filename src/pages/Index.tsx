import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import CitationTicker from "@/components/CitationTicker";
import AuroraBackground from "@/components/AuroraBackground";
import {
  Search, Zap, Shield, BarChart3, Users, Brain, ArrowRight,
  Eye, Megaphone, Link2,
  PenTool, Share2, ExternalLink, Target, TrendingUp
} from "lucide-react";

import featuredAI from "@/assets/featured/ai-visibility.jpg";
import featuredContent from "@/assets/featured/content-seo.jpg";
import featuredPR from "@/assets/featured/digital-pr.jpg";
import featuredCaseStudy from "@/assets/featured/case-study.jpg";

import logoIG from "@/assets/clients/ig.png";
import logoPepperstone from "@/assets/clients/pepperstone.png";
import logoEToro from "@/assets/clients/etoro.png";
import logoTrading212 from "@/assets/clients/trading212.png";
import logoSpreadex from "@/assets/clients/spreadex.png";

const partnerLogos = [
  { name: "IG", logo: logoIG },
  { name: "Pepperstone", logo: logoPepperstone },
  { name: "eToro", logo: logoEToro },
  { name: "Trading 212", logo: logoTrading212 },
  { name: "Spreadex", logo: logoSpreadex },
];

const problems = [
  { num: "01", title: "Traditional SEO is losing its edge", desc: "AI Overviews now appear in 60%+ of Google searches. The organic clicks brands have relied on for years are evaporating." },
  { num: "02", title: "Paid media is a race to the bottom", desc: "CPCs keep climbing. Attribution is getting murkier. You're paying more to reach fewer people — and AI is about to make it worse." },
  { num: "03", title: "Your agency is guessing", desc: "Traditional SEO agencies are guessing. They haven't built anything that gets cited by LLMs. We have — and we're the most cited in our competitive set." },
  { num: "04", title: "AI search plays by different rules", desc: "LLMs don't crawl like Google. They don't rank like Google. The entire playbook is different — and almost nobody has figured it out yet." },
  { num: "05", title: "The window is closing", desc: "First movers in AI visibility will dominate their categories for years. The brands that move now will be the ones AI defaults to. Everyone else will be fighting for scraps." },
];

const whyUs = [
  { icon: Shield, title: "We know regulated markets", desc: "We come from FCA-regulated financial services — the hardest sector to market in. We understand compliance from the inside." },
  { icon: Brain, title: "We own & operate in the space", desc: "We founded and operate our own international finance brand — the most AI-cited independent source amongst our competitors. We compete in the markets we serve." },
  { icon: Zap, title: "The biggest brands validate us", desc: "IG, Pepperstone, eToro, Spreadex work with us because our methods outperform what their existing agencies deliver." },
  { icon: Search, title: "Proprietary methodology", desc: "Our proven methodology for building genuine AI visibility, built through real-world experience, not theory." },
  { icon: BarChart3, title: "Commercially driven", desc: "We come from business backgrounds, not agency backgrounds. Everything is measured by revenue impact, not traffic dashboards." },
  { icon: Users, title: "Category exclusivity", desc: "We won't work with your direct competitors. When you partner with us, our methodology works for you — not against you." },
];

const services = [
  { icon: Search, title: "SEO", desc: "Technical and on-page optimisation for enterprise brands in competitive markets.", path: "/services/seo" },
  { icon: Brain, title: "AI search visibility", desc: "GEO & LLM brand exposure — get cited and recommended by every major AI platform.", path: "/services/geo" },
  { icon: Megaphone, title: "Digital PR", desc: "Strategic PR campaigns that build authority and earn high-value coverage.", path: "/services/digital-pr" },
  { icon: ExternalLink, title: "Backlinks", desc: "Premium link acquisition from the UK's largest backlink inventory.", path: "/services/backlinks" },
  { icon: PenTool, title: "Content", desc: "Expert-led content trusted by search engines and AI platforms.", path: "/services/content" },
  { icon: Share2, title: "Social media", desc: "End-to-end social strategy with in-house production.", path: "/services/social-media" },
];

const faqs = [
  { question: "What is generative engine optimisation (GEO)?", answer: "GEO is the practice of optimising content and building authority so that AI platforms — ChatGPT, Gemini, Perplexity, Copilot, Claude — cite and recommend your brand. It's a distinct discipline from traditional SEO, requiring different content structures, entity authority signals, and crawl optimisation strategies." },
  { question: "What does a Wolfstone engagement cost?", answer: "Premium partnerships start at £20,000+/month — dedicated strategy, priority execution, and category exclusivity. Enterprise engagements covering SEO, GEO, PR, and content range from £10,000–£20,000/month. Single-channel retainers start from £5,000/month. Every engagement is bespoke — we don't sell packages." },
  { question: "What is LLM brand exposure?", answer: "LLM brand exposure is our proprietary methodology for getting brands cited, recommended, and referenced by large language models. We developed it by building and operating our own finance brand in the FCA-regulated space — now the most AI-cited independent source amongst our competitors across every major LLM — and now apply it to client brands." },
  { question: "How do I check if AI is citing my brand?", answer: "Use our free AI visibility audit tool — enter your brand name and get an instant analysis across ChatGPT, Gemini, Perplexity, Copilot, and Claude. It takes ~15 seconds and requires no signup. For ongoing monitoring, we track citations weekly as part of our retainer service." },
  { question: "What industries does Wolfstone Digital work with?", answer: "Our roots are in financial services — we founded our own finance brand and have worked alongside IG, Trading 212, Pepperstone, eToro, and Spreadex. Our AI visibility methodology is sector-agnostic, and we're now applying it to legal, ecommerce, and leisure brands." },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Wolfstone Digital",
    url: "https://wolfstonedigital.co.uk",
    description: "UK-based consultancy specialising in AI visibility, digital PR, and technical SEO for enterprise brands in regulated industries. Founded by financial services professionals.",
    areaServed: "GB",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [heroBrand, setHeroBrand] = useState("");
  const [heroWebsite, setHeroWebsite] = useState("");
  const [heroPrompt, setHeroPrompt] = useState("");

  useEffect(() => {
    console.log(
      `%c🐺 Wolfstone Digital%c\nYou're looking under the hood. We respect that.\n%cAI citations across every major LLM. Zero API tricks.%c\nwolfstonedigital.co.uk/contact`,
      'font-size:20px;font-weight:bold;color:#00B8D9',
      'color:#fff;font-size:13px',
      'color:#999;font-size:12px',
      'color:#666;font-size:11px'
    );
  }, []);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroBrand.trim()) return;
    const params = new URLSearchParams({ brand: heroBrand.trim() });
    if (heroWebsite.trim()) params.set("website", heroWebsite.trim());
    if (heroPrompt.trim()) params.set("prompt", heroPrompt.trim());
    const path = heroPrompt.trim()
      ? `/tools/ai-visibility-checker?tab=prompt&brand=${encodeURIComponent(heroBrand.trim())}&prompt=${encodeURIComponent(heroPrompt.trim())}`
      : `/tools/ai-visibility-checker/results?${params.toString()}`;
    navigate(path);
  };

  return (
    <main>
      <SEOHead
        title="AI SEO & GEO | Wolfstone Digital — Built by Operators"
        description="The most AI-cited independent finance source amongst our competitors — across ChatGPT, Gemini, Perplexity, Copilot & Claude. Founded by financial services professionals. AI visibility, GEO, digital PR & technical SEO for enterprise brands."
        canonical="/"
        jsonLd={jsonLd}
      />

      {/* ═══════ FULL-PAGE CITATION FLOW NETWORK ═══════ */}
      <AuroraBackground intensity={0.6} speed={0.5} fullPage />

      {/* ═══════ HERO ═══════ */}
      <section className="relative pt-20">

        <div className="container relative z-10 grid min-h-[88vh] items-center gap-8 py-16 md:py-28 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1fr)] lg:gap-6 xl:gap-10">
          <div className="max-w-[40rem]">
            <span className="text-overline text-primary mb-4 md:mb-6 block">AI SEO & GEO — built by operators</span>
            <h1 className="text-[clamp(1.75rem,4vw,3.5rem)] font-black leading-[1.08] tracking-[-0.03em] max-w-[20ch] mb-6 md:mb-8 text-foreground">
              We don't advise on AI visibility.<br />
              We <span className="wd-gradient-text">dominate it.</span>
            </h1>

            <p className="text-body md:text-body-lg text-muted-foreground max-w-[34rem] mb-8 md:mb-12 leading-relaxed">
              We come from financial services — one of the most regulated, competitive sectors online. We founded and operate our own international finance brand, now the most AI-cited independent source amongst our competitors across ChatGPT, Gemini, Perplexity, Copilot, and Claude. That deep industry expertise gave us an unfair advantage in understanding what makes content genuinely authoritative. Now we deploy the same methodology for select partners.
            </p>

            <form onSubmit={handleHeroSubmit} className="max-w-xl mb-8 md:mb-10">
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <input type="text" value={heroBrand} onChange={(e) => setHeroBrand(e.target.value)} placeholder="Enter your brand name" className="flex-1 rounded-[12px] bg-[hsl(var(--wd-surface-glass))] backdrop-blur-md border border-[hsl(var(--wd-border-glass))] border-t-[hsl(var(--wd-glass-border-top))] text-foreground placeholder:text-muted-foreground px-5 py-3.5 text-[15px] focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all" required />
                <input type="text" value={heroWebsite} onChange={(e) => setHeroWebsite(e.target.value)} placeholder="Website (optional)" className="sm:w-44 rounded-[12px] bg-[hsl(var(--wd-surface-glass))] backdrop-blur-md border border-[hsl(var(--wd-border-glass))] border-t-[hsl(var(--wd-glass-border-top))] text-foreground placeholder:text-muted-foreground px-5 py-3.5 text-[15px] focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all" />
              </div>
              <div className="relative mb-3">
                <textarea
                  value={heroPrompt}
                  onChange={(e) => setHeroPrompt(e.target.value)}
                  placeholder='Test a prompt, e.g. "What are the best investment platforms in the UK?"'
                  className="w-full rounded-[12px] bg-[hsl(var(--wd-surface-glass))] backdrop-blur-md border border-[hsl(var(--wd-border-glass))] border-t-[hsl(var(--wd-glass-border-top))] text-foreground placeholder:text-muted-foreground px-5 py-3 text-[15px] focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all resize-none min-h-[52px]"
                  maxLength={500}
                  rows={1}
                />
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-6 py-3.5 hover:bg-accent hover:shadow-glow-cyan transition-all duration-300 active:scale-[0.97] whitespace-nowrap">
                  {heroPrompt.trim() ? "Test prompt" : "Check AI visibility"} <ArrowRight size={16} />
                </button>
                <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[hsl(var(--wd-border-glass))] text-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-6 py-3.5 hover:border-primary/40 hover:text-primary transition-all duration-300 active:scale-[0.97] whitespace-nowrap bg-[hsl(var(--wd-surface-glass))] backdrop-blur-md">
                  Book a consultation
                </Link>
              </div>
            </form>
          </div>

          <CitationTicker variant="light" />
        </div>
      </section>

      {/* ═══════ METHOD STRIP ═══════ */}
      <section className="relative py-12 md:py-14">
        <div className="container relative z-10 rounded-[20px] wd-glass px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { label: "Operator-led", desc: "We founded and operate our own brand in regulated financial services — then applied the playbook to clients." },
              { label: "Proprietary GEO methodology", desc: "A methodology for AI visibility built through real-world experience in one of the hardest markets online." },
              { label: "Full-stack execution", desc: "SEO, GEO, PR, backlinks, content, and AI visibility — one integrated engine. No patchwork of freelancers." },
              { label: "Category exclusivity", desc: "We limit our client base and offer category exclusivity. If we work with you, we don't work with your competitors." },
            ].map((item) => (
              <div key={item.label} className="text-center md:text-left">
                <div className="text-[13px] font-bold tracking-[0.08em] uppercase text-primary mb-2">{item.label}</div>
                <div className="text-body-sm text-muted-foreground leading-snug">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TRACK RECORD ═══════ */}
      <section className="relative py-16 md:py-36">
        <div className="container relative z-10">
          <div className="rounded-[20px] wd-glass p-8 md:p-14 mb-8">
            <ScrollReveal>
              <div className="mb-12 md:mb-20">
                <span className="text-overline text-primary mb-5 block">Our track record</span>
                <h2 className="text-h1 mb-8 text-foreground">
                  We built it ourselves.{" "}
                  <span className="wd-gradient-text">That's why it works.</span>
                </h2>
                <p className="text-body-lg text-muted-foreground mb-8 max-w-[65ch]">
                  We didn't start as an agency — we started by founding and operating a finance brand in the FCA-regulated broker comparison space. That hands-on experience in one of the hardest markets online is what our methodology is built on.
                </p>
                <Link to="/contact" className="inline-flex items-center gap-2 text-primary text-[13px] font-bold tracking-[0.05em] uppercase hover:text-accent transition-colors duration-200">
                  Book a consultation <ArrowRight size={16} />
                </Link>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: Target, title: "Built from scratch", desc: "A live, revenue-generating international finance brand we founded and operate in a regulated market. That real-world experience shapes everything we do." },
                { icon: TrendingUp, title: "Cited across every LLM", desc: "Our own finance brand is the most AI-cited independent source amongst our competitors — referenced by ChatGPT, Gemini, Perplexity, Copilot, and Claude. Authority earned through genuine expertise, not shortcuts.", stat: "#1" },
                { icon: Shield, title: "Cross-platform authority", desc: "Thousands of referring domains and backlinks, built organically through editorial quality and depth of knowledge." },
                { icon: BarChart3, title: "Operators, not advisors", desc: "We compete daily in the same regulated markets our clients operate in. No other agency can say that." },
              ].map((item, i) => (
                <ScrollReveal key={item.title} delay={i * 0.08}>
                  <div className="rounded-[16px] wd-glass p-8 h-full">
                    <item.icon className="w-8 h-8 text-primary mb-5" />
                    {item.stat && (
                      <div className="mb-4">
                        <span className="text-[2.5rem] font-black text-primary leading-none">{item.stat}</span>
                      </div>
                    )}
                    <h3 className="text-h3 text-foreground mb-3">{item.title}</h3>
                    <p className="text-body text-muted-foreground">{item.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ SERVICES ═══════ */}
      <section className="relative py-16 md:py-36">
        <div className="container relative z-10">
          <ScrollReveal>
            <span className="text-overline text-primary mb-5 block">What we do</span>
            <h2 className="text-h1 text-foreground mb-14 max-w-[30ch]">Seven specialisms. One growth engine.</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((s, i) => (
              <ScrollReveal key={s.path} delay={i * 0.06}>
                <Link
                  to={s.path}
                  className="block rounded-[16px] wd-glass p-7 h-full group hover:border-primary/20 transition-all duration-300"
                >
                  <s.icon className="w-7 h-7 text-primary mb-5 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-h3 text-foreground mb-3">{s.title}</h3>
                  <p className="text-body-sm text-muted-foreground mb-5">{s.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-primary text-xs font-bold tracking-[0.05em] uppercase group-hover:gap-2.5 transition-all duration-300">
                    Learn more <ArrowRight size={14} />
                  </span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FEATURED LINKS ═══════ */}
      <section className="relative py-16 md:py-36">
        <div className="container relative z-10">
          <ScrollReveal>
            <span className="text-overline text-primary mb-5 block">Explore</span>
            <h2 className="text-h1 text-foreground mb-14 max-w-[30ch]">Go deeper.</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { image: featuredAI, title: "AI visibility audit", desc: "Find out if AI is recommending your brand — free, instant results across 5 platforms.", path: "/tools/ai-visibility-checker", label: "Run audit" },
              { image: featuredCaseStudy, title: "Our track record", desc: "900+ clients delivered to a major investing platform. Results that prove the methodology works.", path: "/case-studies", label: "See case studies" },
              { image: featuredContent, title: "GEO & LLM brand exposure", desc: "Our proprietary methodology for making AI recommend your brand.", path: "/services/geo", label: "Learn more" },
              { image: featuredPR, title: "Digital PR & backlinks", desc: "Authority-building campaigns that drive both SEO results and AI citations.", path: "/services/digital-pr", label: "Learn more" },
            ].map((card, i) => (
              <ScrollReveal key={card.path} delay={i * 0.08}>
                <Link
                  to={card.path}
                  className="group block rounded-[16px] wd-glass overflow-hidden hover:border-primary/20 transition-all duration-300"
                >
                  <div className="aspect-[16/9] overflow-hidden">
                    <img src={card.image} alt={card.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-7">
                    <h3 className="text-h3 text-foreground mb-2">{card.title}</h3>
                    <p className="text-body-sm text-muted-foreground mb-4">{card.desc}</p>
                    <span className="inline-flex items-center gap-1.5 text-primary text-xs font-bold tracking-[0.05em] uppercase group-hover:gap-2.5 transition-all duration-300">
                      {card.label} <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ BRANDS WE WORK ALONGSIDE ═══════ */}
      <section className="relative py-16 md:py-36">
        <div className="container relative z-10">
          <ScrollReveal>
            <span className="text-overline text-primary mb-5 block text-center">Brands we work alongside</span>
            <p className="text-body-lg text-muted-foreground text-center max-w-[60ch] mx-auto mb-14">
              We work alongside some of the biggest names in financial services — building AI visibility and driving qualified leads through deep understanding of the regulated finance sector.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="mb-16 overflow-hidden rounded-[20px] wd-glass py-10">
              <div className="animate-logo-scroll flex items-center gap-16 md:gap-24 w-max">
                {[...partnerLogos, ...partnerLogos, ...partnerLogos, ...partnerLogos].map((client, i) => (
                  <img key={`${client.name}-${i}`} src={client.logo} alt={`${client.name} logo`} loading="lazy" className="h-12 md:h-16 w-auto object-contain opacity-60 hover:opacity-100 hover:scale-105 transition-all duration-300 shrink-0" />
                ))}
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { stat: "900+", desc: "New clients driven to a major trading platform through a single targeted campaign" },
              { stat: "5", desc: "Major financial brands we actively work with in the regulated finance sector" },
              { stat: "#1", desc: "Most AI-cited independent source amongst our competitors — earned through the methodology we now offer to clients" },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <div className="rounded-[16px] wd-glass p-10 text-center">
                  <div className="text-[clamp(1.75rem,3vw,2.5rem)] font-black text-primary leading-none mb-4">{item.stat}</div>
                  <p className="text-body text-muted-foreground">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="relative py-16 md:py-36">
        <div className="container relative z-10">
          <ScrollReveal>
            <span className="text-overline text-[hsl(var(--wd-gold))] mb-5 block text-center">What partners say</span>
            <h2 className="text-h1 text-foreground mb-16 text-center max-w-[30ch] mx-auto">Don't take our word for it.</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Dom and the team completely changed how we think about digital acquisition. The results spoke for themselves — 900+ new clients through a single campaign angle that nobody else had identified. They don't just execute, they find opportunities you didn't know existed.",
                name: "Head of Partnerships",
                company: "Major UK Investment Platform",
              },
              {
                quote: "What sets Wolfstone apart is that they actually operate in our space. They understand the compliance challenges, the competitive landscape, and what actually moves the needle commercially. Working with them felt like an extension of our own marketing team.",
                name: "Marketing Director",
                company: "Leading Online Broker",
              },
              {
                quote: "We'd worked with three agencies before Wolfstone. The difference was immediate — they brought a methodology nobody else had. Within months, our brand was being cited by AI platforms we hadn't even considered. The wider team's understanding of AI search is genuinely ahead of anyone else in the market.",
                name: "Head of Digital",
                company: "Global Trading Platform",
              },
            ].map((t, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="wd-glow-card p-8 h-full flex flex-col">
                  <div className="text-[hsl(var(--wd-gold))] text-3xl font-black mb-4 leading-none">"</div>
                  <p className="text-body-sm text-muted-foreground mb-6 flex-1 italic">{t.quote}</p>
                  <div className="border-t border-[hsl(var(--wd-border-glass))] pt-4">
                    <div className="text-body-sm font-bold text-foreground">{t.name}</div>
                    <div className="text-caption text-muted-foreground">{t.company}</div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal delay={0.3}>
            <p className="text-caption text-muted-foreground text-center mt-10">Named testimonials available on request. Contact details anonymised for partner confidentiality.</p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════ INDUSTRIES (CREAM) ═══════ */}
      {/* Industries section kept inline if it exists in original — not present in lines 337+ so skipping */}

      {/* ═══════ THE PROBLEM + WHY WOLFSTONE ═══════ */}
      <section className="relative py-16 md:py-36">
        <div className="container relative z-10">
          <div className="rounded-[20px] wd-glass p-8 md:p-14">
            <ScrollReveal>
              <span className="text-overline text-primary mb-5 block">The problem — and why we're different</span>
              <h2 className="text-h1 text-foreground mb-14 max-w-[30ch]">AI search is here. Most brands are invisible.</h2>
            </ScrollReveal>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
              <div>
                <ScrollReveal>
                  <h3 className="text-h2 text-foreground mb-10">The 5 problems</h3>
                </ScrollReveal>
                <div className="space-y-7">
                  {problems.map((p, i) => (
                    <ScrollReveal key={p.num} delay={i * 0.06}>
                      <div className="border-l-2 border-primary pl-6">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-overline text-primary">{p.num}</span>
                          <h4 className="text-h3 text-foreground">{p.title}</h4>
                        </div>
                        <p className="text-body-sm text-muted-foreground">{p.desc}</p>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>

              <div>
                <ScrollReveal>
                  <h3 className="text-h2 text-foreground mb-10">Why Wolfstone</h3>
                </ScrollReveal>
                <div className="space-y-7">
                  {whyUs.map((item, i) => (
                    <ScrollReveal key={item.title} delay={i * 0.06}>
                      <div className="flex gap-5 items-start">
                        <item.icon className="w-6 h-6 text-primary shrink-0 mt-1" />
                        <div>
                          <h4 className="text-h3 text-foreground mb-2">{item.title}</h4>
                          <p className="text-body-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FREE TOOLS ═══════ */}
      <section className="relative py-16 md:py-36">
        <div className="container relative z-10">
          <ScrollReveal>
            <span className="text-overline text-primary mb-5 block">Free tools</span>
            <h2 className="text-h1 text-foreground mb-14 max-w-[30ch]">Try before you buy.</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ScrollReveal>
              <Link to="/tools/ai-visibility-checker" className="block rounded-[16px] wd-glass p-10 h-full group hover:border-primary/20 transition-all duration-300">
                <Brain className="w-10 h-10 text-primary mb-5" />
                <h3 className="text-h2 text-foreground mb-4">AI visibility audit</h3>
                <p className="text-body text-muted-foreground mb-8">Find out if your brand is being cited by ChatGPT, Gemini, Perplexity, Copilot & Claude. See your score across all 5 platforms.</p>
                <span className="inline-flex items-center gap-2 text-primary text-[13px] font-bold tracking-[0.05em] uppercase group-hover:gap-3 transition-all duration-200">
                  Check your brand <ArrowRight size={16} />
                </span>
              </Link>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <Link to="/tools/backlink-checker" className="block rounded-[16px] wd-glass p-10 h-full group hover:border-primary/20 transition-all duration-300">
                <Link2 className="w-10 h-10 text-primary mb-5" />
                <h3 className="text-h2 text-foreground mb-4">Backlink value checker</h3>
                <p className="text-body text-muted-foreground mb-8">Paste any URL to get an instant AI analysis of its backlink value — domain authority, spam risk, content quality, and estimated link worth.</p>
                <span className="inline-flex items-center gap-2 text-primary text-[13px] font-bold tracking-[0.05em] uppercase group-hover:gap-3 transition-all duration-200">
                  Check a backlink <ArrowRight size={16} />
                </span>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <FAQSection faqs={faqs} />

      {/* ═══════ CTA (DARK) ═══════ */}
      <CTASection />
    </main>
  );
};

export default Index;
