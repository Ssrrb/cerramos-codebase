import { Button } from "@repo/design-system/components/ui/button";
import type { Dictionary } from "@repo/internationalization";
import { ChevronDown, PhoneCall } from "lucide-react";
import Link from "next/link";

interface FAQProps {
  dictionary: Dictionary;
}

export const FAQ = ({ dictionary }: FAQProps) => (
  <div className="w-full py-20 lg:py-40">
    <div className="container mx-auto">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h4 className="max-w-xl text-left font-regular text-3xl tracking-tighter md:text-5xl">
                {dictionary.web.home.faq.title}
              </h4>
              <p className="max-w-xl text-left text-lg text-muted-foreground leading-relaxed tracking-tight lg:max-w-lg">
                {dictionary.web.home.faq.description}
              </p>
            </div>
            <div className="">
              <Button asChild className="gap-4" variant="outline">
                <Link href="/contact">
                  {dictionary.web.home.faq.cta}{" "}
                  <PhoneCall className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="w-full">
          {dictionary.web.home.faq.items.map((item) => (
            <details
              className="group border-b last:border-b-0"
              key={item.question}
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-4 text-left text-sm font-medium">
                <span>{item.question}</span>
                <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <div className="pb-4 text-sm">{item.answer}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  </div>
);
