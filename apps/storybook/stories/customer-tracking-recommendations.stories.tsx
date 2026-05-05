import { CustomerTrackingRecommendations } from "@repo/design-system/components/customer-ordenes";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "commerce/customer-tracking-recommendations",
  component: CustomerTrackingRecommendations,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof CustomerTrackingRecommendations>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      {
        action: {
          href: "/es/buy/mate-shop/mate-premium",
          label: "Volver a comprar",
        },
        badgeLabel: "Order",
        description: "La compra más repetida del último mes.",
        id: "recommendation_1",
        priceLabel: "Gs. 145.000",
        title: "Set matero de acero",
      },
      {
        action: {
          href: "/es/buy/plan-growth/growth-mensual",
          label: "Abrir plan",
        },
        badgeLabel: "Subscription",
        description: "El plan mensual sigue vigente y listo para retomarlo.",
        id: "recommendation_2",
        priceLabel: "Gs. 89.000",
        title: "Plan Growth mensual",
      },
    ],
  },
};
