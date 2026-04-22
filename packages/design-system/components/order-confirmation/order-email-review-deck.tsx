"use client";

import { MailIcon, StoreIcon, UserRoundIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ClientOrderEmailPreview } from "./client-order-email-preview";
import { CommerceOrderEmailPreview } from "./commerce-order-email-preview";
import type { OrderEmailReviewDeckProps } from "./types";

function OrderEmailReviewDeck({
  className,
  clientData,
  commerceData,
  defaultTab = "commerce",
  isLoading = false,
}: OrderEmailReviewDeckProps) {
  return (
    <Card
      className={cn(
        "rounded-[2rem] border-border/70 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-muted)_18%,var(--color-background)_82%)_0%,var(--color-background)_28rem)] shadow-xs",
        className
      )}
    >
      <CardHeader className="gap-4 px-5 py-5 sm:px-6 sm:py-6">
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs uppercase tracking-[0.24em]">
            Revisión de confirmaciones
          </p>
          <CardTitle className="text-2xl tracking-[-0.03em]">
            Correos de pedido listos para revisión
          </CardTitle>
          <p className="max-w-3xl text-muted-foreground text-sm leading-relaxed sm:text-base">
            Revisá la notificación operativa del comercio y la confirmación del
            cliente con el mismo snapshot del pedido.
          </p>
        </div>

        <Tabs defaultValue={defaultTab}>
          <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl bg-muted/70 p-1 sm:w-fit">
            <TabsTrigger
              className="min-h-12 rounded-[1rem] px-4 py-2 text-left"
              value="commerce"
            >
              <StoreIcon className="size-4" />
              Comercio
            </TabsTrigger>
            <TabsTrigger
              className="min-h-12 rounded-[1rem] px-4 py-2 text-left"
              value="client"
            >
              <UserRoundIcon className="size-4" />
              Cliente
            </TabsTrigger>
          </TabsList>

          <TabsContent className="mt-5" value="commerce">
            <Card className="rounded-[1.5rem] border-border/70 bg-background/65 shadow-none">
              <CardContent className="px-4 py-4 sm:px-5">
                <div className="mb-4 flex items-center gap-2 text-muted-foreground text-sm">
                  <MailIcon className="size-4" />
                  Notificación interna del pedido registrado
                </div>
                <CommerceOrderEmailPreview
                  data={commerceData}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent className="mt-5" value="client">
            <Card className="rounded-[1.5rem] border-border/70 bg-background/65 shadow-none">
              <CardContent className="px-4 py-4 sm:px-5">
                <div className="mb-4 flex items-center gap-2 text-muted-foreground text-sm">
                  <MailIcon className="size-4" />
                  Confirmación para el cliente
                </div>
                <ClientOrderEmailPreview
                  data={clientData}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
}

export { OrderEmailReviewDeck };
