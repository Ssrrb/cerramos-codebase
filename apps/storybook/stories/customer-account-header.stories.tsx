import {
  CustomerAccountHeader,
  type CustomerTrackingSummaryItem,
} from "@repo/design-system/components/customer-ordenes";
import type { Meta, StoryObj } from "@storybook/react";

const summary: CustomerTrackingSummaryItem[] = [
  {
    description: "órdenes y suscripciones",
    label: "Total",
    value: "12",
  },
  {
    description: "todavía activas",
    label: "Activas",
    value: "7",
  },
  {
    description: "requieren atención",
    label: "Atención",
    value: "2",
  },
];

const meta = {
  title: "commerce/customer-account-header",
  component: CustomerAccountHeader,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof CustomerAccountHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    breadcrumbItems: [
      { href: "/es", label: "Inicio" },
      { label: "Cuenta" },
      { label: "Órdenes" },
    ],
    summary,
    title: "Tus órdenes",
  },
};
