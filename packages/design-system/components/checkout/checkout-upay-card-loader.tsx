import { cn } from "@repo/design-system/lib/utils";

interface CheckoutUpayCardLoaderProps {
  className?: string;
  formId?: string | null;
}

function CheckoutUpayCardLoader({
  className,
  formId,
}: CheckoutUpayCardLoaderProps) {
  const trimmedFormId = formId?.trim() ?? "";

  if (!trimmedFormId) {
    return null;
  }

  const iframeUrl = `https://www.pagopar.com/upay-iframe/?id-form=${encodeURIComponent(trimmedFormId)}`;

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-[1.25rem] border border-border/70 bg-background shadow-[0_20px_60px_-32px_color-mix(in_oklab,var(--color-foreground)_14%,transparent)] shadow-[inset_0_1px_0_color-mix(in_oklab,var(--color-foreground)_4%,transparent)]",
        className
      )}
    >
      <div className="aspect-[5/7] min-h-[26rem] w-full sm:aspect-[4/5] sm:min-h-[28rem]">
        <iframe
          className="block h-full w-full border-0 bg-background"
          loading="lazy"
          src={iframeUrl}
          title="Pagopar uPay"
        />
      </div>
    </div>
  );
}

export { CheckoutUpayCardLoader };
