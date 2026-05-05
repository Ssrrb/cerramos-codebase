import {
  type CustomerTrackingFilter,
  CustomerTrackingFilters,
  type CustomerTrackingRefinement,
} from "@repo/design-system/components/customer-ordenes";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta = {
  title: "commerce/customer-tracking-filters",
  component: CustomerTrackingFilters,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof CustomerTrackingFilters>;

export default meta;

type Story = StoryObj<typeof meta>;

function FiltersPreview() {
  const [activeFilter, setActiveFilter] =
    useState<CustomerTrackingFilter>("all");
  const [refinement, setRefinement] =
    useState<CustomerTrackingRefinement>("all-time");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <CustomerTrackingFilters
      activeFilter={activeFilter}
      filters={[
        { count: 12, label: "Todo", value: "all" },
        { count: 7, label: "Órdenes", value: "orders" },
        { count: 5, label: "Suscripciones", value: "subscriptions" },
        { count: 6, label: "Activas", value: "active" },
        { count: 4, label: "Pasadas", value: "past" },
        { count: 2, label: "Atención", value: "action-needed" },
      ]}
      onFilterChange={setActiveFilter}
      onRefinementChange={setRefinement}
      onSearchTermChange={setSearchTerm}
      refinement={refinement}
      searchTerm={searchTerm}
    />
  );
}

export const Default: Story = {
  render: () => <FiltersPreview />,
};
