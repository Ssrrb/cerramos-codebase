import type { Meta, StoryObj } from "@storybook/react";
import { NonDistractingHeader } from "@repo/design-system/components/layout/non-distracting-header";

const meta: Meta<typeof NonDistractingHeader> = {
  title: "Layout/NonDistractingHeader",
  component: NonDistractingHeader,
  tags: ["autodocs"],
  argTypes: {
    accountAction: {
      control: "text",
      description: "Optional action for account management",
    },
  },
};

export default meta;
type Story = StoryObj<typeof NonDistractingHeader>;

export const Default: Story = {
  args: {
    accountAction: null,
  },
};

export const WithAccountAction: Story = {
  args: {
    accountAction: "Sign in for faster checkout",
  },
};
