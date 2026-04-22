import { cn } from "../../lib/utils";
import {
  ContactFooter,
  EmailCanvas,
  FulfillmentSnapshot,
  MessageBody,
  OrderItems,
  OrderSnapshot,
  PaymentSnapshot,
  PreviewEmptyState,
  PreviewLoadingState,
} from "./order-email-preview-shared";
import type { ClientOrderEmailPreviewProps } from "./types";

function ClientOrderEmailPreview({
  className,
  data,
  emptyStateDescription = "Conecta el payload del pedido para revisar el correo que recibirá el cliente cuando la orden quede procesada.",
  emptyStateTitle = "No hay correo para cliente",
  isLoading = false,
}: ClientOrderEmailPreviewProps) {
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

  const recipientLabel = data.customer.email
    ? `Para: ${data.customer.email}`
    : `Para: ${data.customer.name}`;

  return (
    <div className={cn("space-y-4", className)}>
      <EmailCanvas
        badgeLabel="Correo para cliente"
        commerce={data.commerce}
        content={data.clientEmail.content}
        recipientLabel={recipientLabel}
      >
        <div className="space-y-5">
          <MessageBody content={data.clientEmail.content} />

          <div className="grid gap-4 lg:grid-cols-2">
            <OrderSnapshot data={data} />
            <PaymentSnapshot
              data={data}
              description="El cliente ve el estado del pago sin mezclarlo con la aceptación operativa."
            />
          </div>

          <OrderItems
            items={data.items}
            summary={data.summary}
            title="Resumen de compra"
          />

          <FulfillmentSnapshot
            data={data}
            description="Datos de entrega o retiro para que el cliente sepa qué esperar."
          />

          <ContactFooter
            email={data.commerce.supportEmail ?? data.commerce.sender?.email}
            note={data.clientEmail.supportNotice}
            phone={data.commerce.supportPhone ?? data.commerce.sender?.phone}
            senderName={data.commerce.sender?.name}
          />
        </div>
      </EmailCanvas>
    </div>
  );
}

export { ClientOrderEmailPreview };
