import { Button } from "./ui/button";
import { Link } from "wouter";
import { useFeaturedFaqs } from "@/hooks/use-faqs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQSection() {
  const { data: featuredFaqs } = useFeaturedFaqs();

  if (!featuredFaqs || featuredFaqs.length === 0) return null;

  return (
    <section className="py-20 bg-stone-900 text-white" data-testid="section-faq">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-5xl font-bold font-display uppercase text-center mb-12" data-testid="text-faq">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {featuredFaqs.map((faq) => (
            <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
              <AccordionTrigger className="text-left font-bold uppercase text-sm md:text-base tracking-wide py-5 hover:no-underline" data-testid={`faq-trigger-${faq.id}`}>
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-stone-300 leading-relaxed pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="flex justify-center mt-10">
          <Link href="/faq">
            <Button variant="outline" className="rounded-full px-8 uppercase tracking-wider text-sm font-bold" data-testid="button-all-questions">
              All Questions
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
