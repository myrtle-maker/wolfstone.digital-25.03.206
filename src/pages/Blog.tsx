import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import { ArrowRight } from "lucide-react";

const jsonLd = [
  { "@context": "https://schema.org", "@type": "CollectionPage", name: "Blog — Wolfstone Digital", description: "Insights on AI SEO, GEO, LLM brand exposure, and digital marketing." },
  { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://wolfstonedigital.co.uk/" },
    { "@type": "ListItem", position: 2, name: "Blog", item: "https://wolfstonedigital.co.uk/blog/" },
  ]},
];

const posts = [
  { title: "GEO vs SEO: what's the difference?", desc: "A comprehensive comparison of generative engine optimisation and traditional search engine optimisation.", slug: "geo-vs-seo", service: "/services/geo/" },
  { title: "How to get cited by AI", desc: "Practical strategies for increasing your brand's citation rate across ChatGPT, Gemini, Perplexity, and other AI platforms.", slug: "how-to-get-cited-by-ai", service: "/services/llm-brand-exposure/" },
  { title: "What is LLM brand exposure?", desc: "Defining the new discipline of LLM brand exposure and why it matters for every enterprise brand.", slug: "what-is-llm-brand-exposure", service: "/services/llm-brand-exposure/" },
];

const BlogHub = () => (
  <main className="pt-20">
    <SEOHead title="Blog | AI SEO, GEO & LLM Insights | Wolfstone Digital" description="Insights on AI SEO, generative engine optimisation, LLM brand exposure, and digital marketing from the team behind the most AI-cited independent finance source amongst our competitors." canonical="/blog/" jsonLd={jsonLd} />

    <section className="bg-wd-navy py-20 md:py-28">
      <div className="container">
        <Breadcrumbs items={[{ label: "Blog" }]} />
        <ScrollReveal><span className="text-overline text-primary mb-4 block">Blog</span></ScrollReveal>
        <ScrollReveal delay={0.1}><h1 className="text-display max-w-[18ch] mb-6">Insights and analysis</h1></ScrollReveal>
        <ScrollReveal delay={0.2}>
          <p className="text-body-lg text-wd-muted max-ch-70">
            Practical insights on AI SEO, generative engine optimisation, and LLM brand exposure from the team behind the most AI-cited independent finance source amongst our competitors.
          </p>
        </ScrollReveal>
      </div>
    </section>

    <section className="bg-wd-ice py-20 md:py-28">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <ScrollReveal key={post.slug} delay={i * 0.07}>
              <div className="bg-white border border-wd-navy/[0.06] rounded-[12px] p-6 hover:border-wd-blue/30 transition-colors duration-200 h-full shadow-sm flex flex-col">
                <span className="text-overline text-wd-blue mb-3 block">Article</span>
                <h2 className="text-h3 text-wd-navy mb-3">{post.title}</h2>
                <p className="text-body-sm text-[#4A6080] flex-1 mb-4">{post.desc}</p>
                <span className="text-body-sm text-wd-blue font-bold inline-flex items-center gap-1">Coming soon <ArrowRight size={14} /></span>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal delay={0.3}>
          <p className="text-center text-body text-[#4A6080] mt-12">Blog posts are being published regularly. <Link to="/tools/ai-visibility-checker" className="text-wd-blue font-bold hover:underline">Get a free AI audit</Link> while you wait.</p>
        </ScrollReveal>
      </div>
    </section>
  </main>
);

export default BlogHub;
