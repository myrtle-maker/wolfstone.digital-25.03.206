import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import {
  Search, ArrowRight, AlertTriangle, CheckCircle, XCircle, MinusCircle,
  Loader2, BarChart3, Shield, Zap, Brain, MessageSquare, Quote, ThumbsUp,
  Eye, EyeOff, Lock, TrendingUp, Target, Award
} from "lucide-react";
import { toast } from "sonner";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────
interface Platform {
  name: string;
  score: number;
  status: "strong" | "moderate" | "weak" | "not found";
  detail: string;
  queriesRun?: number;
  timesFound?: number;
  timesCited?: number;
}

interface Recommendation {
  priority: "high" | "medium" | "low";
  action: string;
  impact: string;
}

interface AhrefsData {
  domainRating: number | null;
  orgTraffic: number | null;
  orgKeywords: number | null;
  refDomains: number | null;
}

interface PromptResultItem {
  platform: string;
  prompt: string;
  status: string;
  snippets: string[];
}

interface AnalysisResult {
  brandName: string;
  overallScore: number;
  summary: string;
  methodology?: string;
  businessInfo?: { industry: string; location: string; services: string[]; description: string };
  platforms: Platform[];
  promptResults?: PromptResultItem[];
  ahrefs?: AhrefsData | null;
  strengths: string[];
  weaknesses: string[];
  recommendations: Recommendation[];
  competitorContext: string;
}

interface PromptResult {
  platform: string;
  response: string;
  status: "cited" | "recommended" | "mentioned" | "absent" | "error";
  snippets: string[];
  error?: string;
}

interface PromptTestResult {
  brandName: string;
  prompt: string;
  results: PromptResult[];
}

// ─── Config maps ──────────────────────────────────────────────────
const statusConfig = {
  strong: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30" },
  moderate: { icon: MinusCircle, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30" },
  weak: { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/30" },
  "not found": { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30" },
};

const priorityConfig = {
  high: { color: "text-red-400", bg: "bg-red-400/10", label: "High priority" },
  medium: { color: "text-amber-400", bg: "bg-amber-400/10", label: "Medium" },
  low: { color: "text-emerald-400", bg: "bg-emerald-400/10", label: "Low" },
};

const promptStatusConfig = {
  cited: { icon: Quote, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30", label: "Cited as source" },
  recommended: { icon: ThumbsUp, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", label: "Recommended" },
  mentioned: { icon: Eye, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30", label: "Mentioned" },
  absent: { icon: EyeOff, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30", label: "Not found" },
  error: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30", label: "Error" },
};

const getScoreColor = (s: number) => (s >= 70 ? "text-emerald-400" : s >= 40 ? "text-amber-400" : "text-red-400");
const getScoreRing = (s: number) => (s >= 70 ? "from-emerald-400 to-emerald-500" : s >= 40 ? "from-amber-400 to-amber-500" : "from-red-400 to-red-500");
const getScoreHex = (s: number) => (s >= 70 ? "#34d399" : s >= 40 ? "#fbbf24" : "#f87171");
const CHART_COLORS = ["#00bcd4", "#34d399", "#fbbf24", "#f87171", "#a78bfa"];

type Tab = "audit" | "citation" | "prompt";

// ─── Score Gauge ──────────────────────────────────────────────────
const ScoreGauge = ({ score }: { score: number }) => {
  const data = [
    { name: "Score", value: score },
    { name: "Remaining", value: 100 - score },
  ];
  return (
    <div className="relative w-48 h-48 mx-auto md:mx-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={90}
            endAngle={-270}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell fill={getScoreHex(score)} />
            <Cell fill="hsl(222, 68%, 21%)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-[3rem] font-black leading-none ${getScoreColor(score)}`}>{score}</span>
        <span className="text-overline text-wd-muted mt-1">/ 100</span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
const LlmChecker = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>(
    searchParams.get("tab") === "prompt" ? "prompt" : searchParams.get("tab") === "citation" ? "citation" : "audit"
  );
  const autoSubmitted = useRef(false);

  // Audit state
  const [brandName, setBrandName] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [rateLimited, setRateLimited] = useState(false);

  // Prompt tester state
  const [promptBrand, setPromptBrand] = useState(searchParams.get("brand") || "");
  const [promptText, setPromptText] = useState(searchParams.get("prompt") || "");
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptResult, setPromptResult] = useState<PromptTestResult | null>(null);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);

  // Lead capture / gating
  const [unlocked, setUnlocked] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadOrg, setLeadOrg] = useState("");
  const [leadLocation, setLeadLocation] = useState("");
  const [leadBudget, setLeadBudget] = useState("");
  const [leadContactOk, setLeadContactOk] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);

  // ─── Handlers ─────────────────────────────────────────────────
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadName.trim() || !leadEmail.trim() || !leadOrg.trim()) return;
    setLeadSubmitting(true);
    try {
      await supabase.functions.invoke("llm-checker", {
        body: {
          saveLead: true,
          name: leadName.trim(),
          email: leadEmail.trim(),
          organisation: leadOrg.trim(),
          location: leadLocation.trim(),
          budget: leadBudget,
          contactPermission: leadContactOk,
          brandName: result?.brandName || promptResult?.brandName || "",
          website: website.trim() || undefined,
          overallScore: result?.overallScore || null,
          results: result || promptResult || null,
        },
      });
      setUnlocked(true);
      toast.success("Full report unlocked! Scroll down for your complete analysis.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLeadSubmitting(false);
    }
  };

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() || rateLimited) return;
    setLoading(true);
    setResult(null);
    setUnlocked(false);
    try {
      const { data, error } = await supabase.functions.invoke("llm-checker", {
        body: { brandName: brandName.trim(), website: website.trim() || undefined },
      });
      if (error) throw error;
      if (data?.rateLimited) { setRateLimited(true); setRemaining(0); toast.error(data.error); return; }
      if (data?.error) { toast.error(data.error); return; }
      if (data?.remaining !== undefined) setRemaining(data.remaining);
      setResult(data as AnalysisResult);
    } catch {
      toast.error("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptBrand.trim() || rateLimited) return;
    
    // If no prompt entered, fall through to brand-only audit
    if (!promptText.trim()) {
      setBrandName(promptBrand);
      setActiveTab("audit");
      setLoading(true);
      setResult(null);
      setUnlocked(false);
      try {
        const { data, error } = await supabase.functions.invoke("llm-checker", {
          body: { brandName: promptBrand.trim() },
        });
        if (error) throw error;
        if (data?.rateLimited) { setRateLimited(true); setRemaining(0); toast.error(data.error); return; }
        if (data?.error) { toast.error(data.error); return; }
        if (data?.remaining !== undefined) setRemaining(data.remaining);
        setResult(data as AnalysisResult);
      } catch {
        toast.error("Analysis failed. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }
    
    setPromptLoading(true);
    setPromptResult(null);
    setExpandedPlatform(null);
    setUnlocked(false);
    try {
      const { data, error } = await supabase.functions.invoke("llm-prompt-tester", {
        body: { brandName: promptBrand.trim(), prompt: promptText.trim() },
      });
      if (error) throw error;
      if (data?.rateLimited) { setRateLimited(true); setRemaining(0); toast.error(data.error); return; }
      if (data?.error) { toast.error(data.error); return; }
      if (data?.remaining !== undefined) setRemaining(data.remaining);
      setPromptResult(data as PromptTestResult);
    } catch {
      toast.error("Prompt test failed. Please try again.");
    } finally {
      setPromptLoading(false);
    }
  };

  // Auto-submit from homepage
  useEffect(() => {
    if (autoSubmitted.current) return;
    const brand = searchParams.get("brand");
    const prompt = searchParams.get("prompt");
    if (searchParams.get("tab") === "prompt" && brand && prompt) {
      autoSubmitted.current = true;
      (async () => {
        setPromptLoading(true);
        try {
          const { data, error } = await supabase.functions.invoke("llm-prompt-tester", {
            body: { brandName: brand.trim(), prompt: prompt.trim() },
          });
          if (error) throw error;
          if (data?.rateLimited) { setRateLimited(true); setRemaining(0); toast.error(data.error); return; }
          if (data?.error) { toast.error(data.error); return; }
          if (data?.remaining !== undefined) setRemaining(data.remaining);
          setPromptResult(data as PromptTestResult);
        } catch {
          toast.error("Prompt test failed. Please try again.");
        } finally {
          setPromptLoading(false);
        }
      })();
    }
  }, [searchParams]);

  const inputClass =
    "w-full bg-wd-midnight border border-primary/20 rounded-md px-4 py-3 text-foreground placeholder:text-wd-muted/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors duration-200 text-body";

  const tabClass = (tab: Tab) =>
    `px-6 py-3 text-body-sm font-bold tracking-wide transition-colors duration-200 border-b-2 ${
      activeTab === tab ? "text-primary border-primary" : "text-wd-muted border-transparent hover:text-foreground hover:border-primary/30"
    }`;

  // ─── Lead Gate ────────────────────────────────────────────────
  const LeadGate = () => (
    <section className="bg-wd-navy py-16 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent" />
      <div className="container relative z-10">
        <ScrollReveal>
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/20 mb-5">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-h2 mb-3">Unlock your full report</h2>
              <p className="text-body text-wd-muted">
                Get the complete breakdown — platform-by-platform analysis, strengths & gaps, prioritised recommendations, and competitive context.
              </p>
            </div>
            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" className={inputClass} placeholder="Your name *" value={leadName} onChange={(e) => setLeadName(e.target.value)} maxLength={100} required />
                <input type="email" className={inputClass} placeholder="Email address *" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} maxLength={255} required />
              </div>
              <input type="text" className={inputClass} placeholder="Company / Organisation *" value={leadOrg} onChange={(e) => setLeadOrg(e.target.value)} maxLength={200} required />
              <input type="text" className={inputClass} placeholder="Where are you based? e.g. London, UK" value={leadLocation} onChange={(e) => setLeadLocation(e.target.value)} maxLength={100} />
              <select
                className={`${inputClass} appearance-none cursor-pointer`}
                value={leadBudget}
                onChange={(e) => setLeadBudget(e.target.value)}
              >
                <option value="">Monthly marketing budget (optional)</option>
                <option value="Under £5,000/month">Under £5,000/month</option>
                <option value="£5,000–£10,000/month">£5,000–£10,000/month</option>
                <option value="£10,000–£20,000/month">£10,000–£20,000/month</option>
                <option value="£20,000–£50,000/month">£20,000–£50,000/month</option>
                <option value="£50,000+/month">£50,000+/month</option>
                <option value="Not sure yet">Not sure yet</option>
              </select>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" checked={leadContactOk} onChange={(e) => setLeadContactOk(e.target.checked)} className="mt-1 w-4 h-4 rounded border-primary/30 bg-wd-midnight text-primary focus:ring-primary/30 cursor-pointer" />
                <span className="text-body-sm text-wd-muted group-hover:text-foreground transition-colors">
                  I'd like Wolfstone Digital to contact me to discuss how to improve my AI visibility
                </span>
              </label>
              <button type="submit" disabled={leadSubmitting || !leadName.trim() || !leadEmail.trim() || !leadOrg.trim()} className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-6 py-3.5 hover:bg-accent transition-colors duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed">
                {leadSubmitting ? <><Loader2 size={16} className="animate-spin" /> Unlocking...</> : <>Unlock full report <ArrowRight size={16} /></>}
              </button>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );

  // ═══════════════════════════════════════════════════════════════
  return (
    <main className="pt-20">
      <SEOHead
        title="Free AI Visibility Checker | Is AI Citing Your Brand? | Wolfstone Digital"
        description="Free AI visibility checker — check whether ChatGPT, Gemini, Perplexity, Copilot, and Claude are citing or recommending your brand. Instant analysis across 5 platforms."
        canonical="/tools/ai-visibility-checker/"
        jsonLd={[
          { "@context": "https://schema.org", "@type": "WebApplication", name: "AI Visibility Checker", url: "https://wolfstonedigital.co.uk/tools/ai-visibility-checker/", applicationCategory: "SEO Tool", provider: { "@type": "Organization", name: "Wolfstone Digital" }, description: "Free tool to check if AI platforms are citing your brand.", offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" } },
          { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://wolfstonedigital.co.uk/" },
            { "@type": "ListItem", position: 2, name: "Free SEO Tools", item: "https://wolfstonedigital.co.uk/tools/" },
            { "@type": "ListItem", position: 3, name: "AI Visibility Checker", item: "https://wolfstonedigital.co.uk/tools/ai-visibility-checker/" },
          ]},
        ]}
      />

      {/* ═══════ HERO ═══════ */}
      <section className="bg-wd-navy py-20 md:py-28 relative overflow-hidden">
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="container relative z-10">
          <ScrollReveal><span className="text-overline text-primary mb-4 block">Free tools</span></ScrollReveal>
          <ScrollReveal delay={0.1}><h1 className="text-display max-w-[18ch] mb-6">Free AI <span className="wd-gradient-text">visibility checker</span></h1></ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-wd-muted max-ch-70 mb-10">
              77% of ChatGPT users treat it as a search engine. Check if AI mentions your brand, cites you as a source, or test a specific prompt.
            </p>
          </ScrollReveal>

          {/* Tabs */}
          <ScrollReveal delay={0.25}>
            <div className="flex gap-0 border-b border-primary/10 mb-8 max-w-3xl overflow-x-auto">
              <button onClick={() => setActiveTab("audit")} className={tabClass("audit")}>
                <span className="flex items-center gap-2 whitespace-nowrap"><BarChart3 size={16} /> Brand visibility</span>
              </button>
              <button onClick={() => setActiveTab("citation")} className={tabClass("citation")}>
                <span className="flex items-center gap-2 whitespace-nowrap"><Quote size={16} /> Citation tracking</span>
              </button>
              <button onClick={() => setActiveTab("prompt")} className={tabClass("prompt")}>
                <span className="flex items-center gap-2 whitespace-nowrap"><MessageSquare size={16} /> Test a prompt</span>
              </button>
            </div>
          </ScrollReveal>

          {/* Audit form */}
          {activeTab === "audit" && (
            <ScrollReveal delay={0.3}>
              <form onSubmit={handleAuditSubmit} className="max-w-2xl">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1"><input type="text" className={inputClass} placeholder="Enter your brand name" value={brandName} onChange={(e) => setBrandName(e.target.value)} maxLength={100} required /></div>
                  <div className="flex-1"><input type="text" className={inputClass} placeholder="Website URL (optional)" value={website} onChange={(e) => setWebsite(e.target.value)} maxLength={200} /></div>
                  <button type="submit" disabled={loading || !brandName.trim() || rateLimited} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-6 py-3 hover:bg-accent transition-colors duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Analysing...</> : <><Search size={16} /> Analyse</>}
                  </button>
                </div>
              </form>
            </ScrollReveal>
          )}

          {/* Citation form */}
          {activeTab === "citation" && (
            <ScrollReveal delay={0.3}>
              <div className="max-w-2xl mb-4">
                <div className="bg-card/50 border border-primary/10 rounded-lg p-4 mb-4">
                  <p className="text-body-sm text-muted-foreground">
                    <span className="text-foreground font-bold">Citation tracking</span> focuses on whether AI platforms cite your brand as an authoritative source — not just whether they mention it. Use this if you care about being referenced as a credible expert rather than just being named.
                  </p>
                </div>
              </div>
              <form onSubmit={handlePromptSubmit} className="max-w-2xl">
                <div className="flex flex-col gap-3">
                  <input type="text" className={inputClass} placeholder="Your brand or publication name" value={promptBrand} onChange={(e) => setPromptBrand(e.target.value)} maxLength={100} required />
                  <div className="relative">
                    <textarea className={`${inputClass} min-h-[80px] resize-none`} placeholder='e.g. "What sources would you recommend for financial advice in the UK?"' value={promptText} onChange={(e) => setPromptText(e.target.value)} maxLength={500} rows={2} />
                    <span className="absolute bottom-2 right-3 text-caption text-wd-muted/40">{promptText.length}/500</span>
                  </div>
                  <button type="submit" disabled={promptLoading || !promptBrand.trim() || rateLimited} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-6 py-3 hover:bg-accent transition-colors duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed self-start">
                    {promptLoading ? <><Loader2 size={16} className="animate-spin" /> Querying AI...</> : <><Quote size={16} /> {promptText.trim() ? "Check citations" : "Check citation visibility"}</>}
                  </button>
                </div>
              </form>
            </ScrollReveal>
          )}

          {/* Prompt form */}
          {activeTab === "prompt" && (
            <ScrollReveal delay={0.3}>
              <form onSubmit={handlePromptSubmit} className="max-w-2xl">
                <div className="flex flex-col gap-3">
                  <input type="text" className={inputClass} placeholder="Your brand name" value={promptBrand} onChange={(e) => setPromptBrand(e.target.value)} maxLength={100} required />
                  <div className="relative">
                    <textarea className={`${inputClass} min-h-[80px] resize-none`} placeholder='Optional — e.g. "What are the best investment platforms in the UK?"' value={promptText} onChange={(e) => setPromptText(e.target.value)} maxLength={500} rows={2} />
                    <span className="absolute bottom-2 right-3 text-caption text-wd-muted/40">{promptText.length}/500</span>
                  </div>
                  <button type="submit" disabled={promptLoading || !promptBrand.trim() || rateLimited} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-6 py-3 hover:bg-accent transition-colors duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed self-start">
                    {promptLoading ? <><Loader2 size={16} className="animate-spin" /> Querying AI...</> : <><MessageSquare size={16} /> {promptText.trim() ? "Test prompt" : "Check brand visibility"}</>}
                  </button>
                </div>
              </form>
            </ScrollReveal>
          )}

          {remaining !== null && !rateLimited && (
            <div className="mt-4 max-w-2xl"><p className="text-caption text-wd-muted/60">{remaining} free {remaining === 1 ? "check" : "checks"} remaining today</p></div>
          )}

          {rateLimited && (
            <div className="mt-6 max-w-2xl bg-card border border-destructive/30 rounded-[12px] p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-body font-bold text-foreground mb-1">Daily limit reached</p>
                  <p className="text-body-sm text-wd-muted mb-3">You've used all 5 free checks for today. Come back tomorrow or get a full analysis from our team.</p>
                  <Link to="/contact" className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-5 py-2.5 hover:bg-accent transition-colors duration-200 active:scale-[0.97]">
                    Book a consultation <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════ LOADING STATES ═══════ */}
      {promptLoading && (activeTab === "prompt" || activeTab === "citation") && (
        <section className="bg-wd-midnight py-20">
          <div className="container text-center">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                {activeTab === "citation" ? <Quote className="absolute inset-0 m-auto w-8 h-8 text-primary" /> : <MessageSquare className="absolute inset-0 m-auto w-8 h-8 text-primary" />}
              </div>
              <p className="text-body-lg text-wd-muted">
                {activeTab === "citation" ? "Checking citation status" : "Querying"} across <span className="text-foreground font-bold">Claude</span>, <span className="text-foreground font-bold">Gemini</span> and <span className="text-foreground font-bold">ChatGPT</span>...
              </p>
              <p className="text-body-sm text-wd-muted/60">This typically takes 10–20 seconds</p>
            </div>
          </div>
        </section>
      )}

      {loading && activeTab === "audit" && (
        <section className="bg-wd-midnight py-20">
          <div className="container text-center">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <Brain className="absolute inset-0 m-auto w-8 h-8 text-primary" />
              </div>
              <p className="text-body-lg text-wd-muted">
                Running live queries across <span className="text-foreground font-bold">ChatGPT</span>, <span className="text-foreground font-bold">Gemini</span> &amp; <span className="text-foreground font-bold">Claude</span> for <span className="text-foreground font-bold">{brandName}</span>...
              </p>
              <p className="text-body-sm text-wd-muted/60">Scraping website → extracting business info → generating prompts → querying LLMs → scoring</p>
              <p className="text-caption text-wd-muted/40">This typically takes 20–40 seconds</p>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
           PROMPT RESULTS
         ═══════════════════════════════════════════════════════════ */}
      {promptResult && !promptLoading && (activeTab === "prompt" || activeTab === "citation") && (
        <>
          {/* Teaser: status cards */}
          <section className="bg-wd-midnight py-16 md:py-20">
            <div className="container">
              <ScrollReveal>
                <span className="text-overline text-primary mb-4 block">Results</span>
                <h2 className="text-h1 mb-3">
                  {activeTab === "citation"
                    ? <>Does AI cite <span className="text-primary">{promptResult.brandName}</span> as a source?</>
                    : <>Does AI mention <span className="text-primary">{promptResult.brandName}</span>?</>
                  }
                </h2>
                <p className="text-body text-wd-muted mb-10 max-ch-70">
                  Prompt tested: <span className="text-foreground italic">"{promptResult.prompt}"</span>
                </p>
              </ScrollReveal>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {promptResult.results.map((r, i) => {
                  const cfg = promptStatusConfig[r.status];
                  const Icon = cfg.icon;
                  return (
                    <ScrollReveal key={r.platform} delay={i * 0.1}>
                      <div className={`bg-card border ${cfg.border} rounded-[12px] overflow-hidden`}>
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-h3">{r.platform}</h3>
                            <span className={`inline-flex items-center gap-1.5 text-overline px-3 py-1.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                              <Icon size={14} /> {cfg.label}
                            </span>
                          </div>

                          {r.status !== "error" && r.status !== "absent" && r.snippets.length > 0 && (
                            <p className="text-body-sm text-wd-muted pl-3 border-l-2 border-primary/30">"...{r.snippets[0]}..."</p>
                          )}
                          {r.status === "absent" && (
                            <p className="text-body-sm text-wd-muted"><span className="text-foreground font-medium">{promptResult.brandName}</span> was not mentioned in the response to this prompt.</p>
                          )}
                          {r.status === "error" && <p className="text-body-sm text-red-400">{r.error}</p>}

                          {/* Blurred teaser */}
                          {!unlocked && r.response && (
                            <div className="mt-4 relative">
                              <div className="text-body-sm text-wd-muted line-clamp-3 blur-[6px] select-none pointer-events-none" aria-hidden="true">{r.response}</div>
                              <div className="absolute inset-0 flex items-center justify-center"><span className="text-caption text-primary flex items-center gap-1.5"><Lock size={12} /> Full response locked</span></div>
                            </div>
                          )}

                          {/* Unlocked content */}
                          {unlocked && r.response && (
                            <>
                              {r.snippets.length > 1 && (
                                <div className="space-y-2 mt-3">
                                  {r.snippets.slice(1).map((snippet, si) => (
                                    <p key={si} className="text-body-sm text-wd-muted pl-3 border-l-2 border-primary/30">"...{snippet}..."</p>
                                  ))}
                                </div>
                              )}
                              <button onClick={() => setExpandedPlatform(expandedPlatform === r.platform ? null : r.platform)} className="text-caption text-primary hover:text-accent transition-colors mt-3">
                                {expandedPlatform === r.platform ? "Hide full response ↑" : "Show full response ↓"}
                              </button>
                            </>
                          )}
                        </div>

                        {unlocked && expandedPlatform === r.platform && r.response && (
                          <div className="border-t border-primary/10 p-6 bg-wd-navy/50">
                            <p className="text-overline text-wd-muted mb-3">Full AI response</p>
                            <div className="text-body-sm text-wd-muted whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
                              {highlightBrand(r.response, promptResult.brandName)}
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>
          </section>

          {!unlocked && <LeadGate />}

          {/* Unlocked: prompt summary visual */}
          {unlocked && (
            <section className="bg-wd-navy py-16 md:py-20">
              <div className="container">
                <ScrollReveal>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                      { label: "Platforms checked", value: promptResult.results.length, icon: Target, accent: "text-primary" },
                      { label: "Cited or recommended", value: promptResult.results.filter(r => r.status === "cited" || r.status === "recommended").length, icon: Award, accent: "text-emerald-400" },
                      { label: "Not found", value: promptResult.results.filter(r => r.status === "absent").length, icon: EyeOff, accent: "text-red-400" },
                    ].map((stat, i) => (
                      <ScrollReveal key={stat.label} delay={i * 0.08}>
                        <div className="bg-card border border-primary/[0.15] rounded-[12px] p-6 text-center">
                          <stat.icon className={`w-8 h-8 ${stat.accent} mx-auto mb-3`} />
                          <div className={`text-[2.5rem] font-black leading-none mb-1 ${stat.accent}`}>{stat.value}</div>
                          <p className="text-overline text-wd-muted">{stat.label}</p>
                        </div>
                      </ScrollReveal>
                    ))}
                  </div>
                </ScrollReveal>
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-wd-midnight py-20 md:py-28 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
            <div className="container relative z-10">
              <ScrollReveal>
                <span className="text-overline text-primary mb-4 block">Next step</span>
                <h2 className="text-h1 mb-4">Want AI to recommend your brand?</h2>
                <p className="text-body-lg text-wd-muted max-ch-70 mx-auto mb-8">
                  We built a brand that AI recommends over billion-dollar competitors. Our methodology is proven, proprietary, and available to select partners. Let's do the same for yours.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/contact" className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-accent transition-colors duration-200 active:scale-[0.97]">
                    Book a free strategy call <ArrowRight size={16} />
                  </Link>
                  <Link to="/case-studies" className="inline-flex items-center gap-2 rounded-md border border-primary/30 text-primary text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-primary/10 transition-colors duration-200 active:scale-[0.97]">
                    See our track record <ArrowRight size={16} />
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </section>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
           AUDIT RESULTS
         ═══════════════════════════════════════════════════════════ */}
      {result && !loading && activeTab === "audit" && (
        <>
          {/* Teaser: score + summary */}
          <section className="bg-wd-midnight py-16 md:py-24">
            <div className="container">
              <ScrollReveal>
                <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                  <ScoreGauge score={result.overallScore} />
                  <div className="flex-1 text-center md:text-left">
                     <span className="text-overline text-primary mb-2 block">AI visibility score</span>
                    <h2 className="text-h1 mb-3">
                      {result.brandName}
                    </h2>
                    {result.methodology === "live-query" && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.1em] uppercase px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/30 mb-3">
                        <CheckCircle size={10} /> Based on live AI queries
                      </span>
                    )}
                    <p className="text-body-lg text-wd-muted max-ch-70">{result.summary}</p>
                    {result.businessInfo && result.businessInfo.industry !== "unknown" && (
                      <p className="text-body-sm text-wd-muted/60 mt-2">
                        Detected: {result.businessInfo.industry} • {result.businessInfo.location !== "unknown" ? result.businessInfo.location : "Location not detected"}
                      </p>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Teaser: platform bar chart */}
          <section className="bg-wd-navy py-16 md:py-20">
            <div className="container">
              <ScrollReveal>
                <span className="text-overline text-primary mb-4 block">Platform breakdown</span>
                <h2 className="text-h1 mb-10">Visibility by AI platform</h2>
              </ScrollReveal>

              {/* Bar chart */}
              <ScrollReveal delay={0.1}>
                <div className="bg-card border border-primary/[0.15] rounded-[12px] p-6 md:p-8 mb-8">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={result.platforms.map(p => ({ name: p.name, score: p.score }))} barSize={40}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(190, 100%, 45%, 0.08)" />
                      <XAxis dataKey="name" tick={{ fill: "hsl(207, 54%, 77%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: "hsl(207, 54%, 77%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: "hsl(222, 68%, 21%)", border: "1px solid hsl(190, 100%, 45%, 0.2)", borderRadius: 8, color: "#fff", fontSize: 13 }}
                        cursor={{ fill: "hsl(190, 100%, 45%, 0.05)" }}
                      />
                      <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                        {result.platforms.map((p, i) => (
                          <Cell key={p.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ScrollReveal>

              {/* Platform cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {result.platforms.map((platform, i) => {
                  const cfg = statusConfig[platform.status];
                  const Icon = cfg.icon;
                  return (
                    <ScrollReveal key={platform.name} delay={i * 0.06}>
                      <div className={`bg-card border ${cfg.border} rounded-[12px] p-5 h-full`}>
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className={`w-5 h-5 ${cfg.color}`} />
                          <span className="text-overline text-wd-muted">{platform.name}</span>
                        </div>
                        <div className={`text-[2rem] font-black leading-none mb-2 ${getScoreColor(platform.score)}`}>{platform.score}</div>
                        {unlocked ? (
                          <p className="text-body-sm text-wd-muted">{platform.detail}</p>
                        ) : (
                          <p className="text-body-sm text-wd-muted/30 blur-[4px] select-none pointer-events-none" aria-hidden="true">{platform.detail}</p>
                        )}
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>
          </section>

           {/* LEAD GATE */}
          {!unlocked && <LeadGate />}

          {/* ═══════ UNLOCKED FULL REPORT ═══════ */}
          {unlocked && (
            <>
              {/* Ahrefs real metrics */}
              {result.ahrefs && (
                <section className="bg-wd-midnight py-16 md:py-20">
                  <div className="container">
                    <ScrollReveal>
                      <span className="text-overline text-primary mb-4 block">Real domain data</span>
                      <h2 className="text-h2 mb-3">Domain metrics</h2>
                      <p className="text-body-sm text-wd-muted mb-8">Live data from Ahrefs — these are verified third-party metrics, not AI estimates.</p>
                    </ScrollReveal>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Domain Rating", value: result.ahrefs.domainRating ?? "N/A", suffix: "/100", color: "text-primary" },
                        { label: "Organic Traffic", value: result.ahrefs.orgTraffic != null ? result.ahrefs.orgTraffic.toLocaleString() : "N/A", suffix: "/mo", color: "text-emerald-400" },
                        { label: "Organic Keywords", value: result.ahrefs.orgKeywords != null ? result.ahrefs.orgKeywords.toLocaleString() : "N/A", suffix: "", color: "text-amber-400" },
                        { label: "Referring Domains", value: result.ahrefs.refDomains != null ? result.ahrefs.refDomains.toLocaleString() : "N/A", suffix: "", color: "text-purple-400" },
                      ].map(m => (
                        <ScrollReveal key={m.label}>
                          <div className="bg-card border border-primary/[0.1] rounded-[12px] p-5 text-center">
                            <p className="text-overline text-wd-muted mb-2">{m.label}</p>
                            <p className={`text-[1.75rem] font-black leading-none ${m.color}`}>
                              {m.value}<span className="text-body-sm text-wd-muted font-normal">{m.suffix}</span>
                            </p>
                          </div>
                        </ScrollReveal>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Prompts tested breakdown */}
              {result.promptResults && result.promptResults.length > 0 && (
                <section className="bg-wd-navy py-16 md:py-20">
                  <div className="container">
                    <ScrollReveal>
                      <span className="text-overline text-primary mb-4 block">Live query evidence</span>
                      <h2 className="text-h2 mb-3">Prompts we tested</h2>
                      <p className="text-body-sm text-wd-muted mb-8">
                        We auto-generated contextual prompts based on your website and queried real AI platforms. Here's what they said:
                      </p>
                    </ScrollReveal>
                    <div className="space-y-3">
                      {/* Group by prompt */}
                      {[...new Set(result.promptResults.map(r => r.prompt))].map((prompt, pi) => {
                        const results = result.promptResults!.filter(r => r.prompt === prompt);
                        return (
                          <ScrollReveal key={pi} delay={pi * 0.06}>
                            <div className="bg-card border border-primary/[0.1] rounded-[12px] p-5">
                              <p className="text-body-sm text-foreground font-medium mb-3 italic">"{prompt}"</p>
                              <div className="flex flex-wrap gap-2">
                                {results.map((r, ri) => {
                                  const statusColors: Record<string, string> = {
                                    cited: "bg-emerald-400/10 text-emerald-400 border-emerald-400/30",
                                    recommended: "bg-primary/10 text-primary border-primary/30",
                                    mentioned: "bg-amber-400/10 text-amber-400 border-amber-400/30",
                                    absent: "bg-red-400/10 text-red-400 border-red-400/30",
                                    error: "bg-red-400/10 text-red-400 border-red-400/30",
                                  };
                                  return (
                                    <span key={ri} className={`inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase px-3 py-1.5 rounded-full border ${statusColors[r.status] || statusColors.error}`}>
                                      {r.platform}: {r.status}
                                    </span>
                                  );
                                })}
                              </div>
                              {results.some(r => r.snippets.length > 0) && (
                                <div className="mt-3 space-y-1">
                                  {results.filter(r => r.snippets.length > 0).slice(0, 2).map((r, si) => (
                                    <p key={si} className="text-caption text-wd-muted pl-3 border-l-2 border-primary/20">
                                      <span className="text-foreground font-medium">{r.platform}:</span> "...{r.snippets[0].slice(0, 150)}..."
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </ScrollReveal>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}


              {/* Radar chart */}
              <section className="bg-wd-midnight py-16 md:py-20">
                <div className="container">
                  <ScrollReveal>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                      <div>
                        <span className="text-overline text-primary mb-4 block">Radar overview</span>
                        <h2 className="text-h2 mb-4">Cross-platform visibility</h2>
                        <p className="text-body text-wd-muted mb-6">
                          This radar shows your brand's visibility footprint across every major AI platform. A wider shape means broader coverage — gaps reveal where competitors are winning the conversation.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: "Highest", value: Math.max(...result.platforms.map(p => p.score)), color: "text-emerald-400" },
                            { label: "Lowest", value: Math.min(...result.platforms.map(p => p.score)), color: "text-red-400" },
                            { label: "Average", value: Math.round(result.platforms.reduce((a, p) => a + p.score, 0) / result.platforms.length), color: "text-amber-400" },
                            { label: "Platforms", value: result.platforms.length, color: "text-primary" },
                          ].map(stat => (
                            <div key={stat.label} className="bg-card border border-primary/[0.1] rounded-[8px] p-4">
                              <p className="text-overline text-wd-muted mb-1">{stat.label}</p>
                              <p className={`text-[1.5rem] font-black leading-none ${stat.color}`}>{stat.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-card border border-primary/[0.15] rounded-[12px] p-6">
                        <ResponsiveContainer width="100%" height={320}>
                          <RadarChart data={result.platforms.map(p => ({ platform: p.name, score: p.score }))}>
                            <PolarGrid stroke="hsl(190, 100%, 45%, 0.12)" />
                            <PolarAngleAxis dataKey="platform" tick={{ fill: "hsl(207, 54%, 77%)", fontSize: 11 }} />
                            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Score" dataKey="score" stroke="hsl(190, 100%, 45%)" fill="hsl(190, 100%, 45%)" fillOpacity={0.2} strokeWidth={2} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              </section>

              {/* Strengths & Weaknesses */}
              <section className="bg-wd-navy py-16 md:py-20">
                <div className="container">
                  <ScrollReveal>
                    <span className="text-overline text-primary mb-4 block">Detailed analysis</span>
                    <h2 className="text-h1 mb-10">Strengths & gaps</h2>
                  </ScrollReveal>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ScrollReveal>
                      <div className="bg-card border border-emerald-400/20 rounded-[12px] p-6 h-full">
                        <div className="flex items-center gap-2 mb-6">
                          <div className="w-8 h-8 rounded-full bg-emerald-400/10 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          </div>
                          <h3 className="text-h3">What's working</h3>
                        </div>
                        <ul className="space-y-4">
                          {result.strengths.map((s, i) => (
                            <li key={i} className="flex gap-3 items-start">
                              <div className="w-5 h-5 rounded-full bg-emerald-400/10 flex items-center justify-center shrink-0 mt-0.5">
                                <TrendingUp className="w-3 h-3 text-emerald-400" />
                              </div>
                              <span className="text-body-sm text-wd-muted">{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </ScrollReveal>
                    <ScrollReveal delay={0.1}>
                      <div className="bg-card border border-red-400/20 rounded-[12px] p-6 h-full">
                        <div className="flex items-center gap-2 mb-6">
                          <div className="w-8 h-8 rounded-full bg-red-400/10 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          </div>
                          <h3 className="text-h3">Gaps & risks</h3>
                        </div>
                        <ul className="space-y-4">
                          {result.weaknesses.map((w, i) => (
                            <li key={i} className="flex gap-3 items-start">
                              <div className="w-5 h-5 rounded-full bg-red-400/10 flex items-center justify-center shrink-0 mt-0.5">
                                <AlertTriangle className="w-3 h-3 text-red-400" />
                              </div>
                              <span className="text-body-sm text-wd-muted">{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </ScrollReveal>
                  </div>
                </div>
              </section>

              {/* Recommendations */}
              <section className="bg-wd-midnight py-16 md:py-20">
                <div className="container">
                  <ScrollReveal>
                    <span className="text-overline text-primary mb-4 block">Action plan</span>
                    <h2 className="text-h1 mb-4">Prioritised recommendations</h2>
                    <p className="text-body text-wd-muted max-ch-70 mb-10">
                      Each recommendation is ranked by impact. Start with high-priority items for the fastest improvement in your AI visibility.
                    </p>
                  </ScrollReveal>
                  <div className="space-y-4">
                    {result.recommendations.map((rec, i) => {
                      const pcfg = priorityConfig[rec.priority];
                      return (
                        <ScrollReveal key={i} delay={i * 0.06}>
                          <div className="bg-card border border-primary/[0.15] rounded-[12px] p-6 hover:border-primary/[0.45] transition-colors duration-200 group">
                            <div className="flex items-start gap-4">
                              <div className="flex flex-col items-center gap-1.5 shrink-0">
                                <span className={`text-[1.75rem] font-black leading-none ${pcfg.color}`}>{String(i + 1).padStart(2, "0")}</span>
                                <span className={`text-[10px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded ${pcfg.bg} ${pcfg.color}`}>{pcfg.label}</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-h3 mb-1 group-hover:text-primary transition-colors">{rec.action}</h4>
                                <p className="text-body-sm text-wd-muted">{rec.impact}</p>
                              </div>
                              <ArrowRight className="w-5 h-5 text-primary/30 group-hover:text-primary transition-colors shrink-0 mt-1" />
                            </div>
                          </div>
                        </ScrollReveal>
                      );
                    })}
                  </div>
                  {result.competitorContext && (
                    <ScrollReveal delay={0.2}>
                      <div className="mt-8 bg-card border border-primary/[0.15] rounded-[12px] p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="w-5 h-5 text-primary" />
                          <h4 className="text-h3 text-primary">Competitive context</h4>
                        </div>
                        <p className="text-body text-wd-muted">{result.competitorContext}</p>
                      </div>
                    </ScrollReveal>
                  )}
                </div>
              </section>
            </>
          )}

          {/* Bottom CTA — always visible */}
          <section className="relative overflow-hidden py-24 md:py-32">
            <div className="absolute inset-0 bg-wd-navy" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
            <div className="container relative z-10 text-center">
              <ScrollReveal>
                <span className="text-overline text-primary mb-4 block">Ready to dominate AI search?</span>
                <h2 className="text-display max-w-[16ch] mx-auto mb-6">
                  Let's turn gaps into <span className="wd-gradient-text">unfair advantages</span>
                </h2>
                <p className="text-body-lg text-wd-muted max-ch-70 mx-auto mb-10">
                  We've done this before — from scratch, with our own capital. Our own finance brand now outranks billion-dollar competitors in AI search. Book a strategy call and we'll show you exactly how to replicate it.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/contact" className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-accent transition-colors duration-200 active:scale-[0.97] shadow-lg shadow-primary/20">
                    Book a free strategy call <ArrowRight size={16} />
                  </Link>
                  <Link to="/case-studies" className="inline-flex items-center gap-2 rounded-md border border-primary/30 text-primary text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-primary/10 transition-colors duration-200 active:scale-[0.97]">
                    See our track record <ArrowRight size={16} />
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </section>
        </>
      )}

      {/* ═══════ EXPLAINERS (no results) ═══════ */}
      {!result && !loading && activeTab === "audit" && !promptResult && !promptLoading && (
        <section className="bg-wd-midnight py-20 md:py-28">
          <div className="container">
            <ScrollReveal><span className="text-overline text-primary mb-4 block">How it works</span><h2 className="text-h1 mb-12">What we check</h2></ScrollReveal>
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
      )}

      {!promptResult && !promptLoading && activeTab === "prompt" && (
        <section className="bg-wd-midnight py-20 md:py-28">
          <div className="container">
            <ScrollReveal>
              <span className="text-overline text-primary mb-4 block">How it works</span>
              <h2 className="text-h1 mb-6">Test any prompt, live</h2>
              <p className="text-body-lg text-wd-muted max-ch-70 mb-12">
                Enter a question your customers might ask an AI assistant. We'll send it to Gemini and ChatGPT in real time and show you whether your brand appears in the response — and how.
              </p>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Quote, title: "Cited", desc: "The AI references your brand as a source or authority — the strongest signal.", color: "text-emerald-400" },
                { icon: ThumbsUp, title: "Recommended", desc: "The AI suggests or recommends your brand to the user — high conversion potential.", color: "text-primary" },
                { icon: EyeOff, title: "Absent", desc: "Your brand doesn't appear at all — a gap that competitors may be filling.", color: "text-red-400" },
              ].map((item, i) => (
                <ScrollReveal key={item.title} delay={i * 0.08}>
                  <div className="bg-card border border-primary/[0.15] rounded-[12px] p-6 hover:border-primary/[0.45] transition-colors duration-200 h-full">
                    <item.icon className={`w-8 h-8 ${item.color} mb-4`} />
                    <h3 className="text-h3 mb-2">{item.title}</h3>
                    <p className="text-body-sm text-wd-muted">{item.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

function highlightBrand(text: string, brand: string): JSX.Element[] {
  if (!brand) return [<span key="0">{text}</span>];
  const regex = new RegExp(`(${brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <span key={i} className="text-primary font-bold bg-primary/10 px-0.5 rounded">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default LlmChecker;
