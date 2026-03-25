import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import {
  Link2, ArrowRight, AlertTriangle, CheckCircle, XCircle, MinusCircle,
  Lock, Mail, Loader2, Shield, BarChart3, Zap, Eye, ThumbsUp, ThumbsDown, HelpCircle
} from "lucide-react";
import { toast } from "sonner";

interface Metric { score: number; detail: string; linkCount?: number; }
interface Recommendation { action: string; priority: "high" | "medium" | "low"; }
interface BacklinkResult {
  url: string; domain: string; overallScore: number;
  verdict: "excellent" | "good" | "average" | "poor" | "toxic";
  summary: string; estimatedValue: string;
  metrics: {
    domainAuthority: Metric; contentQuality: Metric; outgoingLinkProfile: Metric;
    spamRisk: Metric; trafficPotential: Metric; nicheRelevance: Metric;
  };
  redFlags: string[]; greenFlags: string[];
  recommendations: Recommendation[];
  shouldYouGetThisLink: "yes" | "maybe" | "no" | "avoid";
}

const verdictConfig = {
  excellent: { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30", label: "Excellent" },
  good: { color: "text-emerald-300", bg: "bg-emerald-300/10", border: "border-emerald-300/30", label: "Good" },
  average: { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30", label: "Average" },
  poor: { color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/30", label: "Poor" },
  toxic: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30", label: "Toxic" },
};

const shouldConfig = {
  yes: { icon: ThumbsUp, color: "text-emerald-400", label: "Yes — pursue this link" },
  maybe: { icon: HelpCircle, color: "text-amber-400", label: "Maybe — proceed with caution" },
  no: { icon: ThumbsDown, color: "text-orange-400", label: "No — not worth it" },
  avoid: { icon: XCircle, color: "text-red-400", label: "Avoid — potentially harmful" },
};

const priorityConfig = { high: { color: "text-red-400", bg: "bg-red-400/10" }, medium: { color: "text-amber-400", bg: "bg-amber-400/10" }, low: { color: "text-emerald-400", bg: "bg-emerald-400/10" } };
const getScoreColor = (s: number) => s >= 70 ? "text-emerald-400" : s >= 40 ? "text-amber-400" : "text-red-400";
const getScoreRing = (s: number) => s >= 70 ? "from-emerald-400 to-emerald-500" : s >= 40 ? "from-amber-400 to-amber-500" : "from-red-400 to-red-500";

const MetricCard = ({ label, metric, icon: Icon }: { label: string; metric: Metric; icon: any }) => (
  <div className="bg-card border border-primary/[0.15] rounded-[12px] p-5 hover:border-primary/[0.45] transition-colors duration-200">
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-primary" />
      <span className="text-overline text-wd-muted">{label}</span>
    </div>
    <div className={`text-[2rem] font-black leading-none mb-2 ${getScoreColor(metric.score)}`}>{metric.score}</div>
    <p className="text-body-sm text-wd-muted">{metric.detail}</p>
    {metric.linkCount !== undefined && (
      <p className="text-xs text-wd-muted/60 mt-1">{metric.linkCount} outgoing links detected</p>
    )}
  </div>
);

const BacklinkResults = () => {
  const [searchParams] = useSearchParams();
  const urlParam = searchParams.get("url") || "";

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<BacklinkResult | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!urlParam) return;
    const runAnalysis = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("backlink-checker", {
          body: { url: urlParam },
        });
        if (error) throw error;
        if (data?.error) { toast.error(data.error); return; }
        setResult(data as BacklinkResult);
      } catch {
        toast.error("Analysis failed. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    runAnalysis();
  }, [urlParam]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Please enter a valid email"); return; }

    setSubmitting(true);
    try {
      await supabase.functions.invoke("backlink-checker", {
        body: { url: urlParam, name: name.trim(), email: email.trim() },
      });
    } catch { console.error("Lead storage failed"); }
    finally { setSubmitting(false); setUnlocked(true); toast.success("Report unlocked!"); }
  };

  if (!urlParam) {
    return (
      <main className="pt-20">
        <section className="bg-wd-navy py-32">
          <div className="container text-center">
            <h1 className="text-h1 mb-4">No URL specified</h1>
            <p className="text-body-lg text-wd-muted mb-8">Head to the backlink checker to analyse a URL.</p>
            <Link to="/tools/backlink-checker" className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-accent transition-colors duration-200">
              Go to checker <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="pt-20">
      <SEOHead title="Backlink Value Report | Wolfstone Digital" description="AI-powered backlink value analysis with domain authority, spam risk, content quality, and actionable recommendations." canonical="/tools/backlink-checker/results/" />

      {/* Loading */}
      {loading && (
        <section className="bg-wd-navy py-32 min-h-[70vh] flex items-center">
          <div className="container text-center">
            <div className="inline-flex flex-col items-center gap-6">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <Link2 className="absolute inset-0 m-auto w-10 h-10 text-primary" />
              </div>
              <div>
                <p className="text-h2 mb-2">Analysing backlink from</p>
                <p className="text-body text-primary break-all max-w-lg">{urlParam}</p>
                <p className="text-body-sm text-wd-muted mt-3">Scraping the page, counting links, checking for spam signals...</p>
                <p className="text-body-sm text-wd-muted mt-1">This typically takes 15–25 seconds</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      {result && !loading && (
        <>
          {/* Score + verdict */}
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
                    <div className="flex flex-wrap items-center gap-3 mb-3 justify-center md:justify-start">
                      <span className={`text-overline px-3 py-1 rounded ${verdictConfig[result.verdict].bg} ${verdictConfig[result.verdict].color}`}>
                        {verdictConfig[result.verdict].label}
                      </span>
                      {(() => { const cfg = shouldConfig[result.shouldYouGetThisLink]; const SIcon = cfg.icon; return (
                        <span className={`text-overline flex items-center gap-1.5 ${cfg.color}`}><SIcon className="w-4 h-4" />{cfg.label}</span>
                      ); })()}
                    </div>
                    <h1 className="text-h1 mb-3">Backlink report: <span className="text-primary break-all">{result.domain}</span></h1>
                    <p className="text-body-lg text-wd-muted">{result.summary}</p>
                    <p className="text-body mt-3">Estimated value: <span className="font-bold text-primary">{result.estimatedValue}</span></p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Metrics grid — always visible */}
          <section className="bg-wd-midnight py-16 md:py-20">
            <div className="container">
              <ScrollReveal><h2 className="text-h2 mb-8">Metric breakdown</h2></ScrollReveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <ScrollReveal delay={0}><MetricCard label="Domain authority" metric={result.metrics.domainAuthority} icon={Shield} /></ScrollReveal>
                <ScrollReveal delay={0.06}><MetricCard label="Content quality" metric={result.metrics.contentQuality} icon={Eye} /></ScrollReveal>
                <ScrollReveal delay={0.12}><MetricCard label="Outgoing links" metric={result.metrics.outgoingLinkProfile} icon={Link2} /></ScrollReveal>
                <ScrollReveal delay={0.18}><MetricCard label="Spam risk" metric={result.metrics.spamRisk} icon={AlertTriangle} /></ScrollReveal>
                <ScrollReveal delay={0.24}><MetricCard label="Traffic potential" metric={result.metrics.trafficPotential} icon={BarChart3} /></ScrollReveal>
                <ScrollReveal delay={0.3}><MetricCard label="Niche relevance" metric={result.metrics.nicheRelevance} icon={Zap} /></ScrollReveal>
              </div>
            </div>
          </section>

          {/* Gated section */}
          {!unlocked ? (
            <section className="bg-wd-navy py-16 md:py-24 relative">
              <div className="container">
                <div className="relative mb-12">
                  {/* Blurred preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 blur-[6px] select-none pointer-events-none" aria-hidden="true">
                    <div className="bg-card border border-emerald-400/20 rounded-[12px] p-6">
                      <div className="flex items-center gap-2 mb-4"><CheckCircle className="w-5 h-5 text-emerald-400" /><h3 className="text-h3">Green flags</h3></div>
                      <ul className="space-y-3">{result.greenFlags.map((f, i) => (<li key={i} className="flex gap-3 items-start"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" /><span className="text-body-sm text-wd-muted">{f}</span></li>))}</ul>
                    </div>
                    <div className="bg-card border border-red-400/20 rounded-[12px] p-6">
                      <div className="flex items-center gap-2 mb-4"><AlertTriangle className="w-5 h-5 text-red-400" /><h3 className="text-h3">Red flags</h3></div>
                      <ul className="space-y-3">{result.redFlags.map((f, i) => (<li key={i} className="flex gap-3 items-start"><div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" /><span className="text-body-sm text-wd-muted">{f}</span></li>))}</ul>
                    </div>
                  </div>

                  {/* Unlock overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-wd-midnight/95 backdrop-blur-sm border border-primary/20 rounded-[16px] p-8 md:p-10 max-w-lg w-full mx-4 shadow-2xl">
                      <div className="text-center mb-6">
                        <Lock className="w-10 h-10 text-primary mx-auto mb-4" />
                        <h3 className="text-h2 mb-2">Unlock full analysis</h3>
                        <p className="text-body-sm text-wd-muted">See all red/green flags and actionable recommendations for this backlink.</p>
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
              {/* Unlocked: flags */}
              <section className="bg-wd-navy py-16 md:py-20">
                <div className="container grid grid-cols-1 md:grid-cols-2 gap-8">
                  <ScrollReveal>
                    <div className="bg-card border border-emerald-400/20 rounded-[12px] p-6">
                      <div className="flex items-center gap-2 mb-4"><CheckCircle className="w-5 h-5 text-emerald-400" /><h3 className="text-h3">Green flags</h3></div>
                      <ul className="space-y-3">{result.greenFlags.map((f, i) => (<li key={i} className="flex gap-3 items-start"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" /><span className="text-body-sm text-wd-muted">{f}</span></li>))}</ul>
                    </div>
                  </ScrollReveal>
                  <ScrollReveal delay={0.1}>
                    <div className="bg-card border border-red-400/20 rounded-[12px] p-6">
                      <div className="flex items-center gap-2 mb-4"><AlertTriangle className="w-5 h-5 text-red-400" /><h3 className="text-h3">Red flags</h3></div>
                      <ul className="space-y-3">{result.redFlags.map((f, i) => (<li key={i} className="flex gap-3 items-start"><div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" /><span className="text-body-sm text-wd-muted">{f}</span></li>))}</ul>
                    </div>
                  </ScrollReveal>
                </div>
              </section>

              {/* Unlocked: recommendations */}
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
                              <p className="text-body">{rec.action}</p>
                            </div>
                          </div>
                        </ScrollReveal>
                      );
                    })}
                  </div>
                  <ScrollReveal delay={0.2}>
                    <div className="mt-10 text-center">
                      <p className="text-body-lg text-wd-muted mb-6">Need help building high-quality backlinks?</p>
                      <Link to="/services/backlinks" className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-accent transition-colors duration-200 active:scale-[0.97]">
                        Our backlink services <ArrowRight size={16} />
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

export default BacklinkResults;
