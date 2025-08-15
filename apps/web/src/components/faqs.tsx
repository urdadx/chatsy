import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQs() {
  const faqItems = [
    {
      id: "item-1",
      question: "How does the AI customer support bot work?",
      answer:
        "Our bot is trained on your knowledge base and support documentation, allowing it to instantly answer customer questions 24/7 across all supported channels.",
    },
    {
      id: "item-2",
      question: "What integrations does the platform support?",
      answer:
        "We integrate with major communication channels including WhatsApp, Facebook Messenger, Telegram, and live chat widgets. More integrations coming soon.",
    },
    {
      id: "item-3",
      question: "Can I customize the responses of the AI?",
      answer:
        "Yes. You can customize tone, language and messaging in the dashboard, and also provide custom rules and example answers for specific use cases.",
    },
    {
      id: "item-4",
      question: "Do I need any technical experience to set up the bot?",
      answer:
        "No. You can easily set up and deploy the bot easily in just a few minutes",
    },
    {
      id: "item-5",
      question: "Is there a free trial or demo available?",
      answer:
        "We offer a 3-day free trial with full access to all features. You can also request a live demo with our team (support@padyna.com) if you’d like to see it in action first.",
    },
  ];

  return (
    <section id="faqs" className="py-10 md:pt-14 md:pb-2">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-balance instrument-serif-regular-italic text-3xl font-bold md:text-3xl lg:text-4xl">
            Frequently Asked{" "}
            <span className="text-purple-600 bg-purple-100 px-1 rounded relative inline-block z-1">
              Questions
            </span>{" "}
          </h2>
          <p className="text-muted-foreground text-lg mt-4 text-balance">
            Discover quick and comprehensive answers to common questions about
            our platform, services, and features.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-xl">
          <Accordion
            type="single"
            collapsible
            className="bg-card ring-muted w-full rounded-2xl border px-8 py-3 shadow-sm ring-8 dark:ring-0"
          >
            {faqItems.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border-dashed"
              >
                <AccordionTrigger className="cursor-pointer text-base hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-base">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
