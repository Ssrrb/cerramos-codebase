"use client";

import { cn } from "@repo/design-system/lib/utils";
import { CheckIcon, PencilLineIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import type { CheckoutStepId } from "./types";

interface CheckoutVerticalStepperStep {
  content: ReactNode;
  id: CheckoutStepId;
  isCompleted: boolean;
  isVisible: boolean;
  summaryLines: string[];
  title: string;
}

interface CheckoutVerticalStepperProps {
  activeStep: CheckoutStepId;
  className?: string;
  onStepSelect: (stepId: CheckoutStepId) => void;
  steps: CheckoutVerticalStepperStep[];
}

function CheckoutVerticalStepper({
  activeStep,
  className,
  onStepSelect,
  steps,
}: CheckoutVerticalStepperProps) {
  const visibleSteps = steps.filter((step) => step.isVisible);
  const stepRefs = useRef<
    Partial<Record<CheckoutStepId, HTMLButtonElement | HTMLDivElement>>
  >({});
  const stepIndicatorClassName = (isActive: boolean, isCompleted: boolean) => {
    if (isActive) {
      return "border-foreground bg-foreground text-background";
    }

    if (isCompleted) {
      return "border-emerald-500 bg-emerald-500 text-white";
    }

    return "border-border/80 bg-muted/30 text-muted-foreground";
  };

  useEffect(() => {
    const target = stepRefs.current[activeStep];

    if (!target) {
      return;
    }

    target.focus({ preventScroll: true });
    target.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [activeStep]);

  return (
    <div className={cn("flex flex-col gap-4 sm:gap-5", className)}>
      {visibleSteps.map((step, index) => {
        const isActive = step.id === activeStep;
        const isLast = index === visibleSteps.length - 1;

        return (
          <div
            className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 sm:grid-cols-[2.5rem_minmax(0,1fr)] sm:gap-4"
            key={step.id}
          >
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "mt-5 flex size-8 items-center justify-center rounded-full border text-xs transition-colors sm:mt-6 sm:size-9 sm:text-sm",
                  stepIndicatorClassName(isActive, step.isCompleted)
                )}
              >
                {step.isCompleted ? (
                  <CheckIcon className="size-4" />
                ) : (
                  index + 1
                )}
              </div>
              {isLast ? null : (
                <div className="mt-2 h-full min-h-10 w-px bg-border/70 sm:min-h-12" />
              )}
            </div>
            <div className="pb-2">
              {isActive ? (
                <div
                  className="space-y-3 rounded-[1.5rem] bg-transparent outline-hidden sm:space-y-4"
                  ref={(node) => {
                    stepRefs.current[step.id] = node ?? undefined;
                  }}
                  tabIndex={-1}
                >
                  <div className="space-y-1 px-1">
                    <p className="text-muted-foreground text-xs uppercase tracking-[0.24em]">
                      Paso activo
                    </p>
                    <h2 className="font-semibold text-[1.75rem] text-foreground leading-none tracking-[-0.03em] sm:text-2xl">
                      {step.title}
                    </h2>
                  </div>
                  <div className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <div className="fade-in-0 slide-in-from-bottom-2 animate-in duration-300 motion-reduce:animate-none">
                      {step.content}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  className="group flex w-full flex-col items-start gap-4 rounded-[1.5rem] border border-border/70 bg-background px-4 py-4 text-left shadow-xs transition-colors hover:border-foreground/20 sm:flex-row sm:items-start sm:justify-between sm:px-5"
                  onClick={() => onStepSelect(step.id)}
                  ref={(node) => {
                    stepRefs.current[step.id] = node ?? undefined;
                  }}
                  type="button"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-base text-foreground">
                      {step.title}
                    </p>
                    {step.summaryLines.length > 0 ? (
                      <div className="mt-1 space-y-1">
                        {step.summaryLines.map((line) => (
                          <p
                            className="truncate text-muted-foreground text-sm leading-relaxed"
                            key={line}
                          >
                            {line}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                        Podés volver a editar este paso.
                      </p>
                    )}
                  </div>
                  <span className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-border/70 bg-muted/25 px-3 py-1.5 font-medium text-foreground text-sm">
                    <PencilLineIcon className="size-4" />
                    Editar
                  </span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { CheckoutVerticalStepper, type CheckoutVerticalStepperStep };
