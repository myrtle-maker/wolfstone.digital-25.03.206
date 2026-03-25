import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ScrollReveal from "@/components/ScrollReveal";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  Link2, Brain, ArrowRight, Loader2, Zap, LogIn
} from "lucide-react";

const internalTools = [
  {
    icon: Link2,
    title: "Bulk Backlink Checker",
    desc: "Analyse up to 100 backlink URLs in a single batch — domain authority, spam risk, content quality, and estimated value for each. Full CSV export.",
    path: "/internal/bulk-backlink-checker",
    cta: "Open tool",
  },
  {
    icon: Brain,
    title: "Bulk AI Exposure Scanner",
    desc: "Test up to 50 prompts against Claude, Gemini, and ChatGPT simultaneously. Rich dashboard with visibility scoring, platform comparison charts, and CSV export.",
    path: "/internal/bulk-ai-checker",
    cta: "Open tool",
  },
];

const ProTools = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex, nofollow";
    document.title = "Pro Tools — Wolfstone Digital";
    return () => { if (meta) meta.content = ""; };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user has admin role
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin");
        setAuthenticated(roles && roles.length > 0);
      }
      setLoading(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin");
        setAuthenticated(roles && roles.length > 0);
      } else {
        setAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <main className="pt-20">
      <section className="bg-background py-16 md:py-28">
        <div className="container">
          <Breadcrumbs items={[
            { label: "Free SEO Tools", path: "/tools" },
            { label: "Pro Tools" },
          ]} />
          <ScrollReveal>
            <span className="text-overline text-primary mb-4 block">Pro tools</span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-display max-w-[20ch] mb-6">
              Internal <span className="wd-gradient-text">power tools</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-muted-foreground max-ch-70 mb-6">
              Bulk analysis tools for backlinks and AI exposure — built for our team and select partners.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.25}>
            <div className="bg-card/50 border border-primary/10 rounded-lg p-5 max-w-2xl">
              <p className="text-body-sm text-muted-foreground mb-3">
                <span className="text-foreground font-bold">Looking for the client portal?</span> Track your AI visibility over time with daily automated scanning and a personalised dashboard.
              </p>
              <Link to="/portal/login" className="inline-flex items-center gap-2 text-primary text-[13px] font-bold tracking-[0.05em] uppercase hover:text-accent transition-colors">
                Go to client portal <ArrowRight size={16} />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {loading ? (
        <section className="bg-secondary py-16 md:py-24">
          <div className="container flex justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        </section>
      ) : !authenticated ? (
        <section className="bg-secondary py-16 md:py-24">
          <div className="container">
            <ScrollReveal>
              <div className="max-w-lg mx-auto text-center">
                <div className="bg-card border border-primary/20 rounded-[16px] p-8 md:p-10 shadow-2xl">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/20 mb-5">
                    <LogIn className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-h2 mb-3">Sign in required</h2>
                  <p className="text-body-sm text-muted-foreground mb-6">
                    Pro tools are available to Wolfstone Digital team members. Please sign in to your account.
                  </p>
                  <Link
                    to="/portal/login"
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-accent transition-colors duration-200 active:scale-[0.97]"
                  >
                    <LogIn size={16} /> Sign in
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      ) : (
        <section className="bg-secondary py-16 md:py-24">
          <div className="container">
            <ScrollReveal>
              <div className="flex items-center gap-2 mb-8">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-overline text-primary">Admin access</span>
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {internalTools.map((tool, i) => (
                <ScrollReveal key={tool.path} delay={i * 0.1}>
                  <Link
                    to={tool.path}
                    className="block bg-card border border-primary/[0.15] rounded-[12px] p-8 hover:border-primary/[0.45] hover:-translate-y-1 transition-all duration-200 h-full group"
                  >
                    <tool.icon className="w-10 h-10 text-primary mb-5" />
                    <h2 className="text-h2 mb-4">{tool.title}</h2>
                    <p className="text-body text-muted-foreground mb-8">{tool.desc}</p>
                    <span className="inline-flex items-center gap-2 text-primary text-[13px] font-bold tracking-[0.05em] uppercase group-hover:gap-3 transition-all duration-200">
                      {tool.cta} <ArrowRight size={16} />
                    </span>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default ProTools;
