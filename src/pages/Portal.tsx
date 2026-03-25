import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ScrollReveal from "@/components/ScrollReveal";
import {
  Plus, Trash2, Save, Loader2, LogOut, Download, Brain, Quote, Eye, EyeOff,
  ThumbsUp, TrendingUp, BarChart3, Shield, Users, ChevronDown, ChevronUp,
  FolderOpen, Globe, ArrowLeft, RefreshCw, Pencil, X
} from "lucide-react";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────
interface Profile {
  id?: string;
  full_name: string;
  email: string;
  company: string;
  daily_scan_limit: number;
  max_saved_prompts: number;
  monthly_refresh_credits: number;
  last_credit_reset: string;
}

interface Project {
  id: string;
  user_id: string;
  name: string;
  website: string;
  created_at: string;
}

interface SavedPrompt {
  id: string;
  user_id: string;
  project_id: string | null;
  brand_name: string;
  prompt_text: string;
  website: string;
  mode: "brand" | "citation";
  is_active: boolean;
  created_at: string;
}

interface TrackingResult {
  id: string;
  saved_prompt_id: string;
  scanned_at: string;
  platform: string;
  status: string;
  snippets: any;
  response: string;
}

// ─── Config ───────────────────────────────────────────────────────
const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  cited: { icon: Quote, color: "text-emerald-400", bg: "bg-emerald-400/10", label: "Cited" },
  recommended: { icon: ThumbsUp, color: "text-primary", bg: "bg-primary/10", label: "Recommended" },
  mentioned: { icon: Eye, color: "text-amber-400", bg: "bg-amber-400/10", label: "Mentioned" },
  absent: { icon: EyeOff, color: "text-red-400", bg: "bg-red-400/10", label: "Absent" },
};

const getScoreColor = (s: number) => s >= 70 ? "text-emerald-400" : s >= 40 ? "text-amber-400" : "text-red-400";

const calcScore = (results: TrackingResult[]) => {
  if (results.length === 0) return 0;
  return Math.round(((
    results.filter(r => r.status === "cited").length * 100 +
    results.filter(r => r.status === "recommended").length * 75 +
    results.filter(r => r.status === "mentioned").length * 40
  ) / (results.length * 100)) * 100);
};

const buildTrend = (results: TrackingResult[]) => {
  const grouped: Record<string, Record<string, number>> = {};
  results.forEach(tr => {
    const date = tr.scanned_at.slice(0, 10);
    if (!grouped[date]) grouped[date] = { cited: 0, recommended: 0, mentioned: 0, absent: 0, total: 0 };
    grouped[date][tr.status] = (grouped[date][tr.status] || 0) + 1;
    grouped[date].total++;
  });
  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, stats]) => ({
      date: date.slice(5),
      score: stats.total > 0 ? Math.round(((stats.cited * 100 + stats.recommended * 75 + stats.mentioned * 40) / (stats.total * 100)) * 100) : 0,
    }));
};

const getLatest = (results: TrackingResult[]) => {
  const latestDate = results[0]?.scanned_at?.slice(0, 10);
  return results.filter(r => r.scanned_at?.slice(0, 10) === latestDate);
};

// ─── Reusable: visibility dashboard for a set of results ──────────
const VisibilityDashboard = ({ results, prompts, expandedPrompt, setExpandedPrompt }: {
  results: TrackingResult[];
  prompts: SavedPrompt[];
  expandedPrompt: string | null;
  setExpandedPrompt: (id: string | null) => void;
}) => {
  const latest = getLatest(results);
  const score = calcScore(latest);
  const trend = buildTrend(results);

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <Brain className="w-10 h-10 text-primary/30 mx-auto mb-3" />
        <p className="text-body text-muted-foreground">No tracking data yet. Results will appear after the first daily scan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Score cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="col-span-2 md:col-span-1 bg-card border border-primary/[0.15] rounded-[12px] p-5 text-center">
          <p className="text-overline text-muted-foreground mb-2">Visibility</p>
          <p className={`text-[2.5rem] font-black leading-none ${getScoreColor(score)}`}>{score}</p>
          <p className="text-overline text-muted-foreground mt-1">/ 100</p>
        </div>
        {[
          { label: "Cited", value: latest.filter(r => r.status === "cited").length, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { label: "Recommended", value: latest.filter(r => r.status === "recommended").length, color: "text-primary", bg: "bg-primary/10" },
          { label: "Mentioned", value: latest.filter(r => r.status === "mentioned").length, color: "text-amber-400", bg: "bg-amber-400/10" },
          { label: "Absent", value: latest.filter(r => r.status === "absent").length, color: "text-red-400", bg: "bg-red-400/10" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border border-primary/5 rounded-[12px] p-4 text-center`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Trend */}
      {trend.length > 1 && (
        <div className="bg-card border border-primary/[0.15] rounded-[12px] p-5">
          <p className="text-overline text-muted-foreground mb-4">Visibility score over time</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(190, 100%, 45%, 0.08)" />
              <XAxis dataKey="date" tick={{ fill: "hsl(207, 54%, 77%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "hsl(207, 54%, 77%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(222, 68%, 21%)", border: "1px solid hsl(190, 100%, 45%, 0.2)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
              <Line type="monotone" dataKey="score" stroke="#00bcd4" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Platform breakdown */}
      <div className="bg-card border border-primary/[0.15] rounded-[12px] p-5">
        <p className="text-overline text-muted-foreground mb-4">Latest results by platform</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={["Google Gemini", "ChatGPT", "Claude", "Web Search"].map(platform => {
            const pResults = latest.filter(r => r.platform === platform);
            return {
              platform: platform.split(" ").pop(),
              cited: pResults.filter(r => r.status === "cited").length,
              recommended: pResults.filter(r => r.status === "recommended").length,
              mentioned: pResults.filter(r => r.status === "mentioned").length,
              absent: pResults.filter(r => r.status === "absent").length,
            };
          })} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(190, 100%, 45%, 0.08)" />
            <XAxis dataKey="platform" tick={{ fill: "hsl(207, 54%, 77%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(207, 54%, 77%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "hsl(222, 68%, 21%)", border: "1px solid hsl(190, 100%, 45%, 0.2)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
            <Bar dataKey="cited" stackId="a" fill="#34d399" name="Cited" />
            <Bar dataKey="recommended" stackId="a" fill="#00bcd4" name="Recommended" />
            <Bar dataKey="mentioned" stackId="a" fill="#fbbf24" name="Mentioned" />
            <Bar dataKey="absent" stackId="a" fill="#f87171" name="Absent" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per-prompt breakdown */}
      <div className="space-y-2">
        <p className="text-overline text-muted-foreground mb-3">Prompt-by-prompt breakdown</p>
        {prompts.filter(p => results.some(r => r.saved_prompt_id === p.id)).map(p => {
          const pResults = results.filter(tr => tr.saved_prompt_id === p.id);
          const latestForPrompt = getLatest(pResults);
          const cited = latestForPrompt.filter(r => r.status === "cited" || r.status === "recommended").length;
          const isExpanded = expandedPrompt === p.id;
          return (
            <div key={p.id} className="bg-card border border-primary/[0.15] rounded-[12px] overflow-hidden">
              <button onClick={() => setExpandedPrompt(isExpanded ? null : p.id)} className="w-full flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors text-left">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cited > 0 ? "bg-emerald-400/10" : "bg-red-400/10"}`}>
                  <span className={`text-sm font-black ${cited > 0 ? "text-emerald-400" : "text-red-400"}`}>{cited}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-medium text-foreground truncate">
                    {p.brand_name}{p.prompt_text ? ` — "${p.prompt_text}"` : " (brand only)"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${p.mode === "citation" ? "bg-emerald-400/10 text-emerald-400" : "bg-primary/10 text-primary"}`}>
                      {p.mode}
                    </span>
                    {p.website && <span className="text-[10px] text-muted-foreground/50 truncate max-w-[200px]">{p.website}</span>}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{cited}/{latestForPrompt.length}</span>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {isExpanded && (
                <div className="border-t border-primary/5 p-4 space-y-3">
                  {latestForPrompt.map(r => {
                    const cfg = statusConfig[r.status] || statusConfig.absent;
                    const Icon = cfg.icon;
                    return (
                      <div key={r.id} className="bg-background/50 border border-primary/5 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-body-sm font-bold">{r.platform}</span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
                            <Icon className="w-3 h-3" /> {cfg.label}
                          </span>
                        </div>
                        {Array.isArray(r.snippets) && r.snippets.length > 0 && (
                          <p className="text-[11px] text-muted-foreground pl-3 border-l-2 border-primary/30 mt-1">
                            "...{(r.snippets as string[])[0]}..."
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────
const Portal = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectWebsite, setNewProjectWebsite] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);

  // Prompts & results
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [trackingResults, setTrackingResults] = useState<TrackingResult[]>([]);

  // New prompt form
  const [newBrand, setNewBrand] = useState("");
  const [newPrompt, setNewPrompt] = useState("");
  const [newWebsite, setNewWebsite] = useState("");
  const [newMode, setNewMode] = useState<"brand" | "citation">("brand");
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<SavedPrompt | null>(null);
  const [editBrand, setEditBrand] = useState("");
  const [editPromptText, setEditPromptText] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editMode, setEditMode] = useState<"brand" | "citation">("brand");

  // Admin
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"projects" | "prompts" | "admin" | "clients">("projects");
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);

  // Admin: all clients
  const [allProfiles, setAllProfiles] = useState<(Profile & { id: string })[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [allPrompts, setAllPrompts] = useState<SavedPrompt[]>([]);
  const [allTrackingResults, setAllTrackingResults] = useState<TrackingResult[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClientProjectId, setSelectedClientProjectId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/portal/login"); return; }
    setUserId(user.id);

    const [profileRes, rolesRes, projectsRes, promptsRes, trackingRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("user_roles").select("role").eq("user_id", user.id),
      supabase.from("projects").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("saved_prompts").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("prompt_tracking_results").select("*").order("scanned_at", { ascending: false }),
    ]);

    if (profileRes.data) setProfile(profileRes.data as unknown as Profile);
    const adminRole = (rolesRes.data || []).some((r: any) => r.role === "admin");
    setIsAdmin(adminRole);
    setProjects((projectsRes.data || []) as unknown as Project[]);
    setSavedPrompts((promptsRes.data || []) as unknown as SavedPrompt[]);
    setTrackingResults((trackingRes.data || []) as unknown as TrackingResult[]);

    if (adminRole) {
      const [reqsRes, allProfilesRes, allProjectsRes, allPromptsRes, allTrackingRes] = await Promise.all([
        supabase.from("client_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*"),
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
        supabase.from("saved_prompts").select("*").order("created_at", { ascending: false }),
        supabase.from("prompt_tracking_results").select("*").order("scanned_at", { ascending: false }),
      ]);
      setPendingRequests(reqsRes.data || []);
      setAllProfiles((allProfilesRes.data || []) as unknown as (Profile & { id: string })[]);
      setAllProjects((allProjectsRes.data || []) as unknown as Project[]);
      setAllPrompts((allPromptsRes.data || []) as unknown as SavedPrompt[]);
      setAllTrackingResults((allTrackingRes.data || []) as unknown as TrackingResult[]);
    }

    setLoading(false);
  }, [navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/portal/login");
  };

  // ─── Project CRUD ─────────────────────────────────────────────
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !userId) return;
    setCreatingProject(true);
    try {
      const { error } = await supabase.from("projects").insert({
        user_id: userId,
        name: newProjectName.trim(),
        website: newProjectWebsite.trim(),
      } as any);
      if (error) throw error;
      toast.success("Project created.");
      setNewProjectName("");
      setNewProjectWebsite("");
      loadData();
    } catch (err: any) {
      toast.error(err?.message?.includes("duplicate") ? "A project with that name already exists." : "Failed to create project.");
    } finally {
      setCreatingProject(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Delete this project and all its prompts? This cannot be undone.")) return;
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      if (selectedProjectId === id) setSelectedProjectId(null);
      toast.success("Project deleted.");
      loadData();
    } catch {
      toast.error("Failed to delete project.");
    }
  };

  // ─── Prompt CRUD ──────────────────────────────────────────────
  const handleSavePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand.trim() || !userId || !selectedProjectId) return;

    // Split by newlines for bulk adding
    const promptLines = newPrompt.trim()
      ? newPrompt.split("\n").map(l => l.trim()).filter(Boolean)
      : [""];

    const totalAfter = savedPrompts.length + promptLines.length;
    if (!isAdmin && totalAfter > (profile?.max_saved_prompts || 10)) {
      toast.error(`Adding ${promptLines.length} prompt(s) would exceed your limit of ${profile?.max_saved_prompts || 10}.`);
      return;
    }

    setSaving(true);
    try {
      const rows = promptLines.map(line => ({
        user_id: userId,
        project_id: selectedProjectId,
        brand_name: newBrand.trim(),
        prompt_text: line,
        website: newWebsite.trim(),
        mode: newMode,
      }));
      const { error } = await supabase.from("saved_prompts").insert(rows as any);
      if (error) throw error;
      toast.success(promptLines.length > 1 ? `${promptLines.length} prompts saved — they'll be scanned daily.` : "Prompt saved — it will be scanned daily.");
      setNewBrand("");
      setNewPrompt("");
      setNewWebsite("");
      loadData();
    } catch {
      toast.error("Failed to save prompt(s).");
    } finally {
      setSaving(false);
    }
  };

  const startEditPrompt = (sp: SavedPrompt) => {
    setEditingPrompt(sp);
    setEditBrand(sp.brand_name);
    setEditPromptText(sp.prompt_text);
    setEditWebsite(sp.website || "");
    setEditMode(sp.mode);
  };

  const handleUpdatePrompt = async () => {
    if (!editingPrompt || !editBrand.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("saved_prompts").update({
        brand_name: editBrand.trim(),
        prompt_text: editPromptText.trim(),
        website: editWebsite.trim(),
        mode: editMode,
      } as any).eq("id", editingPrompt.id);
      if (error) throw error;
      toast.success("Prompt updated.");
      setEditingPrompt(null);
      loadData();
    } catch {
      toast.error("Failed to update prompt.");
    } finally {
      setSaving(false);
    }
  };

  // ─── Refresh / Regenerate report ──────────────────────────────
  const handleRefreshReport = async () => {
    if (!userId) return;

    // Check credits (admin = unlimited) — deduction handled server-side via RPC
    if (!isAdmin) {
      const { data: remainingCredits, error: creditErr } = await supabase.rpc("deduct_refresh_credit", {
        _user_id: userId,
      });
      if (creditErr) {
        toast.error("Failed to check refresh credits.");
        return;
      }
      if (remainingCredits === -1) {
        toast.error("No refresh credits remaining this month. Credits reset monthly.");
        return;
      }
      // Update local profile state with new credit count
      if (profile) {
        profile.monthly_refresh_credits = remainingCredits;
      }
    }

    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke("daily-prompt-scanner", {
        body: { force: true, userId },
      });
      if (error) throw error;
      toast.success(`Report refreshed — ${data?.scanned || 0} prompt(s) scanned.`);
      loadData();
    } catch {
      toast.error("Failed to refresh report. Please try again later.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeletePrompt = async (id: string) => {
    try {
      const { error } = await supabase.from("saved_prompts").delete().eq("id", id);
      if (error) throw error;
      setSavedPrompts(prev => prev.filter(p => p.id !== id));
      toast.success("Prompt deleted.");
    } catch {
      toast.error("Failed to delete prompt.");
    }
  };

  // ─── Admin actions ────────────────────────────────────────────
  const handleApproveRequest = async (requestId: string, email: string, name: string) => {
    try {
      const { error } = await supabase.functions.invoke("portal-admin", {
        body: { action: "approve", requestId, email, name },
      });
      if (error) throw error;
      toast.success(`Access approved for ${email}.`);
      loadData();
    } catch {
      toast.error("Failed to approve request.");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase.from("client_requests").update({
        status: "rejected" as any,
        reviewed_at: new Date().toISOString(),
      }).eq("id", requestId);
      if (error) throw error;
      toast.success("Request rejected.");
      loadData();
    } catch {
      toast.error("Failed to reject request.");
    }
  };

  // ─── Derived data ─────────────────────────────────────────────
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const projectPrompts = savedPrompts.filter(sp => sp.project_id === selectedProjectId);
  const projectResults = trackingResults.filter(tr => projectPrompts.some(sp => sp.id === tr.saved_prompt_id));
  const allUserResults = trackingResults.filter(tr => savedPrompts.some(sp => sp.id === tr.saved_prompt_id));

  const exportCSV = () => {
    const results = selectedProjectId ? projectResults : allUserResults;
    const prompts = selectedProjectId ? projectPrompts : savedPrompts;
    if (results.length === 0) return;
    const headers = ["Date", "Project", "Brand", "Website", "Prompt", "Mode", "Platform", "Status"];
    const rows = results.map(tr => {
      const sp = prompts.find(s => s.id === tr.saved_prompt_id);
      const proj = projects.find(p => p.id === sp?.project_id);
      const esc = (s: string) => `"${(s || "").replace(/"/g, '""')}"`;
      return [tr.scanned_at.slice(0, 10), esc(proj?.name || ""), esc(sp?.brand_name || ""), esc(sp?.website || ""), esc(sp?.prompt_text || ""), sp?.mode || "", esc(tr.platform), tr.status].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ai-tracking-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const inputClass = "w-full bg-background border border-primary/20 rounded-md px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors duration-200 text-body";

  const tabClass = (tab: string) =>
    `px-5 py-3 text-body-sm font-bold tracking-wide transition-colors duration-200 border-b-2 ${
      activeTab === tab ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground hover:border-primary/30"
    }`;

  if (loading) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </main>
    );
  }

  return (
    <main className="pt-20 min-h-screen bg-background">
      {/* Header */}
      <section className="bg-secondary border-b border-primary/10">
        <div className="container py-4 flex items-center justify-between">
          <div>
            <h1 className="text-h3 mb-0.5">
              Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}
            </h1>
            <p className="text-body-sm text-muted-foreground">
              {profile?.company && <>{profile.company} · </>}
              {isAdmin ? "Admin account" : `${savedPrompts.length}/${profile?.max_saved_prompts || 10} saved prompts`}
              {" · "}{projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportCSV} className="inline-flex items-center gap-1.5 text-body-sm text-muted-foreground hover:text-foreground transition-colors">
              <Download size={16} /> Export
            </button>
            <button onClick={handleSignOut} className="inline-flex items-center gap-2 text-body-sm text-muted-foreground hover:text-foreground transition-colors">
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="container">
        <div className="flex gap-0 border-b border-primary/10">
          <button onClick={() => setActiveTab("projects")} className={tabClass("projects")}>
            <span className="flex items-center gap-2"><FolderOpen size={16} /> Projects</span>
          </button>
          <button onClick={() => setActiveTab("prompts")} className={tabClass("prompts")}>
            <span className="flex items-center gap-2"><Brain size={16} /> Prompts</span>
          </button>
          {isAdmin && (
            <button onClick={() => setActiveTab("clients")} className={tabClass("clients")}>
              <span className="flex items-center gap-2"><Users size={16} /> Clients</span>
            </button>
          )}
          {isAdmin && (
            <button onClick={() => setActiveTab("admin")} className={tabClass("admin")}>
              <span className="flex items-center gap-2"><Shield size={16} /> Requests</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Projects tab ───────────────────────────────────────── */}
      {activeTab === "projects" && (
        <section className="py-8 md:py-12">
          <div className="container max-w-5xl">
            {!selectedProjectId ? (
              <>
                {/* Create project */}
                <div className="bg-card border border-primary/[0.15] rounded-[12px] p-6 mb-8">
                  <h2 className="text-h3 mb-4">Create a project</h2>
                  <form onSubmit={handleCreateProject} className="flex flex-col sm:flex-row gap-3">
                    <input type="text" className={inputClass} placeholder="Project name *" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} maxLength={100} required />
                    <input type="url" className={inputClass} placeholder="Website URL (e.g. https://example.com)" value={newProjectWebsite} onChange={(e) => setNewProjectWebsite(e.target.value)} maxLength={300} />
                    <button
                      type="submit"
                      disabled={creatingProject || !newProjectName.trim()}
                      className="shrink-0 inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-6 py-3 hover:bg-accent transition-colors disabled:opacity-50"
                    >
                      {creatingProject ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Create
                    </button>
                  </form>
                </div>

                {/* Project list */}
                {projects.length === 0 ? (
                  <div className="text-center py-16">
                    <FolderOpen className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                    <h2 className="text-h2 mb-2">No projects yet</h2>
                    <p className="text-body text-muted-foreground">Create a project above to start tracking AI visibility for your brands.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map(proj => {
                      const pPrompts = savedPrompts.filter(sp => sp.project_id === proj.id);
                      const pResults = trackingResults.filter(tr => pPrompts.some(sp => sp.id === tr.saved_prompt_id));
                      const latest = getLatest(pResults);
                      const score = latest.length > 0 ? calcScore(latest) : null;

                      return (
                        <div key={proj.id} className="bg-card border border-primary/[0.15] rounded-[12px] p-5 group hover:border-primary/40 transition-all">
                          <button onClick={() => setSelectedProjectId(proj.id)} className="w-full text-left">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="text-body font-bold text-foreground group-hover:text-primary transition-colors">{proj.name}</p>
                                {proj.website && (
                                  <p className="text-[11px] text-muted-foreground/50 flex items-center gap-1 mt-0.5">
                                    <Globe className="w-3 h-3" /> {proj.website}
                                  </p>
                                )}
                              </div>
                              {score !== null && (
                                <span className={`text-lg font-black ${getScoreColor(score)}`}>{score}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                <Brain className="w-3 h-3 inline mr-1" />{pPrompts.length} prompts
                              </span>
                              {latest.length > 0 && (
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                  <TrendingUp className="w-3 h-3 inline mr-1" />{latest.length} results
                                </span>
                              )}
                            </div>
                          </button>
                          <div className="mt-3 pt-3 border-t border-primary/5 flex justify-end">
                            <button onClick={() => handleDeleteProject(proj.id)} className="text-muted-foreground/30 hover:text-red-400 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              /* Selected project dashboard */
              <div>
                <button onClick={() => setSelectedProjectId(null)} className="inline-flex items-center gap-2 text-body-sm text-primary hover:text-accent transition-colors mb-6">
                  <ArrowLeft size={14} /> Back to projects
                </button>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-h2">{selectedProject?.name}</h2>
                    {selectedProject?.website && (
                      <p className="text-body-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                        <Globe className="w-3.5 h-3.5" /> {selectedProject.website}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-overline text-muted-foreground">{projectPrompts.length} prompts</span>
                    <button
                      onClick={handleRefreshReport}
                      disabled={refreshing}
                      className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-5 py-2.5 hover:bg-accent transition-colors disabled:opacity-50"
                    >
                      {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                      {refreshing ? "Scanning..." : "Refresh report"}
                    </button>
                  </div>
                </div>
                {!isAdmin && (
                  <p className="text-[10px] text-muted-foreground/60 mb-4">
                    {profile?.monthly_refresh_credits ?? 0} refresh credit{(profile?.monthly_refresh_credits ?? 0) !== 1 ? "s" : ""} remaining this month
                  </p>
                )}

                <VisibilityDashboard
                  results={projectResults}
                  prompts={projectPrompts}
                  expandedPrompt={expandedPrompt}
                  setExpandedPrompt={setExpandedPrompt}
                />

                {/* Quick add prompt for this project */}
                <div className="bg-card border border-primary/[0.15] rounded-[12px] p-6 mt-8">
                  <h3 className="text-h3 mb-4">Add prompt to this project</h3>
                  <form onSubmit={handleSavePrompt} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="text" className={inputClass} placeholder="Brand name *" value={newBrand} onChange={(e) => setNewBrand(e.target.value)} maxLength={100} required />
                      <input type="url" className={inputClass} placeholder="Website URL (optional)" value={newWebsite} onChange={(e) => setNewWebsite(e.target.value)} maxLength={300} />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setNewMode("brand")} className={`flex-1 px-4 py-3 rounded-md text-[13px] font-bold tracking-wide transition-all ${newMode === "brand" ? "bg-primary text-primary-foreground" : "bg-background border border-primary/20 text-muted-foreground hover:border-primary/40"}`}>
                        Brand visibility
                      </button>
                      <button type="button" onClick={() => setNewMode("citation")} className={`flex-1 px-4 py-3 rounded-md text-[13px] font-bold tracking-wide transition-all ${newMode === "citation" ? "bg-primary text-primary-foreground" : "bg-background border border-primary/20 text-muted-foreground hover:border-primary/40"}`}>
                        Citation tracking
                      </button>
                    </div>
                    <textarea
                      className={`${inputClass} min-h-[90px] resize-none`}
                      placeholder={newMode === "brand"
                        ? "Enter prompts — one per line for bulk adding\ne.g. What are the best SEO agencies in the UK?\nWho are the top digital marketing firms?"
                        : "Enter prompts — one per line for bulk adding\ne.g. What sources would you recommend for investment advice?\nWhere can I find reliable financial guidance?"}
                      value={newPrompt}
                      onChange={(e) => setNewPrompt(e.target.value)}
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-muted-foreground/50">
                        {isAdmin ? "Unlimited prompts" : `${savedPrompts.length}/${profile?.max_saved_prompts || 10} used`}
                        {newPrompt.includes("\n") && ` · ${newPrompt.split("\n").filter(l => l.trim()).length} prompts detected`}
                      </p>
                      <button
                        type="submit"
                        disabled={saving || !newBrand.trim()}
                        className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-6 py-3 hover:bg-accent transition-colors disabled:opacity-50"
                      >
                        {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> {newPrompt.split("\n").filter(l => l.trim()).length > 1 ? "Save prompts" : "Save prompt"}</>}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Prompts tab (all prompts across projects) ───────────── */}
      {activeTab === "prompts" && (
        <section className="py-8 md:py-12">
          <div className="container max-w-3xl">
            <div className="space-y-3">
              {savedPrompts.length === 0 ? (
                <div className="text-center py-12">
                  <Brain className="w-10 h-10 text-primary/30 mx-auto mb-3" />
                  <p className="text-body text-muted-foreground mb-4">No saved prompts yet. Create a project first, then add prompts.</p>
                  <button onClick={() => setActiveTab("projects")} className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-6 py-3 hover:bg-accent transition-colors">
                    <FolderOpen size={16} /> Go to projects
                  </button>
                </div>
              ) : savedPrompts.map(sp => {
                const proj = projects.find(p => p.id === sp.project_id);
                return (
                  <div key={sp.id} className="bg-card border border-primary/[0.15] rounded-[12px] p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-body-sm font-bold text-foreground">{sp.brand_name}</span>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${sp.mode === "citation" ? "bg-emerald-400/10 text-emerald-400" : "bg-primary/10 text-primary"}`}>
                          {sp.mode}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{sp.prompt_text || "(brand visibility only)"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {proj && <span className="text-[10px] text-primary/60"><FolderOpen className="w-3 h-3 inline mr-0.5" />{proj.name}</span>}
                        {sp.website && <span className="text-[10px] text-muted-foreground/40"><Globe className="w-3 h-3 inline mr-0.5" />{sp.website}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => startEditPrompt(sp)} className="text-muted-foreground/30 hover:text-primary transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDeletePrompt(sp.id)} className="text-muted-foreground/30 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Edit prompt modal ─────────────────────────────────── */}
      {editingPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-primary/20 rounded-[16px] p-6 w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-h3">Edit prompt</h3>
              <button onClick={() => setEditingPrompt(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" className={inputClass} placeholder="Brand name *" value={editBrand} onChange={(e) => setEditBrand(e.target.value)} maxLength={100} />
                <input type="url" className={inputClass} placeholder="Website URL (optional)" value={editWebsite} onChange={(e) => setEditWebsite(e.target.value)} maxLength={300} />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditMode("brand")} className={`flex-1 px-4 py-3 rounded-md text-[13px] font-bold tracking-wide transition-all ${editMode === "brand" ? "bg-primary text-primary-foreground" : "bg-background border border-primary/20 text-muted-foreground hover:border-primary/40"}`}>
                  Brand visibility
                </button>
                <button type="button" onClick={() => setEditMode("citation")} className={`flex-1 px-4 py-3 rounded-md text-[13px] font-bold tracking-wide transition-all ${editMode === "citation" ? "bg-primary text-primary-foreground" : "bg-background border border-primary/20 text-muted-foreground hover:border-primary/40"}`}>
                  Citation tracking
                </button>
              </div>
              <textarea
                className={`${inputClass} min-h-[80px] resize-none`}
                placeholder="Prompt text"
                value={editPromptText}
                onChange={(e) => setEditPromptText(e.target.value)}
              />
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setEditingPrompt(null)} className="px-5 py-2.5 rounded-md text-[13px] font-bold text-muted-foreground hover:text-foreground transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePrompt}
                  disabled={saving || !editBrand.trim()}
                  className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-6 py-2.5 hover:bg-accent transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Clients tab (admin only) ───────────────────────────── */}
      {activeTab === "clients" && isAdmin && (
        <section className="py-8 md:py-12">
          <div className="container max-w-5xl">
            {!selectedClientId ? (
              <>
                <h2 className="text-h2 mb-6">Client accounts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allProfiles.map(client => {
                    const clientProjects = allProjects.filter(p => p.user_id === client.id);
                    const clientPrompts = allPrompts.filter(sp => sp.user_id === client.id);
                    return (
                      <button
                        key={client.id}
                        onClick={() => { setSelectedClientId(client.id); setSelectedClientProjectId(null); }}
                        className="bg-card border border-primary/[0.15] rounded-[12px] p-5 text-left hover:border-primary/40 transition-all group"
                      >
                        <p className="text-body font-bold text-foreground group-hover:text-primary transition-colors">{client.full_name || "Unnamed"}</p>
                        <p className="text-body-sm text-muted-foreground">{client.email}</p>
                        {client.company && <p className="text-[11px] text-muted-foreground/60">{client.company}</p>}
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-primary/5">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            <FolderOpen className="w-3 h-3 inline mr-1" />{clientProjects.length} projects
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            <Brain className="w-3 h-3 inline mr-1" />{clientPrompts.length} prompts
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {allProfiles.length === 0 && (
                  <p className="text-body text-muted-foreground text-center py-12">No client accounts yet.</p>
                )}
              </>
            ) : (() => {
              const client = allProfiles.find(p => p.id === selectedClientId);
              const clientProjects = allProjects.filter(p => p.user_id === selectedClientId);
              const clientPrompts = allPrompts.filter(sp => sp.user_id === selectedClientId);

              if (selectedClientProjectId) {
                const proj = clientProjects.find(p => p.id === selectedClientProjectId);
                const projPrompts = clientPrompts.filter(sp => sp.project_id === selectedClientProjectId);
                const projResults = allTrackingResults.filter(tr => projPrompts.some(sp => sp.id === tr.saved_prompt_id));

                return (
                  <div>
                    <button onClick={() => setSelectedClientProjectId(null)} className="inline-flex items-center gap-2 text-body-sm text-primary hover:text-accent transition-colors mb-6">
                      <ArrowLeft size={14} /> Back to {client?.full_name}'s projects
                    </button>
                    <div className="mb-6">
                      <h2 className="text-h2">{proj?.name}</h2>
                      {proj?.website && <p className="text-body-sm text-muted-foreground flex items-center gap-1.5 mt-1"><Globe className="w-3.5 h-3.5" /> {proj.website}</p>}
                      <p className="text-[10px] text-muted-foreground/50 mt-1">Client: {client?.full_name} · {client?.email}</p>
                    </div>
                    <VisibilityDashboard results={projResults} prompts={projPrompts} expandedPrompt={expandedPrompt} setExpandedPrompt={setExpandedPrompt} />
                  </div>
                );
              }

              return (
                <div>
                  <button onClick={() => setSelectedClientId(null)} className="inline-flex items-center gap-2 text-body-sm text-primary hover:text-accent transition-colors mb-6">
                    <ArrowLeft size={14} /> Back to all clients
                  </button>
                  <div className="mb-6">
                    <h2 className="text-h2">{client?.full_name || "Client"}</h2>
                    <p className="text-body-sm text-muted-foreground">{client?.email} {client?.company && `· ${client.company}`}</p>
                    <p className="text-[10px] text-muted-foreground/50 mt-1">
                      {client?.max_saved_prompts === 9999 ? "Unlimited prompts" : `${clientPrompts.length}/${client?.max_saved_prompts} prompts`} · {client?.daily_scan_limit === 9999 ? "Unlimited scans" : `${client?.daily_scan_limit} scans/day`}
                    </p>
                  </div>

                  {clientProjects.length === 0 ? (
                    <p className="text-body text-muted-foreground text-center py-8">No projects yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {clientProjects.map(proj => {
                        const pPrompts = clientPrompts.filter(sp => sp.project_id === proj.id);
                        const pResults = allTrackingResults.filter(tr => pPrompts.some(sp => sp.id === tr.saved_prompt_id));
                        const latest = getLatest(pResults);
                        const score = latest.length > 0 ? calcScore(latest) : null;
                        return (
                          <button
                            key={proj.id}
                            onClick={() => setSelectedClientProjectId(proj.id)}
                            className="bg-card border border-primary/[0.15] rounded-[12px] p-5 text-left hover:border-primary/40 transition-all group"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-body font-bold text-foreground group-hover:text-primary transition-colors">{proj.name}</p>
                                {proj.website && <p className="text-[11px] text-muted-foreground/50 flex items-center gap-1 mt-0.5"><Globe className="w-3 h-3" />{proj.website}</p>}
                              </div>
                              {score !== null && <span className={`text-lg font-black ${getScoreColor(score)}`}>{score}</span>}
                            </div>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground"><Brain className="w-3 h-3 inline mr-1" />{pPrompts.length} prompts</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Unassigned prompts */}
                  {clientPrompts.filter(sp => !sp.project_id).length > 0 && (
                    <div className="mt-8">
                      <p className="text-overline text-muted-foreground mb-3">Unassigned prompts</p>
                      {clientPrompts.filter(sp => !sp.project_id).map(sp => (
                        <div key={sp.id} className="bg-card border border-primary/[0.15] rounded-[12px] p-4 mb-2">
                          <span className="text-body-sm font-bold text-foreground">{sp.brand_name}</span>
                          <span className={`ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${sp.mode === "citation" ? "bg-emerald-400/10 text-emerald-400" : "bg-primary/10 text-primary"}`}>{sp.mode}</span>
                          <p className="text-[11px] text-muted-foreground truncate mt-1">{sp.prompt_text || "(brand only)"}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </section>
      )}

      {/* ── Admin requests tab ─────────────────────────────────── */}
      {activeTab === "admin" && isAdmin && (
        <section className="py-8 md:py-12">
          <div className="container max-w-4xl">
            <h2 className="text-h2 mb-6">Access requests</h2>
            {pendingRequests.length === 0 ? (
              <p className="text-body text-muted-foreground text-center py-8">No requests.</p>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map(req => (
                  <div key={req.id} className="bg-card border border-primary/[0.15] rounded-[12px] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-body font-bold text-foreground">{req.full_name}</p>
                        <p className="text-body-sm text-muted-foreground">{req.email}</p>
                        {req.company && <p className="text-body-sm text-muted-foreground">{req.company}</p>}
                        {req.message && <p className="text-body-sm text-muted-foreground mt-2 italic whitespace-pre-line">"{req.message}"</p>}
                        <p className="text-[10px] text-muted-foreground/50 mt-2">{new Date(req.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {req.status === "pending" ? (
                          <>
                            <button onClick={() => handleApproveRequest(req.id, req.email, req.full_name)} className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 text-white text-[11px] font-bold uppercase px-4 py-2 hover:bg-emerald-600 transition-colors">Approve</button>
                            <button onClick={() => handleRejectRequest(req.id)} className="inline-flex items-center gap-1.5 rounded-md bg-red-500/10 text-red-400 text-[11px] font-bold uppercase px-4 py-2 hover:bg-red-500/20 transition-colors">Reject</button>
                          </>
                        ) : (
                          <span className={`text-[11px] font-bold uppercase px-3 py-1.5 rounded ${req.status === "approved" ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400"}`}>{req.status}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
};

export default Portal;
