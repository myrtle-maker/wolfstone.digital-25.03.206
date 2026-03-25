import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import CTASection from "@/components/CTASection";
import { ArrowRight, BarChart3, Shield, Brain, Zap, Linkedin } from "lucide-react";

import headshot1 from "@/assets/team/placeholder-1.jpg";
import headshot2 from "@/assets/team/placeholder-2.jpg";
import headshot3 from "@/assets/team/placeholder-3.jpg";
import headshot4 from "@/assets/team/placeholder-4.jpg";

const dna = [
  { icon: BarChart3, title: "Commercial mindset", desc: "We think revenue, not vanity metrics." },
  { icon: Shield, title: "Deep industry expertise", desc: "We navigate compliance and regulation across sectors." },
  { icon: Zap, title: "Operators, not just advisors", desc: "We founded and operate our own finance brand — competing internationally in one of the hardest, most regulated niches online." },
  { icon: Brain, title: "Ahead on AI search", desc: "AI visibility methodology built through genuine experience, not theory." },
];

const capabilities = [
  { title: "Link acquisition", desc: "Market-leading link sellers, highest quality backlink inventory, premium placements competitors can't access." },
  { title: "PR & communications", desc: "Industry PR specialists with ability to scale and build dedicated teams rapidly." },
  { title: "Content & production", desc: "In-house editor and producer, experience on leading UK podcasts, end-to-end social media content." },
  { title: "Proven asset", desc: "Our own international finance brand: the most AI-cited independent source amongst our competitors across ChatGPT, Google AI, Perplexity, Gemini & Copilot." },
];

const team = [
  { name: "Thomas Drury", role: "Co-Founder", bio: "Deep background in financial services, having worked alongside IG, Pepperstone, and Trading 212 on growth and client acquisition. Co-founded an international finance brand operating in the FCA-regulated broker comparison space — now one of the most-cited independent finance sources across every major AI platform.", linkedin: "#", image: headshot1, featured: true },
  { name: "Shaun Pridmoore", role: "Co-Founder", bio: "10+ years working in financial services and legal sectors. Expert in the technical and regulatory complexity of building digital visibility in compliance-heavy industries. Understands FCA and SRA frameworks from the inside.", linkedin: "#", image: headshot2, featured: false },
  { name: "Adam Woodhead", role: "Co-Founder", bio: "Former editor at a leading UK finance publication with years of experience covering markets, investment products, and personal finance. Leads editorial and content operations, bringing genuine financial journalism expertise to everything we produce.", linkedin: "#", image: headshot3, featured: false },
  { name: "Dom Farnell", role: "Co-Founder", bio: "Specialist in communications for regulated industries — financial services, legal, and compliance-heavy sectors. Deep experience navigating FCA and SRA marketing constraints while building brand visibility through earned media.", linkedin: "#", image: headshot4, featured: false },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    mainEntity: {
      "@type": "Organization",
      name: "Wolfstone Digital",
      url: "https://wolfstonedigital.co.uk",
      description: "Results-driven AI SEO and GEO consultancy founded by financial services professionals.",
      foundingLocation: "United Kingdom",
    },
  },
  ...team.map(t => ({
    "@context": "https://schema.org",
    "@type": "Person",
    name: t.name,
    jobTitle: t.role,
    worksFor: { "@type": "Organization", name: "Wolfstone Digital" },
    knowsAbout: ["financial services", "FCA regulation", "investment platforms", "regulated marketing"],
  })),
];

const About = () => {
  return (
    <main className="pt-20">
      <SEOHead
        title="About Wolfstone Digital | Built by Operators"
        description="Wolfstone Digital is a results-driven AI SEO and GEO consultancy founded by financial services professionals. We built a brand that AI recommends over billion-dollar competitors."
        canonical="/about/"
        jsonLd={jsonLd}
      />

      <section className="bg-[hsl(var(--wd-navy))] wd-ambient-glow py-20 md:py-28">
        <div className="container">
          <ScrollReveal>
            <span className="text-overline text-primary mb-4 block">About us</span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="text-display max-w-[16ch] mb-8 text-foreground">
              Built by <span className="wd-gradient-text">operators.</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="max-w-3xl space-y-6">
              <p className="text-body-lg text-muted-foreground">
                Wolfstone Digital is a results-driven consultancy founded by professionals with deep roots in financial services and regulated industries. We don't just advise — we founded and operate our own international finance brand, competing daily in one of the most saturated, compliance-heavy markets on the internet.
              </p>
              <p className="text-body-lg text-muted-foreground">
                Our finance brand is the most AI-cited independent source amongst our competitors across every major AI platform — ahead of the biggest names in global finance. We know what it takes because we do it ourselves, every day, in one of the hardest markets there is.
              </p>
              <p className="text-body-lg text-muted-foreground">
                Our background in navigating FCA compliance, advertising standards, and regulated marketing is what sets us apart from agencies who learn these constraints on your budget.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Team — narrative lead then supporting bios */}
      <section className="bg-background wd-texture py-20 md:py-28">
        <div className="container">
          <ScrollReveal>
            <span className="text-overline text-primary mb-4 block">The team</span>
            <h2 className="text-h1 text-foreground mb-6">The people behind the results.</h2>
            <p className="text-body-lg text-muted-foreground max-w-[65ch] mb-12">
              Four financial services professionals who built, funded, and proved an AI search methodology before selling it. Each brings a distinct capability — together we cover every surface area that matters in modern digital marketing.
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((person, i) => (
              <ScrollReveal key={person.name + i} delay={i * 0.08}>
                <div className="bg-muted border border-border rounded-[12px] overflow-hidden h-full flex flex-col">
                  <div className="aspect-[4/5] overflow-hidden">
                    <img src={person.image} alt={`${person.name} — ${person.role}`} loading="lazy" className="w-full h-full object-cover object-top" />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-h3 text-foreground mb-1">{person.name}</h3>
                    <p className="text-overline text-primary mb-3">{person.role}</p>
                    <p className="text-body-sm text-muted-foreground mb-4 flex-1">{person.bio}</p>
                    {person.linkedin && (
                      <a href={person.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`View ${person.name}'s LinkedIn profile`} className="inline-flex items-center gap-1.5 text-primary text-body-sm font-bold hover:underline">
                        <Linkedin size={16} aria-hidden="true" /> LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* DNA */}
      <section className="bg-muted py-20 md:py-28">
        <div className="container">
          <ScrollReveal>
            <span className="text-overline text-primary mb-4 block">Our DNA</span>
            <h2 className="text-h1 text-foreground mb-12">What drives us.</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dna.map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.08}>
                <div className="bg-card border border-border rounded-[12px] p-8 hover:shadow-md hover:border-[hsl(var(--wd-blue))]/30 transition-all duration-200 h-full flex gap-5 items-start">
                  <item.icon className="w-8 h-8 text-primary shrink-0" />
                  <div>
                    <h3 className="text-h3 text-foreground mb-2">{item.title}</h3>
                    <p className="text-body text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="bg-background wd-texture py-20 md:py-28">
        <div className="container">
          <ScrollReveal>
            <span className="text-overline text-primary mb-4 block">Resources & capabilities</span>
            <h2 className="text-h1 text-foreground mb-12">The engine behind results.</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map((c, i) => (
              <ScrollReveal key={c.title} delay={i * 0.08}>
                <div className="border-l-2 border-[hsl(var(--wd-blue))]/30 pl-6 py-2">
                  <h3 className="text-h3 text-foreground mb-2">{c.title}</h3>
                  <p className="text-body-sm text-muted-foreground">{c.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection heading="Want to work with us?" />
    </main>
  );
};

export default About;
