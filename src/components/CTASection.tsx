import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import AuroraBackground from "@/components/AuroraBackground";

interface CTASectionProps {
  heading?: string;
  body?: string;
  buttonText?: string;
  buttonLink?: string;
}

const CTASection = ({
  heading = "Ready to outperform?",
  body = "Get in touch to discuss how we can scale your brand's digital visibility — across search, AI, and beyond.",
  buttonText = "Book a consultation",
  buttonLink = "/contact",
}: CTASectionProps) => (
  <section className="bg-wd-navy py-20 md:py-28 relative overflow-hidden border-t border-[hsl(var(--wd-gold))]/20">
    <AuroraBackground intensity={0.5} showArc={false} primaryColor="38,70%,50%" secondaryColor="190,100%,45%" />
    <div className="container relative z-10 text-center">
      <ScrollReveal>
        <h2 className="text-h1 mb-6 max-w-[30ch] mx-auto text-white">{heading}</h2>
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <p className="text-body-lg text-white/80 max-ch-70 mx-auto mb-10">{body}</p>
      </ScrollReveal>
      <ScrollReveal delay={0.2}>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to={buttonLink} className="inline-flex items-center gap-2 rounded-[12px] bg-[hsl(var(--wd-gold))] text-white text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-[hsl(var(--wd-gold-dark))] transition-all duration-300 active:scale-[0.97]">
            {buttonText} <ArrowRight size={16} />
          </Link>
          <Link to="/tools/ai-visibility-checker" className="inline-flex items-center gap-2 rounded-[12px] border-[1.5px] border-[hsl(var(--wd-gold))]/60 text-[hsl(var(--wd-gold))] text-[13px] font-bold tracking-[0.05em] uppercase px-8 py-4 hover:bg-[hsl(var(--wd-gold))]/[0.08] transition-all duration-300 active:scale-[0.97]">
            Free AI audit <ArrowRight size={16} />
          </Link>
        </div>
      </ScrollReveal>
    </div>
  </section>
);

export default CTASection;
