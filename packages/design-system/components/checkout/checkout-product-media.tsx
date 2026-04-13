import { AspectRatio } from "@repo/design-system/components/ui/aspect-ratio";
import { cn } from "@repo/design-system/lib/utils";
import { ImageIcon } from "lucide-react";

interface CheckoutProductMediaProps {
  className?: string;
  imageClassName?: string;
  imageUrl: string;
  name: string;
  ratio?: number;
}

const hasProductImage = (imageUrl: string) => imageUrl.trim().length > 0;

function CheckoutProductMedia({
  className,
  imageClassName,
  imageUrl,
  name,
  ratio = 1,
}: CheckoutProductMediaProps) {
  const resolvedImageUrl = imageUrl.trim();

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[1.5rem] border border-border/70 bg-muted/35",
        className
      )}
    >
      <AspectRatio ratio={ratio}>
        {hasProductImage(resolvedImageUrl) ? (
          // biome-ignore lint/performance/noImgElement: shared checkout media accepts plain URL strings from app and signed-route sources.
          <img
            alt={name}
            className={cn("size-full object-cover", imageClassName)}
            src={resolvedImageUrl}
          />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 bg-muted/50 px-4 text-center">
            <div className="flex size-11 items-center justify-center rounded-full border border-border/70 bg-background/80 text-muted-foreground">
              <ImageIcon className="size-5" />
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Imagen no disponible
            </p>
          </div>
        )}
      </AspectRatio>
    </div>
  );
}

export { CheckoutProductMedia };
