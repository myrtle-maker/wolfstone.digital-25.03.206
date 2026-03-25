import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import { ArrowRight } from "lucide-react";

const CaseStudies = () => {
  return (
    <main className="pt-20">
      <section className="bg-wd-navy py-20 md:py-28">
        <div className="container">
          <ScrollReveal>
            <span className="text-overline text-primary mb-4 block">Track record</span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-display max-w-[18ch] mb-6">
              Results that <span className="wd-gradient-text">prove it.</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-body-lg text-wd-muted max-ch-70">
              Every claim backed by commercial outcomes. Every outcome backed by work we've done with our own money.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* 900+ clients */}
      <section className="bg-wd-midnight py-20 md:py-28">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <ScrollReveal>
                <span className="text-overline text-primary mb-4 block">Case study</span>
                <h2 className="text-h1 mb-6">900+ clients in 6 months</h2>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <p className="text-body text-wd-muted mb-6">
                  Identified an underserved audience segment with high investment intent and near-zero competition for one of the UK's fastest-growing investment platforms. 900+ clients attracted over 6 months through a targeted acquisition strategy.
                </p>
                <p className="text-body-sm text-wd-muted italic">
                  Detailed case studies available on request during consultation.
                </p>
              </ScrollReveal>
            </div>
            <ScrollReveal delay={0.15}>
              <div className="bg-card border border-primary/[0.15] rounded-[20px] p-10 text-center">
                <div className="text-[clamp(3rem,6vw,4.5rem)] font-black leading-none text-accent mb-3">
                  900+
                </div>
                <div className="text-overline text-wd-muted mb-2">New clients delivered</div>
                <div className="text-body-sm text-wd-muted">From a single campaign</div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Testimonials note */}
      <section className="bg-wd-navy py-16 md:py-20 border-y border-primary/10">
        <div className="container text-center">
          <ScrollReveal>
            <p className="text-body-lg text-wd-muted">
              Partner testimonials from <span className="text-foreground font-bold">Pepperstone</span>, <span className="text-foreground font-bold">Spreadex</span>, and <span className="text-foreground font-bold">IG</span> available on request.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-wd-midnight py-20 md:py-28 text-center">
        <div className="container">
          <ScrollReveal>
            <h2 className="text-h1 mb-6">Want results like these?</h2>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-accent transition-colors duration-200 active:scale-[0.97]"
            >
              Book a consultation <ArrowRight size={16} />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
};

export default CaseStudies;
