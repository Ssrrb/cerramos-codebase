import { cn } from "../../lib/utils";
import {
  ActionItems,
  EmailCanvas,
  FulfillmentSnapshot,
  MessageBody,
  OrderItems,
  OrderSnapshot,
  PartySnapshot,
  PaymentSnapshot,
  PreviewEmptyState,
  PreviewLoadingState,
} from "./order-email-preview-shared";
import type { CommerceOrderEmailPreviewProps } from "./types";

function CommerceOrderEmailPreview({
  className,
  data,
  emptyStateDescription = "Conecta el payload del pedido para revisar el correo operativo que recibirá el comercio cuando se registre una nueva orden.",
  emptyStateTitle = "No hay correo para comercio",
  isLoading = false,
}: CommerceOrderEmailPreviewProps) {
  if (isLoading) {
    return <PreviewLoadingState />;
  }

  if (!data) {
    return (
      <div className={className}>
        <PreviewEmptyState
          description={emptyStateDescription}
          title={emptyStateTitle}
        />
      </div>
    );
  }

  const recipientLabel = data.commerceEmail.recipients?.length
    ? `Para: ${data.commerceEmail.recipients.join(", ")}`
    : "Para: equipo operativo del comercio";

  return (
    <div className={cn("space-y-4", className)}>
      <EmailCanvas
        badgeLabel="Correo para comercio"
        commerce={data.commerce}
        content={data.commerceEmail.content}
        recipientLabel={recipientLabel}
      >
        <div className="space-y-5">
          <MessageBody content={data.commerceEmail.content} />

          <div className="grid gap-4 xl:grid-cols-3">
            <OrderSnapshot data={data} />
            <PartySnapshot
              party={data.customer}
              subtitle="Datos del comprador para coordinar sin reconstruir información."
              title="Comprador"
            />
            <FulfillmentSnapshot
              data={data}
              description="Entrega o retiro tal como quedará informado al comercio."
            />
          </div>

          <OrderItems
            items={data.items}
            summary={data.summary}
            title="Detalle del pedido"
          />

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.85fr)]">
            <PaymentSnapshot
              data={data}
              description="El estado del pago se mantiene separado del estado del pedido."
            />
            <ActionItems items={data.commerceEmail.actionItems ?? []} />
          </div>
        </div>
      </EmailCanvas>
    </div>
  );
}

export { CommerceOrderEmailPreview };
