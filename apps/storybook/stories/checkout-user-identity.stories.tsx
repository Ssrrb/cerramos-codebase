import type { Meta, StoryObj } from "@storybook/react"
import { CheckoutUserIdentity } from "@repo/design-system/components/checkout/checkout-user-identity"

const meta: Meta<typeof CheckoutUserIdentity> = {
  title: "checkout/User Identity",
  component: CheckoutUserIdentity,
  tags: ["autodocs"],
  argTypes: {
    user: {
      control: "object",
    },
  },
}

export default meta
type Story = StoryObj<typeof CheckoutUserIdentity>

export const LoggedIn: Story = {
  args: {
    user: {
      name: "Jane Doe",
      avatarUrl: "https://github.com/shadcn.png",
    },
  },
}

export const LoggedInNoAvatar: Story = {
  args: {
    user: {
      name: "Jane Doe",
    },
  },
}

export const LoggedOut: Story = {
  args: {
    user: null,
  },
}
