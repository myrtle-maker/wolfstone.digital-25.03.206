import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Brain, Loader2, Lock, ChevronDown, ChevronUp, Download,
  CheckCircle, XCircle, Eye, EyeOff, ThumbsUp, Quote, HelpCircle,
  BarChart3, Target, Award, Plus, Trash2
} from "lucide-react";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";

const MAX_PROMPTS = 50;
const CONCURRENCY = 3;

interface PromptResult {
  platform: string;
  response: string;
  status: "cited" | "recommended" | "mentioned" | "absent" | "error";
  snippets: string[];
  error?: string;
}

interface PromptJob {
  id: number;
  prompt: string;
  status: "pending" | "running" | "done" | "error";
  results?: PromptResult[];
  error?: string;
}

const statusConfig = {
  cited: { icon: Quote, color: "text-emerald-400", bg: "bg-emerald-400/10", label: "Cited" },
  recommended: { icon: ThumbsUp, color: "text-primary", bg: "bg-primary/10", label: "Recommended" },
  mentioned: { icon: Eye, color: "text-amber-400", bg: "bg-amber-400/10", label: "Mentioned" },
  absent: { icon: EyeOff, color: "text-red-400", bg: "bg-red-400/10", label: "Absent" },
  error: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10", label: "Error" },
};

const CHART_COLORS = ["#00bcd4", "#34d399", "#fbbf24", "#f87171", "#a78bfa"];

const PromptCard = ({ job, brandName }: { job: PromptJob; brandName: string }) => {
  const [expanded, setExpanded] = useState(false);

  if (job.status === "pending") {
    return (
      <div className="bg-card border border-white/5 rounded-[12px] p-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <span className="text-body-sm text-wd-muted truncate flex-1">{job.prompt}</span>
          <span className="text-xs text-wd-muted/50">Queued</span>
        </div>
      </div>
    );
  }

  if (job.status === "running") {
    return (
      <div className="bg-card border border-primary/20 rounded-[12px] p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
          <span className="text-body-sm text-foreground truncate flex-1">{job.prompt}</span>
          <span className="text-xs text-primary">Querying AI...</span>
        </div>
      </div>
    );
  }

  if (job.status === "error") {
    return (
      <div className="bg-card border border-red-400/20 rounded-[12px] p-4">
        <div className="flex items-center gap-3">
          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="text-body-sm text-foreground truncate flex-1">{job.prompt}</span>
          <span className="text-xs text-red-400">{job.error || "Failed"}</span>
        </div>
      </div>
    );
  }

  if (!job.results) return null;

  const citedCount = job.results.filter(r => r.status === "cited" || r.status === "recommended").length;
  const totalModels = job.results.length;

  return (
    <div className="bg-card border border-primary/[0.15] rounded-[12px] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${citedCount > 0 ? "bg-emerald-400/10" : "bg-red-400/10"}`}>
          <span className={`text-sm font-black ${citedCount > 0 ? "text-emerald-400" : "text-red-400"}`}>{citedCount}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-body-sm font-medium text-foreground truncate">{job.prompt}</p>
          <div className="flex gap-2 mt-1">
            {job.results.map(r => {
              const cfg = statusConfig[r.status];
              return (
                <span key={r.platform} className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
                  {r.platform.split(" ").pop()}: {cfg.label}
                </span>
              );
            })}
          </div>
        </div>
        <span className="text-xs text-wd-muted">{citedCount}/{totalModels}</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-wd-muted" /> : <ChevronDown className="w-4 h-4 text-wd-muted" />}
      </button>

      {expanded && (
        <div className="border-t border-white/5 p-4 space-y-4">
          {job.results.map(r => {
            const cfg = statusConfig[r.status];
            const Icon = cfg.icon;
            return (
              <div key={r.platform} className="bg-background/50 border border-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-body-sm font-bold text-foreground">{r.platform}</span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
                    <Icon className="w-3 h-3" /> {cfg.label}
                  </span>
                </div>
                {r.snippets.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {r.snippets.map((s, i) => (
                      <p key={i} className="text-[11px] text-wd-muted pl-3 border-l-2 border-primary/30">"...{s}..."</p>
                    ))}
                  </div>
                )}
                {r.status === "absent" && (
                  <p className="text-[11px] text-wd-muted"><span className="text-foreground font-medium">{brandName}</span> not mentioned.</p>
                )}
                {r.response && (
                  <details className="mt-2">
                    <summary className="text-[10px] text-primary cursor-pointer hover:text-accent">Full response</summary>
                    <p className="text-[11px] text-wd-muted mt-2 whitespace-pre-wrap max-h-[200px] overflow-y-auto">{r.response}</p>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const BulkAIChecker = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [internalKey, setInternalKey] = useState("");

  const [brandName, setBrandName] = useState("");
  const [prompts, setPrompts] = useState<string[]>([""]);
  const [jobs, setJobs] = useState<PromptJob[]>([]);
  const [running, setRunning] = useState(false);
  const activeCount = useRef(0);
  const aborted = useRef(false);
  const [selectedModels, setSelectedModels] = useState<string[]>(["gemini", "chatgpt", "claude"]);

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex, nofollow";
    document.title = "Bulk AI Exposure Scanner — Internal Tool";
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
        toast.error("Incorrect password");
      }
    } catch {
      toast.error("Authentication failed.");
    }
  };

  const addPrompt = () => {
    if (prompts.length < MAX_PROMPTS) setPrompts([...prompts, ""]);
  };

  const removePrompt = (index: number) => {
    if (prompts.length > 1) setPrompts(prompts.filter((_, i) => i !== index));
  };

  const updatePrompt = (index: number, value: string) => {
    setPrompts(prompts.map((p, i) => i === index ? value : p));
  };

  const handlePaste = (e: React.ClipboardEvent, index: number) => {
    const text = e.clipboardData.getData("text");
    const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length > 1) {
      e.preventDefault();
      const newPrompts = [...prompts];
      newPrompts.splice(index, 1, ...lines);
      setPrompts(newPrompts.slice(0, MAX_PROMPTS));
    }
  };

  const validPrompts = prompts.filter(p => p.trim().length > 0);

  const startAnalysis = () => {
    if (!brandName.trim() || validPrompts.length === 0) {
      toast.error("Enter a brand name and at least one prompt");
      return;
    }

    const newJobs: PromptJob[] = validPrompts.map((prompt, i) => ({
      id: i,
      prompt: prompt.trim(),
      status: "pending",
    }));
    setJobs(newJobs);
    setRunning(true);
    aborted.current = false;
    activeCount.current = 0;
    processQueue(newJobs);
  };

  const processQueue = async (jobList: PromptJob[]) => {
    const queue = [...jobList];

    const runNext = async () => {
      if (aborted.current) return;
      const nextJob = queue.find(j => j.status === "pending");
      if (!nextJob) {
        if (activeCount.current === 0) setRunning(false);
        return;
      }

      nextJob.status = "running";
      activeCount.current++;
      setJobs(prev => prev.map(j => j.id === nextJob.id ? { ...nextJob } : j));

      try {
        const { data, error } = await supabase.functions.invoke("bulk-ai-checker", {
          body: { brandName: brandName.trim(), prompt: nextJob.prompt, models: selectedModels },
          headers: internalKey ? { "x-internal-key": internalKey } : {},
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        nextJob.status = "done";
        nextJob.results = data.results;
      } catch (err: any) {
        nextJob.status = "error";
        nextJob.error = err?.message || "Failed";
      }

      activeCount.current--;
      setJobs(prev => prev.map(j => j.id === nextJob.id ? { ...nextJob } : j));
      runNext();
    };

    for (let i = 0; i < Math.min(CONCURRENCY, queue.length); i++) {
      runNext();
    }
  };

  const doneCount = jobs.filter(j => j.status === "done").length;
  const errorCount = jobs.filter(j => j.status === "error").length;

  // Dashboard data
  const completedJobs = jobs.filter(j => j.results);
  const allResults = completedJobs.flatMap(j => j.results || []);

  const platformStats = ["Google Gemini", "ChatGPT", "Claude"].map(platform => {
    const platformResults = allResults.filter(r => r.platform === platform);
    return {
      platform: platform.split(" ").pop()!,
      cited: platformResults.filter(r => r.status === "cited").length,
      recommended: platformResults.filter(r => r.status === "recommended").length,
      mentioned: platformResults.filter(r => r.status === "mentioned").length,
      absent: platformResults.filter(r => r.status === "absent").length,
      total: platformResults.length,
    };
  }).filter(p => p.total > 0);

  const overallStats = {
    cited: allResults.filter(r => r.status === "cited").length,
    recommended: allResults.filter(r => r.status === "recommended").length,
    mentioned: allResults.filter(r => r.status === "mentioned").length,
    absent: allResults.filter(r => r.status === "absent").length,
  };

  const visibilityScore = allResults.length > 0
    ? Math.round(((overallStats.cited * 100 + overallStats.recommended * 75 + overallStats.mentioned * 40) / (allResults.length * 100)) * 100)
    : 0;

  const getScoreColor = (s: number) => s >= 70 ? "text-emerald-400" : s >= 40 ? "text-amber-400" : "text-red-400";

  const exportCSV = () => {
    if (completedJobs.length === 0) return;
    const headers = ["Prompt", "Platform", "Status", "Snippets", "Full Response"];
    const rows = completedJobs.flatMap(j =>
      (j.results || []).map(r => {
        const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
        return [
          esc(j.prompt), esc(r.platform), r.status,
          esc(r.snippets.join(" | ")), esc(r.response)
        ].join(",");
      })
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ai-exposure-${brandName.trim().replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const toggleModel = (model: string) => {
    setSelectedModels(prev =>
      prev.includes(model) ? prev.filter(m => m !== model) : [...prev, model]
    );
  };

  if (!authenticated) {
    return (
      <main className="pt-20 min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card border border-primary/20 rounded-[16px] p-8 md:p-10 max-w-md w-full mx-4 shadow-2xl">
          <div className="text-center mb-6">
            <Lock className="w-10 h-10 text-primary mx-auto mb-4" />
            <h1 className="text-h2 mb-2">AI Exposure Scanner</h1>
            <p className="text-body-sm text-muted-foreground">Internal tool — password protected.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              className="w-full border border-white/10 rounded-md px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors text-body bg-white/5"
              placeholder="Enter password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoFocus
            />
            <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-accent transition-colors duration-200 active:scale-[0.97]">
              <Lock size={16} /> Access tool
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen bg-background">
      <section className="py-8 md:py-12">
        <div className="container max-w-5xl">
          <h1 className="text-h1 mb-2">Bulk AI exposure scanner</h1>
          <p className="text-body text-muted-foreground mb-8">
            Enter up to {MAX_PROMPTS} prompts to check how <strong>{brandName || "your brand"}</strong> appears across Claude, Gemini, and ChatGPT.
          </p>

          {/* Brand + Model config */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-overline text-muted-foreground mb-2 block">Brand name</label>
              <input
                type="text"
                className="w-full border border-white/10 rounded-md px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors text-body bg-white/5"
                placeholder="e.g. Wolfstone Digital"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                disabled={running}
              />
            </div>
            <div>
              <label className="text-overline text-muted-foreground mb-2 block">Models to query</label>
              <div className="flex gap-2 mt-1">
                {[
                  { id: "claude", label: "Claude" },
                  { id: "gemini", label: "Gemini" },
                  { id: "chatgpt", label: "ChatGPT" },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => toggleModel(m.id)}
                    disabled={running}
                    className={`px-4 py-2.5 rounded-md text-[13px] font-bold tracking-wide transition-all ${
                      selectedModels.includes(m.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/5 border border-white/10 text-muted-foreground hover:border-primary/30"
                    } disabled:opacity-50`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Prompts */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-overline text-muted-foreground">Prompts ({validPrompts.length}/{MAX_PROMPTS})</label>
              <button
                onClick={addPrompt}
                disabled={prompts.length >= MAX_PROMPTS || running}
                className="inline-flex items-center gap-1 text-xs text-primary hover:text-accent transition-colors disabled:opacity-30"
              >
                <Plus size={14} /> Add prompt
              </button>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {prompts.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-[10px] text-muted-foreground/50 mt-3 w-6 text-right shrink-0">{i + 1}</span>
                  <input
                    type="text"
                    className="flex-1 border border-white/10 rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-colors text-body-sm bg-white/5"
                    placeholder={`Prompt ${i + 1}...`}
                    value={p}
                    onChange={(e) => updatePrompt(i, e.target.value)}
                    onPaste={(e) => handlePaste(e, i)}
                    disabled={running}
                  />
                  {prompts.length > 1 && (
                    <button onClick={() => removePrompt(i)} disabled={running} className="text-muted-foreground/30 hover:text-red-400 transition-colors disabled:opacity-30">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground/40 mt-2">Tip: paste multiple lines to add prompts in bulk</p>
          </div>

          {/* Action */}
          <div className="flex items-center gap-4">
            <button
              onClick={startAnalysis}
              disabled={running || !brandName.trim() || validPrompts.length === 0 || selectedModels.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-accent transition-colors duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {running ? (
                <><Loader2 size={16} className="animate-spin" /> Scanning {doneCount + errorCount}/{jobs.length}...</>
              ) : (
                <><Brain size={16} /> Scan {validPrompts.length} prompt{validPrompts.length !== 1 ? "s" : ""} × {selectedModels.length} model{selectedModels.length !== 1 ? "s" : ""}</>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Results */}
      {jobs.length > 0 && (
        <section className="pb-16 md:pb-24">
          <div className="container max-w-5xl">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-overline text-muted-foreground">Progress</span>
                <span className="text-xs text-muted-foreground">
                  {doneCount} done · {errorCount} failed · {jobs.length - doneCount - errorCount} remaining
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${((doneCount + errorCount) / jobs.length) * 100}%` }} />
              </div>
            </div>

            {/* Dashboard */}
            {!running && doneCount > 0 && (
              <div className="space-y-6 mb-8">
                {/* Score + summary stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="col-span-2 md:col-span-1 bg-card border border-primary/[0.15] rounded-[12px] p-5 text-center">
                    <p className="text-overline text-muted-foreground mb-2">Visibility</p>
                    <p className={`text-[2.5rem] font-black leading-none ${getScoreColor(visibilityScore)}`}>{visibilityScore}</p>
                    <p className="text-overline text-muted-foreground mt-1">/ 100</p>
                  </div>
                  {[
                    { label: "Cited", value: overallStats.cited, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                    { label: "Recommended", value: overallStats.recommended, color: "text-primary", bg: "bg-primary/10" },
                    { label: "Mentioned", value: overallStats.mentioned, color: "text-amber-400", bg: "bg-amber-400/10" },
                    { label: "Absent", value: overallStats.absent, color: "text-red-400", bg: "bg-red-400/10" },
                  ].map(s => (
                    <div key={s.label} className={`${s.bg} border border-white/5 rounded-[12px] p-4 text-center`}>
                      <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Platform comparison bar */}
                  <div className="bg-card border border-primary/[0.15] rounded-[12px] p-5">
                    <p className="text-overline text-muted-foreground mb-4">Visibility by platform</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={platformStats} barSize={24}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(190, 100%, 45%, 0.08)" />
                        <XAxis dataKey="platform" tick={{ fill: "hsl(207, 54%, 77%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "hsl(207, 54%, 77%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: "hsl(222, 68%, 21%)", border: "1px solid hsl(190, 100%, 45%, 0.2)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                        <Bar dataKey="cited" stackId="a" fill="#34d399" name="Cited" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="recommended" stackId="a" fill="#00bcd4" name="Recommended" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="mentioned" stackId="a" fill="#fbbf24" name="Mentioned" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="absent" stackId="a" fill="#f87171" name="Absent" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Status distribution pie */}
                  <div className="bg-card border border-primary/[0.15] rounded-[12px] p-5">
                    <p className="text-overline text-muted-foreground mb-4">Overall distribution</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Cited", value: overallStats.cited },
                            { name: "Recommended", value: overallStats.recommended },
                            { name: "Mentioned", value: overallStats.mentioned },
                            { name: "Absent", value: overallStats.absent },
                          ].filter(d => d.value > 0)}
                          cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none"
                        >
                          <Cell fill="#34d399" />
                          <Cell fill="#00bcd4" />
                          <Cell fill="#fbbf24" />
                          <Cell fill="#f87171" />
                        </Pie>
                        <Tooltip contentStyle={{ background: "hsl(222, 68%, 21%)", border: "1px solid hsl(190, 100%, 45%, 0.2)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-3 justify-center mt-2">
                      {[
                        { label: "Cited", color: "#34d399" },
                        { label: "Recommended", color: "#00bcd4" },
                        { label: "Mentioned", color: "#fbbf24" },
                        { label: "Absent", color: "#f87171" },
                      ].map(l => (
                        <span key={l.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <span className="w-2 h-2 rounded-full" style={{ background: l.color }} /> {l.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top performing prompts */}
                <div className="bg-card border border-primary/[0.15] rounded-[12px] p-5">
                  <p className="text-overline text-muted-foreground mb-4">Prompt performance ranking</p>
                  <div className="space-y-2">
                    {completedJobs
                      .map(j => ({
                        prompt: j.prompt,
                        score: (j.results || []).reduce((acc, r) =>
                          acc + (r.status === "cited" ? 100 : r.status === "recommended" ? 75 : r.status === "mentioned" ? 40 : 0), 0
                        ) / Math.max((j.results || []).length, 1),
                      }))
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 10)
                      .map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className={`text-xs font-black w-6 text-right ${getScoreColor(item.score)}`}>{Math.round(item.score)}</span>
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${item.score}%` }} />
                          </div>
                          <span className="text-[11px] text-muted-foreground truncate max-w-[50%]">{item.prompt}</span>
                        </div>
                      ))
                    }
                  </div>
                </div>

                {/* Export */}
                <div className="flex justify-end">
                  <button
                    onClick={exportCSV}
                    className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-6 py-3 hover:bg-accent transition-colors duration-200 active:scale-[0.97]"
                  >
                    <Download size={16} /> Export CSV
                  </button>
                </div>
              </div>
            )}

            {/* Job list */}
            <div className="space-y-2">
              {jobs.map(job => (
                <PromptCard key={job.id} job={job} brandName={brandName} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default BulkAIChecker;
