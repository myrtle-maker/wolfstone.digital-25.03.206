import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import wolfstoneLogoWhite from "@/assets/wolfstone-logo-white.png";
import wolfstoneLogoDark from "@/assets/wolfstone-logo-dark.png";

const serviceLinks = [
  { label: "All services", path: "/services" },
  { label: "SEO", path: "/services/seo" },
  { label: "AI search visibility (GEO)", path: "/services/geo" },
  { label: "LLM brand exposure", path: "/services/llm-brand-exposure" },
  { label: "Digital PR", path: "/services/digital-pr" },
  { label: "Backlinks", path: "/services/backlinks" },
  { label: "Content", path: "/services/content" },
  { label: "Social media", path: "/services/social-media" },
];

const industryLinks = [
  { label: "Financial services", path: "/industries/financial-services" },
  { label: "Legal", path: "/industries/legal" },
  { label: "Ecommerce", path: "/industries/ecommerce" },
  { label: "Leisure", path: "/industries/leisure" },
];

const toolLinks = [
  { label: "All tools", path: "/tools" },
  { label: "AI visibility checker", path: "/tools/ai-visibility-checker" },
  { label: "Backlink checker", path: "/tools/backlink-checker" },
  { label: "AI crawlability checker", path: "/tools/ai-crawlability-checker" },
  { label: "Pro tools", path: "/tools/pro" },
];

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services", children: serviceLinks },
  { label: "Industries", path: "/industries/financial-services", children: industryLinks },
  { label: "Case studies", path: "/case-studies" },
  { label: "About", path: "/about" },
  { label: "Free tools", path: "/tools", children: toolLinks },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();
  const { resolved, toggleTheme } = useTheme();
  const isDark = resolved === "dark";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setOpenDropdown(null);
  }, [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
        scrolled
          ? "bg-[hsl(var(--wd-header-bg))] backdrop-blur-xl border-b border-[hsl(var(--wd-header-border))] shadow-glow"
          : "bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-20 md:h-24">
        <Link to="/" className="flex items-center gap-2 group shrink-0 -ml-2">
          <img src={isDark ? wolfstoneLogoWhite : wolfstoneLogoDark} alt="Wolfstone Digital" className="h-20 md:h-24 w-auto" />
        </Link>

        <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
          {navLinks.map((link) => (
            <div key={link.path} className="relative group">
              {link.children ? (
                <button
                  className={`text-body-sm transition-colors duration-200 hover:text-primary whitespace-nowrap inline-flex items-center gap-1 ${
                    link.label === "Free tools"
                      ? "text-primary font-bold"
                      : location.pathname.startsWith(link.path === "/industries/financial-services" ? "/industries" : link.path)
                        ? "text-primary"
                        : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                  <ChevronDown size={14} className="opacity-50" />
                </button>
              ) : (
                <Link
                  to={link.path}
                  className={`text-body-sm transition-colors duration-200 hover:text-primary whitespace-nowrap ${
                    location.pathname === link.path ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              )}

              {link.children && (
                <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-[hsl(var(--wd-dropdown-bg))] backdrop-blur-xl border border-[hsl(var(--wd-border-glass))] rounded-[16px] p-2 min-w-[240px] shadow-glow">
                    {link.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`block px-4 py-2.5 rounded-lg text-body-sm transition-colors hover:bg-primary/15 hover:text-primary ${
                          location.pathname === child.path ? "text-primary font-medium" : "text-foreground/80"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-[hsl(var(--wd-surface-glass))] transition-colors duration-200"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-5 py-2.5 hover:bg-accent transition-colors duration-200 active:scale-[0.97]"
          >
            Book a consultation
          </Link>
        </nav>

        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:text-primary transition-colors"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-foreground hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-[hsl(var(--wd-header-bg))] backdrop-blur-xl border-t border-[hsl(var(--wd-header-border))] max-h-[80vh] overflow-y-auto">
          <nav className="container flex flex-col py-6 gap-2">
            {navLinks.map((link) => (
              <div key={link.path}>
                {link.children ? (
                  <>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === link.label ? null : link.label)}
                      className={`w-full text-left text-body py-2 transition-colors flex items-center justify-between ${
                        location.pathname.startsWith(link.path === "/industries/financial-services" ? "/industries" : link.path) ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {link.label}
                      <ChevronDown size={16} className={`transition-transform ${openDropdown === link.label ? "rotate-180" : ""}`} />
                    </button>
                    {openDropdown === link.label && (
                      <div className="pl-4 space-y-1 pb-2">
                        {link.children.map((child) => (
                          <Link key={child.path} to={child.path} className={`block py-1.5 text-body-sm transition-colors ${location.pathname === child.path ? "text-primary" : "text-muted-foreground"}`}>
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link to={link.path} className={`block text-body py-2 transition-colors ${location.pathname === link.path ? "text-primary" : "text-muted-foreground"}`}>
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-[13px] font-bold tracking-[0.05em] uppercase px-6 py-3 mt-2 hover:bg-accent transition-colors"
            >
              Book a consultation
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
