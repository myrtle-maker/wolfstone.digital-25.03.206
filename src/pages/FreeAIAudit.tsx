import { useState } from "react";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import { supabase } from "@/integrations/supabase/client";
import { Search, ArrowRight, AlertTriangle, CheckCircle, XCircle, MinusCircle, Loader2, Brain, Shield, BarChart3, Zap } from "lucide-react";
import { toast } from "sonner";

interface Platform { name: string; score: number; status: "strong" | "moderate" | "weak" | "not found"; detail: string; }
interface Recommendation { priority: "high" | "medium" | "low"; action: string; impact: string; }
interface AnalysisResult { brandName: string; overallScore: number; summary: string; platforms: Platform[]; strengths: string[]; weaknesses: string[]; recommendations: Recommendation[]; competitorContext: string; }

const statusConfig = {
  strong: { icon: CheckCircle, color: "text-emerald-400", border: "border-emerald-400/30" },
  moderate: { icon: MinusCircle, color: "text-amber-400", border: "border-amber-400/30" },
  weak: { icon: AlertTriangle, color: "text-orange-400", border: "border-orange-400/30" },
  "not found": { icon: XCircle, color: "text-red-400", border: "border-red-400/30" },
};
const priorityConfig = { high: { color: "text-red-400", bg: "bg-red-400/10" }, medium: { color: "text-amber-400", bg: "bg-amber-400/10" }, low: { color: "text-emerald-400", bg: "bg-emerald-400/10" } };
const getScoreColor = (s: number) => s >= 70 ? "text-emerald-400" : s >= 40 ? "text-amber-400" : "text-red-400";
const getScoreRing = (s: number) => s >= 70 ? "from-emerald-400 to-emerald-500" : s >= 40 ? "from-amber-400 to-amber-500" : "from-red-400 to-red-500";

const jsonLd = [
  { "@context": "https://schema.org", "@type": "Service", name: "Free AI Visibility Audit", provider: { "@type": "Organization", name: "Wolfstone Digital" }, description: "Free AI visibility audit across ChatGPT, Gemini, Perplexity, Copilot and Claude." },
  { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://wolfstonedigital.co.uk/" },
    { "@type": "ListItem", position: 2, name: "Free AI Visibility Audit", item: "https://wolfstonedigital.co.uk/free-ai-visibility-audit/" },
  ]},
  { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [
    { "@type": "Question", name: "How do I check if my brand is cited by AI?", acceptedAnswer: { "@type": "Answer", text: "Use our free AI visibility audit tool. Enter your brand name and we'll analyse your visibility across ChatGPT, Gemini, Perplexity, Copilot, and Claude in seconds." } },
    { "@type": "Question", name: "Is the AI visibility audit really free?", acceptedAnswer: { "@type": "Answer", text: "Yes. The audit is completely free with no obligation. We'll analyse your brand across 5 major AI platforms and show you exactly where you stand." } },
  ]},
];

const FreeAIAudit = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [brand, setBrand] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim() || !name.trim() || !email.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Please enter a valid email address"); return; }
    setLoading(true); setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("llm-checker", {
        body: { brandName: brand.trim(), website: website.trim() || undefined, name: name.trim(), email: email.trim() },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      setResult(data as AnalysisResult);
    } catch { toast.error("Analysis failed. Please try again."); } finally { setLoading(false); }
  };

  const inputClass = "w-full border border-wd-navy/10 rounded-md px-4 py-3 text-wd-navy placeholder:text-[#4A6080]/50 focus:outline-none focus:border-wd-blue/40 focus:ring-1 focus:ring-wd-blue/20 transition-colors text-body bg-white";

  return (
    <main className="pt-20">
      <SEOHead title="Free AI Visibility Audit | Is Your Brand Cited by AI? | Wolfstone Digital" description="Find out if your brand is being cited by ChatGPT, Gemini & Perplexity. Free AI visibility audit from the team that built a brand AI recommends over billion-dollar competitors." canonical="/free-ai-visibility-audit/" jsonLd={jsonLd} />

      <section className="bg-wd-navy py-20 md:py-28">
        <div className="container">
          <Breadcrumbs items={[{ label: "Free AI visibility audit" }]} />
          <ScrollReveal><span className="text-overline text-primary mb-4 block">Free tool</span></ScrollReveal>
          <ScrollReveal delay={0.1}><h1 className="text-display max-w-[18ch] mb-6">Is your brand being cited by AI?</h1></ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-wd-muted max-ch-70 mb-4">If you don't know, it probably isn't.</p>
            <p className="text-body text-wd-muted max-ch-70">77% of ChatGPT users treat it as a search engine. Enter your brand below and we'll analyse your visibility across ChatGPT, Gemini, Perplexity, Copilot, and Claude — instantly and for free.</p>
          </ScrollReveal>
        </div>
      </section>

      <section className="bg-wd-ice py-20 md:py-28" id="audit-form">
        <div className="container">
          {!result && !loading && (
            <ScrollReveal>
              <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white rounded-[16px] p-8 shadow-xl shadow-wd-navy/5 border border-wd-navy/[0.06]">
                <h2 className="text-h2 text-wd-navy mb-6 text-center">Get your free AI visibility report</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div><label className="text-overline text-[#4A6080] block mb-2">Your name *</label><input type="text" className={inputClass} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required /></div>
                  <div><label className="text-overline text-[#4A6080] block mb-2">Email *</label><input type="email" className={inputClass} placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} required /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div><label className="text-overline text-[#4A6080] block mb-2">Brand name *</label><input type="text" className={inputClass} placeholder="Your brand" value={brand} onChange={(e) => setBrand(e.target.value)} maxLength={100} required /></div>
                  <div><label className="text-overline text-[#4A6080] block mb-2">Website URL</label><input type="text" className={inputClass} placeholder="yoursite.com (optional)" value={website} onChange={(e) => setWebsite(e.target.value)} maxLength={200} /></div>
                </div>
                <button type="submit" disabled={loading || !brand.trim() || !name.trim() || !email.trim()} className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-wd-navy text-white text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-wd-midnight transition-colors duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed">
                  <Search size={16} /> Get your free AI visibility report
                </button>
                <p className="text-xs text-[#4A6080]/60 text-center mt-3">Powered by the team behind the most AI-cited independent finance source amongst our competitors</p>
              </form>
            </ScrollReveal>
          )}

          {loading && (
            <div className="text-center">
              <div className="inline-flex flex-col items-center gap-4">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-2 border-wd-blue/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-wd-blue border-t-transparent animate-spin" />
                  <Brain className="absolute inset-0 m-auto w-8 h-8 text-wd-blue" />
                </div>
                <p className="text-body-lg text-wd-navy">Scanning AI platforms for <span className="font-bold">{brand}</span>...</p>
                <p className="text-body-sm text-[#4A6080]">This typically takes 10–15 seconds</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {result && !loading && (
        <>
          <section className="bg-wd-navy py-16 md:py-24">
            <div className="container">
              <ScrollReveal>
                <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                  <div className="relative">
                    <div className={`w-40 h-40 rounded-full bg-gradient-to-br ${getScoreRing(result.overallScore)} p-[3px]`}>
                      <div className="w-full h-full rounded-full bg-wd-navy flex items-center justify-center flex-col">
                        <span className={`text-[3.5rem] font-black leading-none ${getScoreColor(result.overallScore)}`}>{result.overallScore}</span>
                        <span className="text-overline text-wd-muted mt-1">/ 100</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-h1 mb-3">AI visibility report: <span className="text-primary">{result.brandName}</span></h2>
                    <p className="text-body-lg text-wd-muted max-ch-70">{result.summary}</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>

          <section className="bg-wd-midnight py-16 md:py-20">
            <div className="container">
              <ScrollReveal><h3 className="text-h2 mb-8">Platform breakdown</h3></ScrollReveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {result.platforms.map((p, i) => {
                  const cfg = statusConfig[p.status]; const Icon = cfg.icon;
                  return (
                    <ScrollReveal key={p.name} delay={i * 0.06}>
                      <div className={`bg-card border ${cfg.border} rounded-[12px] p-5 h-full`}>
                        <div className="flex items-center gap-2 mb-3"><Icon className={`w-5 h-5 ${cfg.color}`} /><span className="text-overline text-wd-muted">{p.name}</span></div>
                        <div className={`text-[2rem] font-black leading-none mb-2 ${getScoreColor(p.score)}`}>{p.score}</div>
                        <p className="text-body-sm text-wd-muted">{p.detail}</p>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="bg-wd-navy py-16 md:py-20">
            <div className="container grid grid-cols-1 md:grid-cols-2 gap-8">
              <ScrollReveal>
                <div className="bg-card border border-emerald-400/20 rounded-[12px] p-6">
                  <div className="flex items-center gap-2 mb-4"><CheckCircle className="w-5 h-5 text-emerald-400" /><h3 className="text-h3">Strengths</h3></div>
                  <ul className="space-y-3">{result.strengths.map((s, i) => (<li key={i} className="flex gap-3 items-start"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" /><span className="text-body-sm text-wd-muted">{s}</span></li>))}</ul>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <div className="bg-card border border-red-400/20 rounded-[12px] p-6">
                  <div className="flex items-center gap-2 mb-4"><AlertTriangle className="w-5 h-5 text-red-400" /><h3 className="text-h3">Gaps & risks</h3></div>
                  <ul className="space-y-3">{result.weaknesses.map((w, i) => (<li key={i} className="flex gap-3 items-start"><div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" /><span className="text-body-sm text-wd-muted">{w}</span></li>))}</ul>
                </div>
              </ScrollReveal>
            </div>
          </section>

          <section className="bg-wd-midnight py-16 md:py-20">
            <div className="container">
              <ScrollReveal><h3 className="text-h2 mb-8">Recommendations</h3></ScrollReveal>
              <div className="space-y-4">
                {result.recommendations.map((rec, i) => {
                  const pcfg = priorityConfig[rec.priority];
                  return (
                    <ScrollReveal key={i} delay={i * 0.06}>
                      <div className="bg-card border border-primary/[0.15] rounded-[12px] p-6 hover:border-primary/[0.45] transition-colors duration-200">
                        <div className="flex items-start gap-4">
                          <span className={`text-overline px-2 py-1 rounded ${pcfg.bg} ${pcfg.color} shrink-0`}>{rec.priority}</span>
                          <div><h4 className="text-h3 mb-1">{rec.action}</h4><p className="text-body-sm text-wd-muted">{rec.impact}</p></div>
                        </div>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
              <ScrollReveal delay={0.2}>
                <div className="mt-10 text-center">
                  <p className="text-body-lg text-wd-muted mb-6">Want Wolfstone Digital to fix these gaps?</p>
                  <Link to="/contact" className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-accent transition-colors duration-200 active:scale-[0.97]">
                    Book a consultation <ArrowRight size={16} />
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </section>
        </>
      )}

      {!result && !loading && (
        <>
          <section className="bg-wd-navy py-20 md:py-28">
            <div className="container">
              <ScrollReveal><h2 className="text-h1 mb-10">What the audit covers</h2></ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Search, title: "Citation presence", desc: "Is your brand being mentioned and cited by major AI models?" },
                  { icon: Shield, title: "Information accuracy", desc: "Is the AI providing correct information about your brand?" },
                  { icon: BarChart3, title: "Recommendation rate", desc: "Are LLMs recommending your brand when users ask for options?" },
                  { icon: Zap, title: "Competitive position", desc: "How does your AI visibility compare to competitors?" },
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

          <section className="bg-wd-midnight py-16 md:py-20">
            <div className="container text-center">
              <ScrollReveal>
                <p className="text-body-lg text-wd-muted mb-2">Powered by the team behind</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
                  {[
                    { value: "#1", label: "Most cited vs. competitors" },
                    { value: "5", label: "AI platforms citing us" },
                    { value: "900+", label: "Clients delivered" },
                    { value: "100x", label: "Outperforming bigger budgets" },
                  ].map((s, i) => (
                    <div key={i}>
                      <div className="text-[clamp(1.75rem,3vw,2.5rem)] font-black leading-none text-accent mb-2">{s.value}</div>
                      <div className="text-overline text-wd-muted">{s.label}</div>
                    </div>
                  ))}
                </div>
                <Link to="/contact" className="text-primary hover:text-accent transition-colors text-body font-bold mt-6 inline-block">Book a consultation →</Link>
              </ScrollReveal>
            </div>
          </section>
        </>
      )}
    </main>
  );
};

export default FreeAIAudit;
