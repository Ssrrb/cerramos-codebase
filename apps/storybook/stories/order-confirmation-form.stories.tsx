import {
  type ClientOrderEmailData,
  ClientOrderEmailPreview,
  type CommerceOrderEmailData,
  CommerceOrderEmailPreview,
  OrderEmailReviewDeck,
} from "@repo/design-system/components/order-confirmation";
import type { Meta, StoryObj } from "@storybook/react";

const baseSharedData = {
  commerce: {
    name: "Casa Nube",
    legalName: "Casa Nube S.R.L.",
    logoUrl:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80",
    supportEmail: "ayuda@casanube.com.py",
    supportPhone: "+595 981 880 112",
    sender: {
      name: "Lucia Benitez",
      roleLabel: "Operaciones",
      email: "ops@casanube.com.py",
      phone: "+595 981 900 021",
    },
  },
  customer: {
    name: "Camila Ferreira",
    email: "camila@cerramos.com",
    phone: "+595 981 123 456",
  },
  delivery: {
    methodLabel: "Entrega a domicilio",
    etaLabel: "Viernes 25 de abril, entre 18:00 y 21:00",
    trackingLabel: "CN-45821",
    address: {
      lines: [
        "Camila Ferreira",
        "Av. Espana 742 casi Peru, Depto 204",
        "San Lorenzo, Central, Paraguay",
      ],
      referenceNote: "Porton negro frente a la farmacia.",
    },
    instructions: "El cliente pidio recibir el paquete despues de las 18:00.",
  },
  items: [
    {
      id: "item-mate-kit",
      name: "Set matero de acero con bombilla y funda termica",
      variantLabel: "Negro mate / 1 litro",
      sku: "MAT-100-BLK",
      quantity: 1,
      unitLabel: "Gs. 145.000 cada uno",
      totalLabel: "Gs. 145.000",
      imageUrl:
        "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80",
    },
  ],
  order: {
    reference: "ORD-2048",
    statusLabel: "Pedido procesado",
    placedAtLabel: "22 abr 2026, 14:35",
    processedAtLabel: "22 abr 2026, 14:42",
    sourceLabel: "Link de producto / cerramos.com",
  },
  payment: {
    statusLabel: "Pago aprobado",
    methodLabel: "uPay tarjeta terminada en 4242",
    amountLabel: "Gs. 145.000",
    reference: "PAY-99817",
  },
  summary: {
    rows: [
      { label: "Subtotal", value: "Gs. 145.000" },
      { label: "Envio", value: "Incluido" },
      { label: "Proteccion", value: "Cobertura Cerramos" },
    ],
    totalLabel: "Gs. 145.000",
  },
} satisfies Omit<CommerceOrderEmailData, "commerceEmail">;

const commercePopulatedData: CommerceOrderEmailData = {
  ...baseSharedData,
  commerceEmail: {
    recipients: ["ops@casanube.com.py", "pedidos@casanube.com.py"],
    content: {
      subject: "Nuevo pedido registrado: ORD-2048",
      preheader:
        "Pedido listo para operar con comprador, entrega, pago y resumen en un solo correo.",
      eyebrow: "Alerta operativa",
      headline: "Tenes un pedido nuevo listo para revisar",
      intro:
        "Recibiste un pedido estructurado para operar sin reconstruir datos desde mensajes sueltos.",
      body: [
        "El comprador completo el checkout y el sistema dejo consolidado el detalle del pedido, la forma de entrega y el estado del pago.",
        "Usa este correo como alerta rapida. El panel interno sigue siendo la fuente operativa para confirmar, cancelar o auditar cambios.",
      ],
      outro: "Revisa el pedido y continua con la gestion comercial.",
    },
    actionItems: [
      "Validar disponibilidad final antes de confirmar.",
      "Preparar la entrega para la franja solicitada.",
      "Responder al cliente si necesitara ajustar direccion o contacto.",
    ],
  },
};

const clientPopulatedData: ClientOrderEmailData = {
  ...baseSharedData,
  clientEmail: {
    content: {
      subject: "Tu pedido ORD-2048 fue procesado con exito",
      preheader:
        "Te compartimos el resumen de compra, entrega y pago para que sepas que esperar.",
      eyebrow: "Confirmacion de pedido",
      headline: "Tu compra ya quedo registrada",
      intro:
        "Gracias por comprar en Casa Nube. Ya dejamos listo el detalle de tu pedido y la informacion para la entrega.",
      body: [
        "Tu pedido se proceso correctamente y el comercio ya cuenta con los datos necesarios para prepararlo.",
        "Si necesitas corregir algun dato de contacto o entrega, responde a este canal cuanto antes para que el comercio pueda ayudarte.",
      ],
      outro: "Gracias por elegir Casa Nube.",
    },
    supportNotice:
      "Si necesitas ayuda, escribe a ayuda@casanube.com.py o responde al correo de confirmacion.",
  },
};

const commerceEdgeCaseData: CommerceOrderEmailData = {
  ...baseSharedData,
  customer: {
    name: "Cliente sin telefono",
    email: "compras@ejemplo.com",
  },
  delivery: {
    methodLabel: "Retiro en tienda",
    etaLabel: "Horario pendiente de confirmacion",
    pickupLocationLabel: "Sucursal Mariscal",
    instructions:
      "El cliente cambio de entrega a retiro despues de cerrar el checkout.",
  },
  order: {
    reference: "ORD-3091",
    statusLabel: "Pendiente de coordinacion",
    placedAtLabel: "22 abr 2026, 16:10",
    processedAtLabel: "22 abr 2026, 16:14",
    sourceLabel: "Ajuste manual del operador",
  },
  payment: {
    statusLabel: "Autorizado",
    methodLabel: "Pago contra entrega",
    amountLabel: "Gs. 220.000",
  },
  items: [
    ...baseSharedData.items,
    {
      id: "item-gift-note",
      name: "Tarjeta de regalo escrita a mano",
      quantity: 1,
      unitLabel: "Incluido",
      totalLabel: "Incluido",
      variantLabel: "Mensaje personalizado",
    },
  ],
  summary: {
    rows: [
      { label: "Subtotal", value: "Gs. 220.000" },
      { label: "Envio", value: "Retiro en sucursal" },
      { label: "Coordinacion", value: "Pendiente", emphasis: true },
    ],
    totalLabel: "Gs. 220.000",
  },
  commerceEmail: {
    recipients: ["ops@casanube.com.py"],
    content: {
      subject: "Nuevo pedido con retiro pendiente: ORD-3091",
      preheader:
        "El pedido ya fue registrado, pero todavia requiere coordinacion final con el cliente.",
      eyebrow: "Alerta operativa",
      headline: "Pedido registrado con detalles por definir",
      intro:
        "El checkout se cerro correctamente, pero el retiro necesita una ultima confirmacion del comercio.",
      body: [
        "El cliente cambio la modalidad de entrega despues del checkout y no dejo telefono alternativo.",
        "Usa el panel para completar la coordinacion antes de comprometer una franja exacta.",
      ],
      outro: "Confirma sucursal y horario antes de avanzar.",
    },
    actionItems: [
      "Confirmar horario de retiro con el cliente.",
      "Verificar si la sucursal Mariscal tiene stock disponible.",
    ],
  },
};

const clientEdgeCaseData: ClientOrderEmailData = {
  ...commerceEdgeCaseData,
  clientEmail: {
    content: {
      subject: "Recibimos tu pedido ORD-3091",
      preheader:
        "Tu compra quedo registrada y el comercio esta terminando de coordinar el retiro.",
      eyebrow: "Confirmacion de pedido",
      headline: "Tu pedido esta casi listo",
      intro:
        "Procesamos tu compra y el comercio ya esta revisando la coordinacion final para el retiro.",
      body: [
        "Todavia falta confirmar la sucursal definitiva y la franja horaria para retirar tu pedido.",
        "En cuanto ese dato quede cerrado, el comercio te va a contactar con la informacion final.",
      ],
      outro: "Te avisaremos apenas quede confirmada la coordinacion.",
    },
    supportNotice:
      "Si necesitas cambiar el punto de retiro, responde a este correo con la sucursal que prefieres.",
  },
};

const meta: Meta<typeof OrderEmailReviewDeck> = {
  title: "commerce/OrderEmailPreviews",
  component: OrderEmailReviewDeck,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="min-h-dvh bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-muted)_28%,var(--color-background)_72%)_0%,var(--color-background)_18rem)] px-4 py-6 text-foreground sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof OrderEmailReviewDeck>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CommerceEmpty: Story = {
  render: () => <CommerceOrderEmailPreview />,
};

export const CommercePopulated: Story = {
  render: () => <CommerceOrderEmailPreview data={commercePopulatedData} />,
};

export const CommerceLoading: Story = {
  render: () => <CommerceOrderEmailPreview isLoading />,
};

export const CommerceEdgeCase: Story = {
  render: () => <CommerceOrderEmailPreview data={commerceEdgeCaseData} />,
};

export const ClientEmpty: Story = {
  render: () => <ClientOrderEmailPreview />,
};

export const ClientPopulated: Story = {
  render: () => <ClientOrderEmailPreview data={clientPopulatedData} />,
};

export const ClientLoading: Story = {
  render: () => <ClientOrderEmailPreview isLoading />,
};

export const ClientEdgeCase: Story = {
  render: () => <ClientOrderEmailPreview data={clientEdgeCaseData} />,
};

export const ReviewDeck: Story = {
  args: {
    commerceData: commercePopulatedData,
    clientData: clientPopulatedData,
  },
};
