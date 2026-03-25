import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Link2, Loader2, Shield, BarChart3, AlertTriangle, Zap, Eye,
  CheckCircle, XCircle, ThumbsUp, ThumbsDown, HelpCircle, Lock, ChevronDown, ChevronUp, Download
} from "lucide-react";
import { toast } from "sonner";

// Password validated server-side via bulk-auth edge function

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

interface URLJob {
  url: string;
  status: "pending" | "running" | "done" | "error";
  result?: BacklinkResult;
  error?: string;
}

const verdictConfig = {
  excellent: { color: "text-emerald-400", bg: "bg-emerald-400/10", label: "Excellent" },
  good: { color: "text-emerald-300", bg: "bg-emerald-300/10", label: "Good" },
  average: { color: "text-amber-400", bg: "bg-amber-400/10", label: "Average" },
  poor: { color: "text-orange-400", bg: "bg-orange-400/10", label: "Poor" },
  toxic: { color: "text-red-400", bg: "bg-red-400/10", label: "Toxic" },
};

const shouldConfig = {
  yes: { icon: ThumbsUp, color: "text-emerald-400", label: "Yes" },
  maybe: { icon: HelpCircle, color: "text-amber-400", label: "Maybe" },
  no: { icon: ThumbsDown, color: "text-orange-400", label: "No" },
  avoid: { icon: XCircle, color: "text-red-400", label: "Avoid" },
};

const priorityConfig = {
  high: { color: "text-red-400", bg: "bg-red-400/10" },
  medium: { color: "text-amber-400", bg: "bg-amber-400/10" },
  low: { color: "text-emerald-400", bg: "bg-emerald-400/10" },
};

const getScoreColor = (s: number) => s >= 70 ? "text-emerald-400" : s >= 40 ? "text-amber-400" : "text-red-400";
const getScoreRing = (s: number) => s >= 70 ? "from-emerald-400 to-emerald-500" : s >= 40 ? "from-amber-400 to-amber-500" : "from-red-400 to-red-500";

const CONCURRENCY = 5;
const MAX_URLS = 100;

const ResultCard = ({ job }: { job: URLJob }) => {
  const [expanded, setExpanded] = useState(false);
  const r = job.result;

  if (job.status === "pending") {
    return (
      <div className="bg-card border border-white/5 rounded-[12px] p-5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <span className="text-body-sm text-wd-muted truncate">{job.url}</span>
          <span className="text-xs text-wd-muted/50 ml-auto">Queued</span>
        </div>
      </div>
    );
  }

  if (job.status === "running") {
    return (
      <div className="bg-card border border-primary/20 rounded-[12px] p-5">
        <div className="flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
          <span className="text-body-sm text-foreground truncate">{job.url}</span>
          <span className="text-xs text-primary ml-auto">Analysing...</span>
        </div>
      </div>
    );
  }

  if (job.status === "error") {
    return (
      <div className="bg-card border border-red-400/20 rounded-[12px] p-5">
        <div className="flex items-center gap-3">
          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-body-sm text-foreground truncate">{job.url}</span>
          <span className="text-xs text-red-400 ml-auto">{job.error || "Failed"}</span>
        </div>
      </div>
    );
  }

  if (!r) return null;

  const vc = verdictConfig[r.verdict];
  const sc = shouldConfig[r.shouldYouGetThisLink];
  const SIcon = sc.icon;

  return (
    <div className="bg-card border border-primary/[0.15] rounded-[12px] overflow-hidden">
      {/* Summary row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-5 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getScoreRing(r.overallScore)} p-[2px] shrink-0`}>
          <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
            <span className={`text-lg font-black ${getScoreColor(r.overallScore)}`}>{r.overallScore}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-body-sm font-semibold text-foreground truncate">{r.domain}</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${vc.bg} ${vc.color}`}>{vc.label}</span>
            <span className={`text-[10px] flex items-center gap-1 ${sc.color}`}><SIcon className="w-3 h-3" />{sc.label}</span>
          </div>
          <p className="text-xs text-wd-muted mt-1 line-clamp-1">{r.summary}</p>
        </div>
        <span className="text-xs font-bold text-primary shrink-0">{r.estimatedValue}</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-wd-muted shrink-0" /> : <ChevronDown className="w-4 h-4 text-wd-muted shrink-0" />}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-white/5 p-5 space-y-6">
          <p className="text-body-sm text-wd-muted">{r.summary}</p>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {([
              ["Domain authority", r.metrics.domainAuthority, Shield],
              ["Content quality", r.metrics.contentQuality, Eye],
              ["Outgoing links", r.metrics.outgoingLinkProfile, Link2],
              ["Spam risk", r.metrics.spamRisk, AlertTriangle],
              ["Traffic potential", r.metrics.trafficPotential, BarChart3],
              ["Niche relevance", r.metrics.nicheRelevance, Zap],
            ] as [string, Metric, any][]).map(([label, metric, Icon]) => (
              <div key={label} className="bg-wd-navy/50 border border-white/5 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3 h-3 text-primary" />
                  <span className="text-[10px] uppercase tracking-wider text-wd-muted">{label}</span>
                </div>
                <div className={`text-xl font-black ${getScoreColor(metric.score)}`}>{metric.score}</div>
                <p className="text-[11px] text-wd-muted/80 mt-1">{metric.detail}</p>
                {metric.linkCount !== undefined && (
                  <p className="text-[10px] text-wd-muted/50 mt-0.5">{metric.linkCount} outgoing links</p>
                )}
              </div>
            ))}
          </div>

          {/* Flags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {r.greenFlags.length > 0 && (
              <div className="bg-emerald-400/5 border border-emerald-400/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3"><CheckCircle className="w-4 h-4 text-emerald-400" /><span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Green flags</span></div>
                <ul className="space-y-2">{r.greenFlags.map((f, i) => (
                  <li key={i} className="flex gap-2 items-start text-[11px] text-wd-muted"><div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />{f}</li>
                ))}</ul>
              </div>
            )}
            {r.redFlags.length > 0 && (
              <div className="bg-red-400/5 border border-red-400/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4 text-red-400" /><span className="text-xs font-bold text-red-400 uppercase tracking-wider">Red flags</span></div>
                <ul className="space-y-2">{r.redFlags.map((f, i) => (
                  <li key={i} className="flex gap-2 items-start text-[11px] text-wd-muted"><div className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />{f}</li>
                ))}</ul>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {r.recommendations.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-wd-muted mb-3">Recommendations</h4>
              <div className="space-y-2">
                {r.recommendations.map((rec, i) => {
                  const pc = priorityConfig[rec.priority];
                  return (
                    <div key={i} className="flex items-start gap-3 bg-wd-navy/30 border border-white/5 rounded-lg p-3">
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${pc.bg} ${pc.color} shrink-0`}>{rec.priority}</span>
                      <p className="text-[11px] text-wd-muted">{rec.action}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const BulkBacklinkChecker = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [urlText, setUrlText] = useState("");
  const [jobs, setJobs] = useState<URLJob[]>([]);
  const [running, setRunning] = useState(false);
  const activeCount = useRef(0);
  const aborted = useRef(false);
  const [internalKey, setInternalKey] = useState("");

  // Set noindex
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex, nofollow";
    document.title = "Bulk Backlink Checker — Internal Tool";
    return () => { if (meta) meta.content = ""; };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.functions.invoke("bulk-auth", {
        body: { password: passwordInput },
      });
      if (error) throw error;
      if (data?.authenticated) {
        setInternalKey(data.token || "");
        setAuthenticated(true);
      } else {
        toast.error(data?.error || "Incorrect password");
      }
    } catch {
      toast.error("Authentication failed. Please try again.");
    }
  };

  const parseUrls = (text: string): string[] => {
    return text
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0)
      .slice(0, MAX_URLS);
  };

  const startAnalysis = () => {
    const urls = parseUrls(urlText);
    if (urls.length === 0) { toast.error("Enter at least one URL"); return; }

    const newJobs: URLJob[] = urls.map((url) => ({ url, status: "pending" }));
    setJobs(newJobs);
    setRunning(true);
    aborted.current = false;
    activeCount.current = 0;

    processQueue(newJobs);
  };

  const processQueue = async (jobList: URLJob[]) => {
    const queue = [...jobList];

    const runNext = async () => {
      if (aborted.current) return;
      const nextJob = queue.find((j) => j.status === "pending");
      if (!nextJob) {
        if (activeCount.current === 0) setRunning(false);
        return;
      }

      nextJob.status = "running";
      activeCount.current++;
      setJobs((prev) => prev.map((j) => j.url === nextJob.url ? { ...nextJob } : j));

      try {
        const { data, error } = await supabase.functions.invoke("backlink-checker", {
          body: { url: nextJob.url },
          headers: internalKey ? { "x-internal-key": internalKey } : {},
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        nextJob.status = "done";
        nextJob.result = data as BacklinkResult;
      } catch (err: any) {
        nextJob.status = "error";
        nextJob.error = err?.message || "Analysis failed";
      }

      activeCount.current--;
      setJobs((prev) => prev.map((j) => j.url === nextJob.url ? { ...nextJob } : j));
      runNext();
    };

    for (let i = 0; i < Math.min(CONCURRENCY, queue.length); i++) {
      runNext();
    }
  };

  const doneCount = jobs.filter((j) => j.status === "done").length;
  const errorCount = jobs.filter((j) => j.status === "error").length;
  const urlCount = parseUrls(urlText).length;

  const exportCSV = () => {
    const completed = jobs.filter((j) => j.result);
    if (completed.length === 0) return;
    const headers = [
      "URL", "Domain", "Overall Score", "Verdict", "Should Get Link", "Estimated Value",
      "Domain Authority", "Content Quality", "Outgoing Links Score", "Outgoing Link Count",
      "Spam Risk", "Traffic Potential", "Niche Relevance",
      "Green Flags", "Red Flags", "Recommendations", "Summary"
    ];
    const rows = completed.map((j) => {
      const r = j.result!;
      const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
      return [
        esc(r.url), esc(r.domain), r.overallScore, r.verdict, r.shouldYouGetThisLink, esc(r.estimatedValue),
        r.metrics.domainAuthority.score, r.metrics.contentQuality.score,
        r.metrics.outgoingLinkProfile.score, r.metrics.outgoingLinkProfile.linkCount ?? "",
        r.metrics.spamRisk.score, r.metrics.trafficPotential.score, r.metrics.nicheRelevance.score,
        esc(r.greenFlags.join(" | ")), esc(r.redFlags.join(" | ")),
        esc(r.recommendations.map((rec) => `[${rec.priority}] ${rec.action}`).join(" | ")),
        esc(r.summary)
      ].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `backlink-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // Password gate
  if (!authenticated) {
    return (
      <main className="pt-20 min-h-screen bg-wd-navy flex items-center justify-center">
        <div className="bg-card border border-primary/20 rounded-[16px] p-8 md:p-10 max-w-md w-full mx-4 shadow-2xl">
          <div className="text-center mb-6">
            <Lock className="w-10 h-10 text-primary mx-auto mb-4" />
            <h1 className="text-h2 mb-2">Internal Tool</h1>
            <p className="text-body-sm text-wd-muted">This page is password protected.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              className="w-full border border-white/10 rounded-md px-4 py-3 text-foreground placeholder:text-wd-muted/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors text-body bg-white/5"
              placeholder="Enter password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-accent transition-colors duration-200 active:scale-[0.97]"
            >
              <Lock size={16} /> Access tool
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen bg-wd-navy">
      {/* Input section */}
      <section className="py-12 md:py-16">
        <div className="container max-w-4xl">
          <h1 className="text-h1 mb-2">Bulk backlink checker</h1>
          <p className="text-body-lg text-wd-muted mb-8">
            Paste up to {MAX_URLS} URLs (one per line) to analyse them all. Results stream in as each check completes.
          </p>

          <div className="space-y-4">
            <textarea
              className="w-full border border-white/10 rounded-md px-4 py-3 text-foreground placeholder:text-wd-muted/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors text-body-sm bg-white/5 font-mono min-h-[200px]"
              placeholder={"https://example.com/page-1\nhttps://example.com/page-2\nhttps://anothersite.com/article\n..."}
              value={urlText}
              onChange={(e) => setUrlText(e.target.value)}
              disabled={running}
            />
            <div className="flex items-center justify-between">
              <span className={`text-xs ${urlCount > MAX_URLS ? "text-red-400" : "text-wd-muted"}`}>
                {urlCount} / {MAX_URLS} URLs
              </span>
              <button
                onClick={startAnalysis}
                disabled={running || urlCount === 0}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-accent transition-colors duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {running ? (
                  <><Loader2 size={16} className="animate-spin" /> Checking {doneCount + errorCount}/{jobs.length}...</>
                ) : (
                  <><Link2 size={16} /> Check {urlCount} backlink{urlCount !== 1 ? "s" : ""}</>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      {jobs.length > 0 && (
        <section className="pb-16 md:pb-24">
          <div className="container max-w-4xl">
            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-overline text-wd-muted">Progress</span>
                <span className="text-xs text-wd-muted">
                  {doneCount} done · {errorCount} failed · {jobs.length - doneCount - errorCount} remaining
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${((doneCount + errorCount) / jobs.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Summary stats when complete */}
            {!running && doneCount > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {(["excellent", "good", "average", "poor"] as const).map((v) => {
                  const count = jobs.filter((j) => j.result?.verdict === v).length;
                  const vc = verdictConfig[v];
                  return (
                    <div key={v} className={`rounded-lg border ${vc.bg} border-white/5 p-3 text-center`}>
                      <div className={`text-2xl font-black ${vc.color}`}>{count}</div>
                      <div className="text-[10px] uppercase tracking-wider text-wd-muted">{vc.label}</div>
                    </div>
                  );
                })}
              </div>
              )}

              {/* Export button */}
              {!running && doneCount > 0 && (
                <div className="mb-6 flex justify-end">
                  <button
                    onClick={exportCSV}
                    className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-6 py-3 hover:bg-accent transition-colors duration-200 active:scale-[0.97]"
                  >
                    <Download size={16} /> Export CSV
                  </button>
                </div>
              )}

              {/* Job list */}
            <div className="space-y-3">
              {jobs.map((job, i) => (
                <ResultCard key={`${job.url}-${i}`} job={job} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default BulkBacklinkChecker;
