import type { Meta, StoryObj } from "@storybook/react";
import { NonDistractingFooter } from "@repo/design-system/components/layout/non-distracting-footer";

const meta: Meta<typeof NonDistractingFooter> = {
  title: "Layout/NonDistractingFooter",
  component: NonDistractingFooter,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof NonDistractingFooter>;

export const Default: Story = {
  args: {
    children: null,
  },
};

export const WithCustomContent: Story = {
  args: {
    children: (
      <div className="text-sm text-zinc-300 font-medium">
        Powered by Cerramos
      </div>
    ),
  },
};
