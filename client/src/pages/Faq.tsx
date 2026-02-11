import { MainLayout } from "@/components/MainLayout";
import { SponsorBar } from "@/components/SponsorBar";
import { useFaqs } from "@/hooks/use-faqs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Faq() {
  const { data: faqsList, isLoading } = useFaqs();

  return (
    <MainLayout>
      <section className="py-20 bg-stone-900 min-h-[60vh] text-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-5xl font-bold font-display uppercase text-center mb-12" data-testid="text-faq-page-title">
            Frequently Asked Questions
          </h1>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !faqsList?.length ? (
            <p className="text-center text-muted-foreground py-12">No FAQs available at this time.</p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {faqsList.map((faq) => (
                <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
                  <AccordionTrigger
                    className="text-left font-bold uppercase text-sm md:text-base tracking-wide py-5 hover:no-underline"
                    data-testid={`faq-trigger-${faq.id}`}
                  >
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300 leading-relaxed pb-6" data-testid={`faq-content-${faq.id}`}>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </section>
      <SponsorBar />
    </MainLayout>
  );
}
