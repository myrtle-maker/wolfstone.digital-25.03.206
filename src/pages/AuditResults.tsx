import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import LLMScanAnimation from "@/components/LLMScanAnimation";
import { supabase } from "@/integrations/supabase/client";
import {
  Brain, ArrowRight, AlertTriangle, CheckCircle, XCircle, MinusCircle,
  Lock, Mail, Loader2
} from "lucide-react";
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

const AuditResults = () => {
  const [searchParams] = useSearchParams();
  const brand = searchParams.get("brand") || "";
  const website = searchParams.get("website") || "";

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!brand) return;
    const runAnalysis = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("llm-checker", {
          body: { brandName: brand, website: website || undefined },
        });
        if (error) throw error;
        if (data?.error) { toast.error(data.error); return; }
        setResult(data as AnalysisResult);
      } catch {
        toast.error("Analysis failed. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    runAnalysis();
  }, [brand, website]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Please enter a valid email address"); return; }

    setSubmitting(true);
    try {
      // Store the lead with the results
      const { error } = await supabase.functions.invoke("llm-checker", {
        body: { brandName: brand, website: website || undefined, name: name.trim(), email: email.trim() },
      });
      // Even if this secondary call fails, unlock the results since we already have them
      if (error) console.error("Lead storage call failed:", error);
    } catch {
      console.error("Lead storage failed");
    } finally {
      setSubmitting(false);
      setUnlocked(true);
      toast.success("Report unlocked! We'll also email you a copy.");
    }
  };

  if (!brand) {
    return (
      <main className="pt-20">
        <section className="bg-wd-navy py-32">
          <div className="container text-center">
            <h1 className="text-h1 mb-4">No brand specified</h1>
            <p className="text-body-lg text-wd-muted mb-8">Head back to the homepage to run your free AI visibility audit.</p>
            <Link to="/" className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-accent transition-colors duration-200">
              Go to homepage <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="pt-20">
      <SEOHead title={`AI Visibility Report: ${brand} | Wolfstone Digital`} description={`Free AI visibility audit results for ${brand}. See how your brand performs across ChatGPT, Gemini, Perplexity, Copilot and Claude.`} canonical="/tools/ai-visibility-checker/results/" />

      {/* Loading state — animated LLM scanning */}
      {loading && (
        <section className="bg-wd-navy py-32 min-h-[70vh] flex items-center">
          <div className="container">
            <LLMScanAnimation brandName={brand} isScanning={loading} />
          </div>
        </section>
      )}

      {/* Results */}
      {result && !loading && (
        <>
          {/* Score header — always visible */}
          <section className="bg-wd-navy pt-10 pb-6 md:pt-14 md:pb-8">
            <div className="container">
              <ScrollReveal>
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                  <div className="relative">
                    <div className={`w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br ${getScoreRing(result.overallScore)} p-[3px]`}>
                      <div className="w-full h-full rounded-full bg-wd-navy flex items-center justify-center flex-col">
                        <span className={`text-[2.5rem] md:text-[3rem] font-black leading-none ${getScoreColor(result.overallScore)}`}>{result.overallScore}</span>
                        <span className="text-overline text-wd-muted mt-0.5 text-[10px]">/ 100</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-h2 md:text-h1 mb-2">AI visibility report: <span className="text-primary">{result.brandName}</span></h1>
                    <p className="text-body text-wd-muted max-ch-70">{result.summary}</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Platform breakdown — compact row */}
          <section className="bg-wd-midnight py-6 md:py-8">
            <div className="container">
              <ScrollReveal><h2 className="text-h3 mb-4">Platform breakdown</h2></ScrollReveal>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {result.platforms.map((p, i) => {
                  const cfg = statusConfig[p.status]; const Icon = cfg.icon;
                  return (
                    <ScrollReveal key={p.name} delay={i * 0.04}>
                      <div className={`bg-card border ${cfg.border} rounded-[10px] p-3 md:p-4 h-full`}>
                        <div className="flex items-center gap-1.5 mb-2"><Icon className={`w-4 h-4 ${cfg.color}`} /><span className="text-[10px] uppercase tracking-wider text-wd-muted">{p.name}</span></div>
                        <div className={`text-[1.5rem] md:text-[1.75rem] font-black leading-none mb-1 ${getScoreColor(p.score)}`}>{p.score}</div>
                        <p className="text-[11px] leading-snug text-wd-muted line-clamp-2">{p.detail}</p>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>
          </section>

          {/* EMAIL GATE — if not unlocked, show blurred preview + form */}
          {!unlocked ? (
            <section className="bg-wd-navy py-8 md:py-12 relative">
              <div className="container">
                {/* Blurred preview of strengths/weaknesses */}
                <div className="relative mb-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 blur-[6px] select-none pointer-events-none" aria-hidden="true">
                    <div className="bg-card border border-emerald-400/20 rounded-[12px] p-6">
                      <div className="flex items-center gap-2 mb-4"><CheckCircle className="w-5 h-5 text-emerald-400" /><h3 className="text-h3">Strengths</h3></div>
                      <ul className="space-y-3">{result.strengths.map((s, i) => (<li key={i} className="flex gap-3 items-start"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" /><span className="text-body-sm text-wd-muted">{s}</span></li>))}</ul>
                    </div>
                    <div className="bg-card border border-red-400/20 rounded-[12px] p-6">
                      <div className="flex items-center gap-2 mb-4"><AlertTriangle className="w-5 h-5 text-red-400" /><h3 className="text-h3">Gaps & risks</h3></div>
                      <ul className="space-y-3">{result.weaknesses.map((w, i) => (<li key={i} className="flex gap-3 items-start"><div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" /><span className="text-body-sm text-wd-muted">{w}</span></li>))}</ul>
                    </div>
                  </div>

                  {/* Unlock overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-wd-midnight/95 backdrop-blur-sm border border-primary/20 rounded-[16px] p-8 md:p-10 max-w-lg w-full mx-4 shadow-2xl">
                      <div className="text-center mb-6">
                        <Lock className="w-10 h-10 text-primary mx-auto mb-4" />
                        <h3 className="text-h2 mb-2">Unlock your full report</h3>
                        <p className="text-body-sm text-wd-muted">Enter your details to see strengths, gaps, and actionable recommendations. We'll also email you a copy.</p>
                      </div>
                      <form onSubmit={handleUnlock} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input type="text" className="w-full border border-white/10 rounded-md px-4 py-3 text-foreground placeholder:text-wd-muted/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors text-body bg-white/5" placeholder="Your name *" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required />
                          <input type="email" className="w-full border border-white/10 rounded-md px-4 py-3 text-foreground placeholder:text-wd-muted/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors text-body bg-white/5" placeholder="you@company.com *" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} required />
                        </div>
                        <input type="text" className="w-full border border-white/10 rounded-md px-4 py-3 text-foreground placeholder:text-wd-muted/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors text-body bg-white/5" placeholder="Company *" value={company} onChange={(e) => setCompany(e.target.value)} maxLength={100} required />
                        <input type="text" className="w-full border border-white/10 rounded-md px-4 py-3 text-foreground placeholder:text-wd-muted/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors text-body bg-white/5" placeholder="Where are you based? e.g. London, UK" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={100} />
                        <button type="submit" disabled={submitting || !name.trim() || !email.trim() || !company.trim()} className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-accent transition-colors duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed">
                          {submitting ? (<><Loader2 size={16} className="animate-spin" /> Unlocking...</>) : (<><Mail size={16} /> Get full report</>)}
                        </button>
                      </form>
                      <p className="text-xs text-wd-muted/50 text-center mt-3">No spam. Just your report.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <>
              {/* Full results — unlocked */}
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
        </>
      )}
    </main>
  );
};

export default AuditResults;
