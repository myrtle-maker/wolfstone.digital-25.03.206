import { Link } from "react-router-dom";
import wolfstoneLogoWhite from "@/assets/wolfstone-logo-white.png";

const Footer = () => {
  return (
    <footer className="bg-wd-navy relative border-t border-white/[0.05]">
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12">
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <img src={wolfstoneLogoWhite} alt="Wolfstone Digital" className="h-12 w-auto" />
            </Link>
            <p className="text-wd-muted text-body-sm max-ch-70 mb-4">
              Results-driven AI SEO and GEO consultancy built by operators. LLM brand exposure, digital PR & technical SEO for enterprise brands.
            </p>
            <Link to="/tools/ai-visibility-checker" className="text-primary hover:text-accent transition-colors text-body-sm font-bold">
              Get a free AI visibility audit →
            </Link>
          </div>

          <div>
            <h4 className="text-overline text-primary mb-4">Services</h4>
            <nav className="flex flex-col gap-2.5">
              {[
                { label: "SEO", path: "/services/seo" },
                { label: "GEO", path: "/services/geo" },
                { label: "LLM brand exposure", path: "/services/llm-brand-exposure" },
                { label: "Digital PR", path: "/services/digital-pr" },
                { label: "Backlinks", path: "/services/backlinks" },
                { label: "Content", path: "/services/content" },
                { label: "Social media", path: "/services/social-media" },
              ].map((link) => (
                <Link key={link.path} to={link.path} className="text-body-sm text-wd-muted hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="text-overline text-primary mb-4">Industries</h4>
            <nav className="flex flex-col gap-2.5">
              {[
                { label: "Financial services", path: "/industries/financial-services" },
                { label: "Legal", path: "/industries/legal" },
                { label: "Ecommerce", path: "/industries/ecommerce" },
                { label: "Leisure", path: "/industries/leisure" },
              ].map((link) => (
                <Link key={link.path} to={link.path} className="text-body-sm text-wd-muted hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="text-overline text-primary mb-4">Company</h4>
            <nav className="flex flex-col gap-2.5">
              {[
                { label: "About", path: "/about" },
                { label: "Case studies", path: "/case-studies" },
                { label: "Contact", path: "/contact" },
                { label: "Free tools", path: "/tools" },
              ].map((link) => (
                <Link key={link.path} to={link.path} className="text-body-sm text-wd-muted hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-12 mb-6 h-[1px] bg-gradient-to-r from-transparent via-[hsl(var(--wd-gold))]/30 to-transparent" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-caption text-wd-muted">
            © {new Date().getFullYear()} Wolfstone Digital. All rights reserved.
          </p>
          <p className="text-caption text-wd-muted">
            AI SEO & GEO consultancy — built by operators, not theorists.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
