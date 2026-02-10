import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    id: "q1",
    question: "What is Salaam Cup?",
    answer: "Salaam Cup is a premier community sports organization dedicated to hosting high-quality tournaments that unite athletes through competition, faith, and excellence. We aim to foster an environment where sportsmanship, teamwork, and community pride come together on and off the field.",
    hasLink: true,
  },
  {
    id: "q2",
    question: "What makes Salaam Cup different?",
    answer: "Professional-grade organization, community values, and inclusive approach to sports competition.",
  },
  {
    id: "q3",
    question: "This league looks too good, can a rookie join?",
    answer: "We welcome players of all skill levels with both competitive and recreational divisions.",
  },
  {
    id: "q4",
    question: "Can I join alone or do I have to have a team?",
    answer: "You can register as a free agent and we will help connect you with teams looking for players.",
  },
  {
    id: "q5",
    question: "How can I volunteer or sponsor the tournament?",
    answer: "Please reach out through our Contact page or email info@salaamcup.com.",
  },
];

export function FAQSection() {
  return (
    <section className="py-20 bg-background" data-testid="section-faq">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-5xl font-bold font-display uppercase text-center mb-12">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible>
          {faqItems.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger className="text-left font-bold uppercase text-sm tracking-wide py-5 hover:no-underline" data-testid={`faq-trigger-${item.id}`}>
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                {item.answer}
                {item.hasLink && (
                  <span> Learn more about our mission and story in the <a href="/about" className="underline font-medium text-foreground">About Us</a> section.</span>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="text-center mt-8">
          <Button variant="outline" className="rounded-full font-bold uppercase text-xs tracking-wider px-8" data-testid="button-all-questions">
            All Questions
          </Button>
        </div>
      </div>
    </section>
  );
}
