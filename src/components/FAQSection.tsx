import ScrollReveal from "@/components/ScrollReveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FAQ {
  question: string;
  answer: string;
}

const FAQSection = ({ faqs }: { faqs: FAQ[] }) => (
  <section className="relative py-20 md:py-28">
    <div className="container relative z-10">
      <div className="rounded-[20px] wd-glass px-8 py-14 md:px-12 md:py-16">
        <ScrollReveal>
          <span className="text-overline text-primary mb-4 block">FAQ</span>
          <h2 className="text-h1 mb-10 text-foreground">Frequently asked questions</h2>
        </ScrollReveal>
        <div className="max-w-3xl">
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 0.06}>
                <AccordionItem
                  value={`faq-${i}`}
                  className="wd-glass data-[state=open]:border-l-primary data-[state=open]:border-l-2 rounded-[16px] px-6 transition-all duration-300"
                >
                  <AccordionTrigger className="text-left text-h3 hover:no-underline py-5 font-bold text-foreground">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-body pb-5 text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </ScrollReveal>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  </section>
);

export default FAQSection;
