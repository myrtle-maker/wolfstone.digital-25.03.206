import ScrollReveal from "@/components/ScrollReveal";

/**
 * Static preview of what the audit report email will look like.
 * Not a real route in production — just for internal review.
 */
const EmailPreview = () => {
  // Sample data to populate the preview
  const sample = {
    name: "James",
    brandName: "Wolfstone Digital",
    overallScore: 62,
    summary:
      "Wolfstone Digital has moderate AI visibility with strong citation presence on ChatGPT but significant gaps on Gemini and Perplexity. Competitor brands are currently dominating several high-intent prompts.",
    platforms: [
      { name: "ChatGPT", score: 78, status: "strong" },
      { name: "Gemini", score: 54, status: "moderate" },
      { name: "Perplexity", score: 45, status: "moderate" },
      { name: "Copilot", score: 68, status: "moderate" },
      { name: "Claude", score: 62, status: "moderate" },
    ],
    strengths: [
      "Strong citation presence on ChatGPT for brand-name queries",
      "Accurate information about services and positioning across most platforms",
      "Good authority signals from existing content and backlink profile",
    ],
    weaknesses: [
      "Not recommended by Gemini for key industry prompts",
      "Perplexity does not surface the brand for competitive queries",
      "Limited entity recognition — AI treats brand as generic rather than authoritative",
    ],
    recommendations: [
      { priority: "high", action: "Build entity authority through structured data and knowledge panels", impact: "Improves brand recognition across all AI platforms" },
      { priority: "high", action: "Create citation-worthy content targeting high-intent prompts", impact: "Directly increases recommendation rate on Gemini and Perplexity" },
      { priority: "medium", action: "Optimise existing content for AI crawlability", impact: "Ensures AI platforms can extract and reference your content accurately" },
    ],
  };

  const getBarColor = (score: number) =>
    score >= 70 ? "#34d399" : score >= 40 ? "#fbbf24" : "#f87171";

  const getScoreLabel = (score: number) =>
    score >= 70 ? "Strong" : score >= 40 ? "Moderate" : "Weak";

  const priorityColors: Record<string, { bg: string; text: string }> = {
    high: { bg: "#fef2f2", text: "#dc2626" },
    medium: { bg: "#fffbeb", text: "#d97706" },
    low: { bg: "#ecfdf5", text: "#059669" },
  };

  return (
    <main className="pt-20 bg-[hsl(var(--wd-cream))]">
      <div className="container py-12">
        <ScrollReveal>
          <span className="text-overline text-[hsl(var(--wd-blue))] mb-2 block">Email preview</span>
          <h1 className="text-h1 text-[hsl(var(--wd-navy-text))] mb-2">Report email mockup</h1>
          <p className="text-body text-[hsl(var(--wd-navy-text))]/60 mb-10">This is a preview of the email users will receive after unlocking their report.</p>
        </ScrollReveal>

        {/* ─── EMAIL CONTAINER ─── */}
        <ScrollReveal delay={0.1}>
          <div className="mx-auto max-w-[640px] rounded-xl overflow-hidden shadow-2xl shadow-black/20 border border-black/[0.06]">
            {/* Email body */}
            <div style={{ fontFamily: "'DM Sans', Arial, sans-serif", backgroundColor: "#ffffff", color: "#1a1a2e" }}>

              {/* Header */}
              <div style={{ background: "linear-gradient(135deg, #162447 0%, #1f4068 100%)", padding: "40px 32px 32px", textAlign: "center" as const }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#00bcd4", marginBottom: 12 }}>
                  AI Visibility Report
                </div>
                <div style={{ fontSize: 42, fontWeight: 900, color: "#ffffff", lineHeight: 1.1, marginBottom: 8 }}>
                  {sample.overallScore}<span style={{ fontSize: 18, fontWeight: 400, color: "rgba(255,255,255,0.5)" }}>/100</span>
                </div>
                <div style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", maxWidth: 400, margin: "0 auto" }}>
                  {sample.brandName}
                </div>
              </div>

              {/* Greeting */}
              <div style={{ padding: "32px 32px 0" }}>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: "#1a1a2e", margin: "0 0 16px" }}>
                  Hi {sample.name},
                </p>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "#55575d", margin: "0 0 24px" }}>
                  Here's your full AI visibility report for <strong style={{ color: "#1a1a2e" }}>{sample.brandName}</strong>. This analysis covers how AI platforms like ChatGPT, Gemini, Perplexity, Copilot, and Claude currently perceive and recommend your brand.
                </p>
              </div>

              {/* Summary */}
              <div style={{ padding: "0 32px", marginBottom: 28 }}>
                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "20px 24px", borderLeft: "4px solid #00bcd4" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#00bcd4", marginBottom: 8 }}>
                    Executive summary
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: "#55575d", margin: 0 }}>
                    {sample.summary}
                  </p>
                </div>
              </div>

              {/* Platform breakdown */}
              <div style={{ padding: "0 32px", marginBottom: 28 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#00bcd4", marginBottom: 16 }}>
                  Platform scores
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
                  <tbody>
                    {sample.platforms.map((p) => (
                      <tr key={p.name} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 0", fontSize: 14, fontWeight: 700, color: "#1a1a2e", width: "30%" }}>
                          {p.name}
                        </td>
                        <td style={{ padding: "12px 0", width: "50%" }}>
                          <div style={{ background: "#f1f5f9", borderRadius: 100, height: 8, overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${p.score}%`,
                                height: "100%",
                                borderRadius: 100,
                                background: getBarColor(p.score),
                                transition: "width 0.5s",
                              }}
                            />
                          </div>
                        </td>
                        <td style={{ padding: "12px 0 12px 16px", fontSize: 13, fontWeight: 700, color: getBarColor(p.score), textAlign: "right" as const, width: "20%", whiteSpace: "nowrap" as const }}>
                          {p.score} — {getScoreLabel(p.score)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Strengths */}
              <div style={{ padding: "0 32px", marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#34d399", marginBottom: 12 }}>
                  ✓ Strengths
                </div>
                {sample.strengths.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", marginTop: 7, flexShrink: 0 }} />
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: "#55575d", margin: 0 }}>{s}</p>
                  </div>
                ))}
              </div>

              {/* Gaps */}
              <div style={{ padding: "0 32px", marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#f87171", marginBottom: 12 }}>
                  ✗ Gaps & risks
                </div>
                {sample.weaknesses.map((w, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f87171", marginTop: 7, flexShrink: 0 }} />
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: "#55575d", margin: 0 }}>{w}</p>
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              <div style={{ padding: "0 32px", marginBottom: 32 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#00bcd4", marginBottom: 16 }}>
                  Recommendations
                </div>
                {sample.recommendations.map((rec, i) => {
                  const pc = priorityColors[rec.priority];
                  return (
                    <div key={i} style={{ background: "#f8fafc", borderRadius: 10, padding: "16px 20px", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: pc.text, background: pc.bg, padding: "3px 8px", borderRadius: 4 }}>
                          {rec.priority}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>{rec.action}</span>
                      </div>
                      <p style={{ fontSize: 13, lineHeight: 1.6, color: "#55575d", margin: 0 }}>{rec.impact}</p>
                    </div>
                  );
                })}
              </div>

              {/* CTA */}
              <div style={{ padding: "0 32px 12px", textAlign: "center" as const }}>
                <div style={{ background: "linear-gradient(135deg, #162447 0%, #1f4068 100%)", borderRadius: 12, padding: "32px 24px" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#ffffff", marginBottom: 8, lineHeight: 1.3 }}>
                    Ready to dominate AI search?
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.7)", marginBottom: 20, maxWidth: 380, marginLeft: "auto", marginRight: "auto" }}>
                    We built a brand AI recommends over billion-dollar competitors. Let's do the same for yours.
                  </p>
                  {/* eslint-disable-next-line */}
                  <a
                    href="https://wolfstonedigital.co.uk/contact"
                    style={{
                      display: "inline-block",
                      background: "#00bcd4",
                      color: "#162447",
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase" as const,
                      padding: "14px 32px",
                      borderRadius: 8,
                      textDecoration: "none",
                    }}
                  >
                    Book a free strategy call →
                  </a>
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: "24px 32px 32px", textAlign: "center" as const }}>
                <p style={{ fontSize: 12, color: "#999", lineHeight: 1.6, margin: 0 }}>
                  Wolfstone Digital · AI SEO & GEO · Built by Operators
                </p>
                <p style={{ fontSize: 11, color: "#bbb", lineHeight: 1.6, margin: "8px 0 0" }}>
                  This report was generated by our free AI visibility checker. For a comprehensive analysis with ongoing monitoring, get in touch.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
};

export default EmailPreview;
