import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import {
  Globe, ArrowRight, AlertTriangle, CheckCircle, XCircle,
  Lock, Mail, Loader2, Code2, Heading, FileJson, Search,
  Image, Link2, Eye, FileCode, ShieldCheck, Info
} from "lucide-react";
import { toast } from "sonner";

interface Metric { score: number; detail: string; htmlSizeKB?: number; h1Count?: number; totalHeadings?: number; schemaTypes?: string[]; totalImages?: number; missingAlt?: number; ratio?: number; }
interface Issue { issue: string; severity: "critical" | "warning" | "info"; fix: string; }
interface QuickWin { action: string; impact: "high" | "medium" | "low"; effort: "easy" | "moderate" | "hard"; }
interface CrawlabilityResult {
  url: string; domain: string; overallScore: number;
  verdict: "excellent" | "good" | "needs-work" | "poor" | "critical";
  summary: string;
  metrics: {
    htmlStructure: Metric; headingHierarchy: Metric; semanticHtml: Metric;
    structuredData: Metric; contentQuality: Metric; metaTags: Metric;
    imageOptimisation: Metric; contentToCodeRatio: Metric; internalLinking: Metric;
    crawlAccessibility: Metric;
  };
  issues: Issue[];
  strengths: string[];
  quickWins: QuickWin[];
}

const verdictConfig = {
  excellent: { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30", label: "Excellent" },
  good: { color: "text-emerald-300", bg: "bg-emerald-300/10", border: "border-emerald-300/30", label: "Good" },
  "needs-work": { color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30", label: "Needs Work" },
  poor: { color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/30", label: "Poor" },
  critical: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30", label: "Critical" },
};

const severityConfig = {
  critical: { color: "text-red-400", bg: "bg-red-400/10", icon: XCircle },
  warning: { color: "text-amber-400", bg: "bg-amber-400/10", icon: AlertTriangle },
  info: { color: "text-sky-400", bg: "bg-sky-400/10", icon: Info },
};

const impactConfig = { high: { color: "text-red-400", bg: "bg-red-400/10" }, medium: { color: "text-amber-400", bg: "bg-amber-400/10" }, low: { color: "text-emerald-400", bg: "bg-emerald-400/10" } };
const effortConfig = { easy: "text-emerald-400", moderate: "text-amber-400", hard: "text-red-400" };

const getScoreColor = (s: number) => s >= 70 ? "text-emerald-400" : s >= 40 ? "text-amber-400" : "text-red-400";
const getScoreRing = (s: number) => s >= 70 ? "from-emerald-400 to-emerald-500" : s >= 40 ? "from-amber-400 to-amber-500" : "from-red-400 to-red-500";
const getScoreBg = (s: number) => s >= 70 ? "bg-emerald-400/10" : s >= 40 ? "bg-amber-400/10" : "bg-red-400/10";

const metricIcons: Record<string, any> = {
  htmlStructure: FileCode, headingHierarchy: Heading, semanticHtml: Code2,
  structuredData: FileJson, contentQuality: Eye, metaTags: Search,
  imageOptimisation: Image, contentToCodeRatio: FileCode, internalLinking: Link2,
  crawlAccessibility: ShieldCheck,
};

const metricLabels: Record<string, string> = {
  htmlStructure: "HTML Structure", headingHierarchy: "Heading Hierarchy", semanticHtml: "Semantic HTML",
  structuredData: "Structured Data", contentQuality: "Content Quality", metaTags: "Meta Tags",
  imageOptimisation: "Image Optimisation", contentToCodeRatio: "Content:Code Ratio", internalLinking: "Internal Linking",
  crawlAccessibility: "Crawl Access",
};

const MetricCard = ({ metricKey, metric }: { metricKey: string; metric: Metric }) => {
  const Icon = metricIcons[metricKey] || Search;
  const label = metricLabels[metricKey] || metricKey;
  return (
    <div className="bg-card border border-primary/[0.15] rounded-[12px] p-5 hover:border-primary/[0.45] transition-colors duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="text-overline text-wd-muted">{label}</span>
        </div>
        <span className={`text-[1.5rem] font-black leading-none ${getScoreColor(metric.score)}`}>{metric.score}</span>
      </div>
      <div className="w-full bg-white/5 rounded-full h-1.5 mb-3">
        <div className={`h-1.5 rounded-full ${getScoreBg(metric.score).replace('/10', '/60')}`} style={{ width: `${metric.score}%` }} />
      </div>
      <p className="text-body-sm text-wd-muted">{metric.detail}</p>
      {metric.htmlSizeKB !== undefined && <p className="text-xs text-wd-muted/60 mt-1">{metric.htmlSizeKB}KB HTML size</p>}
      {metric.h1Count !== undefined && <p className="text-xs text-wd-muted/60 mt-1">{metric.h1Count} H1 tag{metric.h1Count !== 1 ? "s" : ""}, {metric.totalHeadings} total headings</p>}
      {metric.schemaTypes && metric.schemaTypes.length > 0 && <p className="text-xs text-wd-muted/60 mt-1">Schema: {metric.schemaTypes.join(", ")}</p>}
      {metric.totalImages !== undefined && <p className="text-xs text-wd-muted/60 mt-1">{metric.totalImages} images, {metric.missingAlt} missing alt text</p>}
      {metric.ratio !== undefined && <p className="text-xs text-wd-muted/60 mt-1">{metric.ratio}% content-to-code ratio</p>}
    </div>
  );
};

const CrawlabilityResults = () => {
  const [searchParams] = useSearchParams();
  const urlParam = searchParams.get("url") || "";

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<CrawlabilityResult | null>(null);
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
        const { data, error } = await supabase.functions.invoke("crawlability-checker", {
          body: { url: urlParam },
        });
        if (error) throw error;
        if (data?.error) { toast.error(data.error); return; }
        setResult(data as CrawlabilityResult);
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
      await supabase.functions.invoke("crawlability-checker", {
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
            <p className="text-body-lg text-wd-muted mb-8">Head to the AI crawlability checker to analyse a URL.</p>
            <Link to="/tools/ai-crawlability-checker" className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-accent transition-colors duration-200">
              Go to checker <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="pt-20">
      <SEOHead title="AI Crawlability Report | Wolfstone Digital" description="AI-powered crawlability analysis with heading hierarchy, semantic HTML, structured data, and actionable recommendations." canonical="/tools/ai-crawlability-checker/results/" />

      {/* Loading */}
      {loading && (
        <section className="bg-wd-navy py-32 min-h-[70vh] flex items-center">
          <div className="container text-center">
            <div className="inline-flex flex-col items-center gap-6">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <Globe className="absolute inset-0 m-auto w-10 h-10 text-primary" />
              </div>
              <div>
                <p className="text-h2 mb-2">Analysing crawlability of</p>
                <p className="text-body text-primary break-all max-w-lg">{urlParam}</p>
                <p className="text-body-sm text-wd-muted mt-3">Scraping the page, checking HTML structure, heading hierarchy, schema markup...</p>
                <p className="text-body-sm text-wd-muted mt-1">This typically takes 15–30 seconds</p>
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
                    <span className={`text-overline px-3 py-1 rounded inline-block mb-3 ${verdictConfig[result.verdict]?.bg || "bg-amber-400/10"} ${verdictConfig[result.verdict]?.color || "text-amber-400"}`}>
                      {verdictConfig[result.verdict]?.label || result.verdict}
                    </span>
                    <h1 className="text-h1 mb-3">Crawlability report: <span className="text-primary break-all">{result.domain}</span></h1>
                    <p className="text-body-lg text-wd-muted">{result.summary}</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Metrics grid — always visible */}
          <section className="bg-wd-midnight py-16 md:py-20">
            <div className="container">
              <ScrollReveal><h2 className="text-h2 mb-8">Metric breakdown</h2></ScrollReveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {Object.entries(result.metrics).map(([key, metric], i) => (
                  <ScrollReveal key={key} delay={i * 0.05}>
                    <MetricCard metricKey={key} metric={metric} />
                  </ScrollReveal>
                ))}
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
                      <div className="flex items-center gap-2 mb-4"><CheckCircle className="w-5 h-5 text-emerald-400" /><h3 className="text-h3">Strengths</h3></div>
                      <ul className="space-y-3">{result.strengths.map((s, i) => (<li key={i} className="flex gap-3 items-start"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" /><span className="text-body-sm text-wd-muted">{s}</span></li>))}</ul>
                    </div>
                    <div className="bg-card border border-red-400/20 rounded-[12px] p-6">
                      <div className="flex items-center gap-2 mb-4"><AlertTriangle className="w-5 h-5 text-red-400" /><h3 className="text-h3">Issues found</h3></div>
                      <ul className="space-y-3">{result.issues.slice(0, 4).map((issue, i) => (<li key={i} className="flex gap-3 items-start"><div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" /><span className="text-body-sm text-wd-muted">{issue.issue}</span></li>))}</ul>
                    </div>
                  </div>

                  {/* Unlock overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-wd-midnight/95 backdrop-blur-sm border border-primary/20 rounded-[16px] p-8 md:p-10 max-w-lg w-full mx-4 shadow-2xl">
                      <div className="text-center mb-6">
                        <Lock className="w-10 h-10 text-primary mx-auto mb-4" />
                        <h3 className="text-h2 mb-2">Unlock full report</h3>
                        <p className="text-body-sm text-wd-muted">See all issues, strengths, and quick-win recommendations for this page.</p>
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
              {/* Unlocked: strengths + issues */}
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
                      <div className="flex items-center gap-2 mb-4"><AlertTriangle className="w-5 h-5 text-red-400" /><h3 className="text-h3">Issues found</h3></div>
                      <ul className="space-y-4">
                        {result.issues.map((issue, i) => {
                          const sev = severityConfig[issue.severity];
                          const SevIcon = sev.icon;
                          return (
                            <li key={i} className="space-y-1">
                              <div className="flex items-start gap-2">
                                <SevIcon className={`w-4 h-4 shrink-0 mt-0.5 ${sev.color}`} />
                                <span className="text-body-sm font-medium">{issue.issue}</span>
                              </div>
                              <p className="text-xs text-wd-muted/70 pl-6">Fix: {issue.fix}</p>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </ScrollReveal>
                </div>
              </section>

              {/* Unlocked: quick wins */}
              <section className="bg-wd-midnight py-16 md:py-20">
                <div className="container">
                  <ScrollReveal><h3 className="text-h2 mb-8">Quick wins</h3></ScrollReveal>
                  <div className="space-y-4">
                    {result.quickWins.map((win, i) => {
                      const icfg = impactConfig[win.impact];
                      return (
                        <ScrollReveal key={i} delay={i * 0.06}>
                          <div className="bg-card border border-primary/[0.15] rounded-[12px] p-6 hover:border-primary/[0.45] transition-colors duration-200">
                            <div className="flex items-start gap-4">
                              <div className="flex gap-2 shrink-0">
                                <span className={`text-overline px-2 py-1 rounded ${icfg.bg} ${icfg.color}`}>{win.impact} impact</span>
                                <span className={`text-overline px-2 py-1 rounded bg-white/5 ${effortConfig[win.effort]}`}>{win.effort}</span>
                              </div>
                              <p className="text-body">{win.action}</p>
                            </div>
                          </div>
                        </ScrollReveal>
                      );
                    })}
                  </div>
                  <ScrollReveal delay={0.2}>
                    <div className="mt-10 text-center">
                      <p className="text-body-lg text-wd-muted mb-6">Need help making your site AI-ready?</p>
                      <Link to="/services/geo" className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-accent transition-colors duration-200 active:scale-[0.97]">
                        Our GEO services <ArrowRight size={16} />
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

export default CrawlabilityResults;
