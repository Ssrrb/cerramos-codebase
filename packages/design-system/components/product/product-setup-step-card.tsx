"use client";

import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { CheckIcon, PencilLineIcon } from "lucide-react";
import type { ReactNode } from "react";

interface SequentialStepCardProps<TStep extends string> {
  activeStep: TStep;
  children: ReactNode;
  completed?: boolean;
  inactiveHint?: string;
  onEdit: (step: TStep) => void;
  step: TStep;
  summary: string[];
  title: string;
  activeKicker?: string;
  editLabel?: string;
}

function SequentialStepCard<TStep extends string>({
  activeStep,
  activeKicker = "Paso activo",
  children,
  completed,
  editLabel = "Editar",
  inactiveHint = "Volvé a abrir este paso para ajustar la configuración.",
  onEdit,
  step,
  summary,
  title,
}: SequentialStepCardProps<TStep>) {
  if (activeStep === step) {
    return (
      <Card className="rounded-[1.75rem] border-border/70 bg-background/95 shadow-sm">
        <CardHeader className="space-y-3">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs uppercase tracking-[0.24em]">
              {activeKicker}
            </p>
            <CardTitle className="text-2xl tracking-[-0.03em]">
              {title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    );
  }

  return (
    <Button
      className="h-auto w-full rounded-[1.5rem] border border-border/70 bg-background px-5 py-5 text-left text-foreground shadow-xs transition-colors hover:border-foreground/20 hover:bg-background"
      onClick={() => onEdit(step)}
      type="button"
      variant="ghost"
    >
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            {completed ? (
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                <CheckIcon className="size-3.5" />
              </span>
            ) : null}
            <p className="font-medium text-base text-foreground">{title}</p>
          </div>
          <div className="space-y-1">
            {summary.length > 0 ? (
              summary.map((line) => (
                <p
                  className="text-muted-foreground text-sm leading-relaxed"
                  key={line}
                >
                  {line}
                </p>
              ))
            ) : (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {inactiveHint}
              </p>
            )}
          </div>
        </div>
        <span className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-border/70 bg-muted/25 px-3 py-1.5 font-medium text-foreground text-sm">
          <PencilLineIcon className="size-4" />
          {editLabel}
        </span>
      </div>
    </Button>
  );
}

const ProductSetupStepCard = SequentialStepCard;

export { SequentialStepCard, ProductSetupStepCard };
export type { SequentialStepCardProps };
