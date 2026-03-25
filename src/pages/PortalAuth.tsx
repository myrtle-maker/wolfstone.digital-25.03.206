import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import { LogIn, UserPlus, ArrowRight, Loader2, CheckCircle, Send } from "lucide-react";
import { toast } from "sonner";

type View = "login" | "signup" | "request";

const PortalAuth = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Request access state
  const [reqName, setReqName] = useState("");
  const [reqEmail, setReqEmail] = useState("");
  const [reqCompany, setReqCompany] = useState("");
  const [reqLocation, setReqLocation] = useState("");
  const [reqBudget, setReqBudget] = useState("");
  const [reqInterest, setReqInterest] = useState("");
  const [reqMessage, setReqMessage] = useState("");
  const [reqLoading, setReqLoading] = useState(false);
  const [reqSent, setReqSent] = useState(false);

  const inputClass =
    "w-full bg-card border border-primary/20 rounded-md px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors duration-200 text-body";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      if (error) throw error;
      navigate("/portal");
    } catch (err: any) {
      toast.error(err?.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setReqLoading(true);
    try {
      const { error } = await supabase.from("client_requests").insert({
        full_name: reqName.trim(),
        email: reqEmail.trim(),
        company: reqCompany.trim(),
        message: [
          reqLocation.trim() ? `Location: ${reqLocation.trim()}` : "",
          reqBudget ? `Budget: ${reqBudget}` : "",
          reqInterest.trim() ? `Interest: ${reqInterest.trim()}` : "",
          reqMessage.trim(),
        ].filter(Boolean).join("\n"),
      });
      if (error) throw error;
      setReqSent(true);
    } catch {
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setReqLoading(false);
    }
  };

  return (
    <main className="pt-20 min-h-screen">
      <SEOHead
        title="Client Portal — Wolfstone Digital"
        description="Access your AI visibility tracking dashboard. Monitor how AI platforms cite and recommend your brand over time."
        canonical="/portal/login"
      />

      <section className="bg-background py-16 md:py-28">
        <div className="container">
          <div className="max-w-md mx-auto">
            <ScrollReveal>
              <div className="text-center mb-8">
                <span className="text-overline text-primary mb-4 block">Client portal</span>
                <h1 className="text-h1 mb-3">
                  {view === "login" && "Sign in"}
                  {view === "request" && "Request access"}
                </h1>
                <p className="text-body text-muted-foreground">
                  {view === "login" && "Access your AI visibility tracking dashboard."}
                  {view === "request" && "The client portal is available to Wolfstone Digital customers. Submit a request below, or get in touch to discuss becoming a client."}
                </p>
              </div>
            </ScrollReveal>

            {/* Login */}
            {view === "login" && (
              <ScrollReveal delay={0.1}>
                <form onSubmit={handleLogin} className="space-y-4">
                  <input type="email" className={inputClass} placeholder="Email address" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                  <input type="password" className={inputClass} placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-accent transition-colors duration-200 active:scale-[0.97] disabled:opacity-50"
                  >
                    {loginLoading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : <><LogIn size={16} /> Sign in</>}
                  </button>
                </form>

                <div className="mt-8 pt-6 border-t border-primary/10 text-center space-y-3">
                  <p className="text-body-sm text-muted-foreground">Don't have an account?</p>
                  <button
                    onClick={() => setView("request")}
                    className="inline-flex items-center gap-2 rounded-md border border-primary/30 text-primary text-[13px] font-bold tracking-[0.05em] uppercase px-6 py-3 hover:bg-primary/10 transition-colors duration-200 active:scale-[0.97]"
                  >
                    <UserPlus size={16} /> Request access
                  </button>
                  <p className="text-body-sm text-muted-foreground">
                    or <Link to="/contact" className="text-primary hover:text-accent transition-colors underline underline-offset-4">become a client</Link>
                  </p>
                </div>
              </ScrollReveal>
            )}

            {/* Request access */}
            {view === "request" && !reqSent && (
              <ScrollReveal delay={0.1}>
                <form onSubmit={handleRequestAccess} className="space-y-4">
                  <input type="text" className={inputClass} placeholder="Full name *" value={reqName} onChange={(e) => setReqName(e.target.value)} maxLength={100} required />
                  <input type="email" className={inputClass} placeholder="Email address *" value={reqEmail} onChange={(e) => setReqEmail(e.target.value)} maxLength={255} required />
                  <input type="text" className={inputClass} placeholder="Company name *" value={reqCompany} onChange={(e) => setReqCompany(e.target.value)} maxLength={200} required />
                  <input type="text" className={inputClass} placeholder="Where are you based? e.g. London, UK" value={reqLocation} onChange={(e) => setReqLocation(e.target.value)} maxLength={100} />
                  <select
                    className={`${inputClass} appearance-none cursor-pointer`}
                    value={reqBudget}
                    onChange={(e) => setReqBudget(e.target.value)}
                  >
                    <option value="">Monthly marketing budget</option>
                    <option value="Under £5,000/month">Under £5,000/month</option>
                    <option value="£5,000–£10,000/month">£5,000–£10,000/month</option>
                    <option value="£10,000–£20,000/month">£10,000–£20,000/month</option>
                    <option value="£20,000–£50,000/month">£20,000–£50,000/month</option>
                    <option value="£50,000+/month">£50,000+/month</option>
                    <option value="Not sure yet">Not sure yet</option>
                  </select>
                  <input type="text" className={inputClass} placeholder="What are you most interested in? e.g. AI visibility, SEO, content" value={reqInterest} onChange={(e) => setReqInterest(e.target.value)} maxLength={300} />
                  <textarea
                    className={`${inputClass} min-h-[80px] resize-none`}
                    placeholder="Anything else? Are you an existing client, or would you like to become one?"
                    value={reqMessage}
                    onChange={(e) => setReqMessage(e.target.value)}
                    maxLength={1000}
                  />
                  <button
                    type="submit"
                    disabled={reqLoading || !reqName.trim() || !reqEmail.trim() || !reqCompany.trim()}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-accent transition-colors duration-200 active:scale-[0.97] disabled:opacity-50"
                  >
                    {reqLoading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Send size={16} /> Submit request</>}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button onClick={() => setView("login")} className="text-body-sm text-primary hover:text-accent transition-colors">
                    Already have access? Sign in
                  </button>
                </div>
              </ScrollReveal>
            )}

            {/* Request sent confirmation */}
            {view === "request" && reqSent && (
              <ScrollReveal delay={0.1}>
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-400/10 border border-emerald-400/30 mb-6">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h2 className="text-h2 mb-3">Request submitted</h2>
                  <p className="text-body text-muted-foreground mb-6">
                    We'll review your request and get back to you shortly. If you're an existing client, you'll receive login credentials by email.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={() => setView("login")} className="inline-flex items-center justify-center gap-2 rounded-md border border-primary/30 text-primary text-[13px] font-bold tracking-[0.05em] uppercase px-6 py-3 hover:bg-primary/10 transition-colors">
                      <LogIn size={16} /> Back to sign in
                    </button>
                    <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-6 py-3 hover:bg-accent transition-colors">
                      Become a client <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default PortalAuth;
