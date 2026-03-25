import ScrollReveal from "@/components/ScrollReveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FAQ {
  question: string;
  answer: string;
}

const FAQSection = ({ faqs, dark = false }: { faqs: FAQ[]; dark?: boolean }) => (
  <section className={`${dark ? "bg-[hsl(var(--wd-midnight))]" : "bg-[hsl(var(--wd-stone))]"} py-20 md:py-28`}>
    <div className="container">
      <ScrollReveal>
        <span className={`text-overline ${dark ? "text-primary" : "text-[hsl(var(--wd-blue))]"} mb-4 block`}>FAQ</span>
        <h2 className={`text-h1 mb-10 ${dark ? "text-white" : "text-[hsl(var(--wd-navy-text))]"}`}>Frequently asked questions</h2>
      </ScrollReveal>
      <div className="max-w-3xl">
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <ScrollReveal key={i} delay={i * 0.06}>
              <AccordionItem
                value={`faq-${i}`}
                className={`${
                  dark
                    ? "bg-card border-white/[0.06] data-[state=open]:border-l-primary data-[state=open]:border-l-2"
                    : "bg-white border-[hsl(var(--wd-warm-grey))] data-[state=open]:border-l-[hsl(var(--wd-blue))] data-[state=open]:border-l-2"
                } border rounded-[16px] px-6 transition-all duration-300`}
              >
                <AccordionTrigger className={`text-left text-h3 hover:no-underline py-5 font-bold`} style={{ color: dark ? 'white' : 'hsl(216, 56%, 15%)' }}>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-body pb-5" style={{ color: dark ? 'rgba(255,255,255,0.75)' : 'rgba(20, 36, 61, 0.7)' }}>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </ScrollReveal>
          ))}
        </Accordion>
      </div>
    </div>
  </section>
);

export default FAQSection;
