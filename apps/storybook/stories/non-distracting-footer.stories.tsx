import { NonDistractingFooter } from "@repo/design-system/components/layout/non-distracting-footer";
import type { Meta, StoryObj } from "@storybook/react";

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
      <div className="font-medium text-sm text-zinc-300">
        Powered by Cerramos
      </div>
    ),
  },
};
