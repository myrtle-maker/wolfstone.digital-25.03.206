import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";
import { Brain, Eye, BarChart3, Megaphone } from "lucide-react";

const faqs = [
  { question: "What is LLM brand exposure?", answer: "LLM brand exposure is the practice of increasing your brand's visibility, citation rate, and recommendation frequency within large language models like ChatGPT, Gemini, Perplexity, Copilot, and Claude. It's a proprietary discipline pioneered by Wolfstone Digital." },
  { question: "How do I track AI mentions of my brand?", answer: "We monitor citation rates, recommendation frequency, and brand sentiment across every major LLM on a weekly basis. Our reporting shows exactly where your brand appears, what's being said, and how you compare to competitors." },
  { question: "Which LLMs cite brands?", answer: "All major LLMs cite brands in their responses: ChatGPT, Google Gemini, Perplexity, Microsoft Copilot, and Claude. Each has different training data and retrieval methods, which is why cross-platform optimisation is essential." },
  { question: "How is LLM brand exposure different from GEO?", answer: "GEO is the broader discipline of optimising for AI search. LLM brand exposure is our proprietary methodology within GEO — the specific tactics we use to get brands cited and recommended. Think of GEO as the field, and LLM brand exposure as our approach to winning in it." },
  { question: "Can you guarantee AI citations?", answer: "We don't make guarantees — anyone who does is lying. What we can show is proof: our own finance brand is the most AI-cited independent source amongst our competitors across every major LLM — recommended ahead of billion-dollar competitors — built using the same methodology we apply to partner brands." },
];

const jsonLd = [
  { "@context": "https://schema.org", "@type": "Service", name: "LLM Brand Exposure", provider: { "@type": "Organization", name: "Wolfstone Digital" }, description: "Proprietary tactics to get your brand recommended by ChatGPT, Gemini, Perplexity, Copilot and Claude.", areaServed: "GB" },
  { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://wolfstonedigital.co.uk/" },
    { "@type": "ListItem", position: 2, name: "Services", item: "https://wolfstonedigital.co.uk/services/" },
    { "@type": "ListItem", position: 3, name: "LLM Brand Exposure", item: "https://wolfstonedigital.co.uk/services/llm-brand-exposure/" },
  ]},
  { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) },
];

const LLMBrandExposurePage = () => (
  <main className="pt-20">
    <SEOHead title="LLM Brand Exposure | Get Cited by ChatGPT, Gemini & AI | Wolfstone Digital" description="Proprietary tactics to get your brand recommended by LLMs. We built the most AI-cited independent finance source on the internet. Now we deploy the same methodology for partners." canonical="/services/llm-brand-exposure/" jsonLd={jsonLd} />

    <section className="bg-wd-navy wd-ambient-glow py-20 md:py-28">
      <div className="container">
        <Breadcrumbs items={[{ label: "Services", path: "/services" }, { label: "LLM brand exposure" }]} />
        <ScrollReveal><span className="text-overline text-primary mb-4 block">LLM brand exposure</span></ScrollReveal>
        <ScrollReveal delay={0.1}><h1 className="text-display max-w-[20ch] mb-6">LLM brand exposure: get your brand into AI conversations</h1></ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="text-body-lg text-wd-muted max-ch-70">
            Our own finance brand is the most AI-cited independent source amongst our competitors across ChatGPT, Gemini, Perplexity, Copilot, and Claude. We developed the methodology in the real world. No one else has it.
          </p>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-wd-ice py-20 md:py-28">
      <div className="container">
        <ScrollReveal><h2 className="text-h1 text-wd-navy mb-6">The shift from search to AI recommendations</h2></ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="text-body-lg text-[#4A6080] max-ch-70 mb-6">
            Consumers are changing how they discover brands. Instead of searching Google and clicking through results, they're asking ChatGPT "What's the best broker?", asking Gemini "Which law firm should I use?", asking Perplexity to compare products. The brands that get cited win. The brands that don't, lose market share.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { value: "900M+", label: "Weekly ChatGPT users" },
              { value: "77%", label: "Treat ChatGPT as search" },
              { value: "357%", label: "YoY AI referral traffic growth" },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-wd-navy/[0.06] rounded-[12px] p-5 text-center shadow-sm">
                <div className="text-[clamp(1.75rem,3vw,2.5rem)] font-black leading-none text-wd-blue mb-2">{s.value}</div>
                <div className="text-overline text-[#4A6080]">{s.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-wd-navy wd-ambient-glow py-20 md:py-28">
      <div className="container">
        <ScrollReveal><h2 className="text-h1 mb-6">Why most brands are invisible to AI</h2></ScrollReveal>
        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Crawl budget waste", desc: "LLM crawlers have a limited crawl budget. If your content isn't structured for easy extraction, it won't get indexed — regardless of quality." },
              { title: "Missing entity signals", desc: "AI models decide which brands to cite based on entity authority signals. Most brands don't have these signals, so they're never recommended." },
              { title: "Platform-blind strategy", desc: "ChatGPT, Gemini, and Perplexity each use different retrieval methods. Optimising for one doesn't mean you're visible on others." },
            ].map((item, i) => (
              <div key={i} className="wd-glow-card p-6 h-full">
                <h3 className="text-h3 mb-3">{item.title}</h3>
                <p className="text-body-sm text-wd-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-wd-midnight py-20 md:py-28">
      <div className="container">
        <ScrollReveal>
          <h2 className="text-h1 mb-6">Our approach</h2>
          <p className="text-body-lg text-wd-muted max-ch-70 mb-10">
            Our methodology is built from operating our own finance brand in one of the most competitive regulated markets online — not from theory.
          </p>
        </ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: Brain, title: "AI content structure", desc: "Making sure your content is structured so AI platforms can find it, understand it, and recommend it." },
            { icon: Eye, title: "Building recommendation authority", desc: "Strengthening the signals that make AI platforms trust and recommend your brand." },
            { icon: Megaphone, title: "Cross-platform amplification", desc: "Simultaneous optimisation across ChatGPT, Gemini, Perplexity, Copilot, and Claude." },
            { icon: BarChart3, title: "AI share of voice tracking", desc: "Weekly measurement of citation rates, recommendation frequency, and competitive position." },
          ].map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.08}>
              <div className="wd-glow-card p-6 transition-colors duration-200 h-full">
                <item.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-h3 mb-2">{item.title}</h3>
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
          <h2 className="text-h1 mb-6">AI share of voice: the new metric</h2>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <p className="text-body-lg text-wd-muted max-ch-70 mb-6">
            Click-through rate is becoming irrelevant for AI search. When a user asks ChatGPT for a recommendation, there's no SERP to click through. The metric that matters is AI share of voice — how often your brand is cited versus competitors.
          </p>
          <p className="text-body text-wd-muted max-ch-70">
            We track this weekly across every major LLM. It's the clearest indicator of whether your <Link to="/services/geo/" className="text-primary hover:text-accent transition-colors">GEO strategy</Link> is working — and it's the metric your competitors aren't measuring yet.
          </p>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-wd-midnight py-20 md:py-28">
      <div className="container text-center">
        <ScrollReveal><h2 className="text-h1 mb-10">Proof: our own finance brand</h2></ScrollReveal>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
          {[
            { value: "#1", label: "Most AI-cited independent source" },
            { value: "5", label: "AI platforms citing us" },
            { value: "100x", label: "Outperforming bigger budgets" },
            { value: "900+", label: "Clients delivered" },
            { value: "0", label: "Paid placements" },
          ].map((s, i) => (
            <ScrollReveal key={i} delay={i * 0.06}>
              <div className="wd-glow-card p-5">
                <div className="text-[clamp(1.5rem,2.5vw,2rem)] font-black leading-none text-accent mb-2">{s.value}</div>
                <div className="text-overline text-wd-muted">{s.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal delay={0.3}>
          <Link to="/contact" className="text-primary hover:text-accent transition-colors text-body font-bold">Book a consultation to see the full story →</Link>
        </ScrollReveal>
      </div>
    </section>

    <FAQSection faqs={faqs} />
    <CTASection heading="Is your brand being cited by AI?" body="If you don't know, it probably isn't. Get a free AI visibility audit and find out exactly where you stand across every major LLM." buttonLink="/tools/ai-visibility-checker" buttonText="Get your free audit" />
  </main>
);

export default LLMBrandExposurePage;
