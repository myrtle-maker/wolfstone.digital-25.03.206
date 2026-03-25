import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import Services from "./pages/Services";
import About from "./pages/About";
import CaseStudies from "./pages/CaseStudies";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import Tools from "./pages/Tools";
import LlmChecker from "./pages/LlmChecker";
import AuditResults from "./pages/AuditResults";
import SEOPage from "./pages/services/SEO";
import GEOPage from "./pages/services/GEO";
import LLMBrandExposurePage from "./pages/services/LLMBrandExposure";
import DigitalPRPage from "./pages/services/DigitalPR";
import BacklinksPage from "./pages/services/Backlinks";
import ContentPage from "./pages/services/Content";
import SocialMediaPage from "./pages/services/SocialMedia";
import FinancialServicesPage from "./pages/industries/FinancialServices";
import LegalPage from "./pages/industries/Legal";
import EcommercePage from "./pages/industries/Ecommerce";
import LeisurePage from "./pages/industries/Leisure";
import BacklinkChecker from "./pages/BacklinkChecker";
import BacklinkResults from "./pages/BacklinkResults";
import CrawlabilityChecker from "./pages/CrawlabilityChecker";
import CrawlabilityResults from "./pages/CrawlabilityResults";
import EmailPreview from "./pages/EmailPreview";
import BulkBacklinkChecker from "./pages/BulkBacklinkChecker";
import BulkAIChecker from "./pages/BulkAIChecker";
import ProTools from "./pages/ProTools";
import PortalAuth from "./pages/PortalAuth";
import Portal from "./pages/Portal";
import { useEffect } from "react";
import { useLocation, Navigate } from "react-router-dom";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Header />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/seo" element={<SEOPage />} />
          <Route path="/services/geo" element={<GEOPage />} />
          <Route path="/services/llm-brand-exposure" element={<LLMBrandExposurePage />} />
          <Route path="/services/digital-pr" element={<DigitalPRPage />} />
          <Route path="/services/backlinks" element={<BacklinksPage />} />
          <Route path="/services/content" element={<ContentPage />} />
          <Route path="/services/social-media" element={<SocialMediaPage />} />
          <Route path="/industries/financial-services" element={<FinancialServicesPage />} />
          <Route path="/industries/legal" element={<LegalPage />} />
          <Route path="/industries/ecommerce" element={<EcommercePage />} />
          <Route path="/industries/leisure" element={<LeisurePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/tools/pro" element={<ProTools />} />
          <Route path="/tools/ai-visibility-checker" element={<LlmChecker />} />
          <Route path="/tools/ai-visibility-checker/results" element={<AuditResults />} />
          <Route path="/tools/backlink-checker" element={<BacklinkChecker />} />
          <Route path="/tools/backlink-checker/results" element={<BacklinkResults />} />
          <Route path="/tools/ai-crawlability-checker" element={<CrawlabilityChecker />} />
          <Route path="/tools/ai-crawlability-checker/results" element={<CrawlabilityResults />} />
          <Route path="/internal/bulk-backlink-checker" element={<BulkBacklinkChecker />} />
          <Route path="/internal/bulk-ai-checker" element={<BulkAIChecker />} />
          <Route path="/portal/login" element={<PortalAuth />} />
          <Route path="/portal" element={<Portal />} />
          <Route path="/email-preview" element={<EmailPreview />} />
          <Route path="/free-ai-visibility-audit" element={<Navigate to="/tools/ai-visibility-checker" replace />} />
          <Route path="/free-ai-visibility-audit/results" element={<Navigate to="/tools/ai-visibility-checker/results" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
