import type { Meta, StoryObj } from "@storybook/react";
import {
  AuthChrome,
  CommerceOnboardingFormView,
  SignInFormView,
  SignUpFormView,
} from "@repo/design-system/components/registration";

const meta: Meta<typeof SignInFormView> = {
  title: "registration/Registration",
  component: SignInFormView,
  tags: ["autodocs"],
} satisfies Meta<typeof SignInFormView>;

export default meta;

type Story = StoryObj<typeof meta>;

const noop = () => {};

export const AuthShell: Story = {
  render: () => (
    <div className="min-h-dvh bg-[oklch(0.989_0.002_286)] text-foreground dark:bg-[oklch(0.132_0.005_286)]">
      <AuthChrome ctaHref="/sign-up" ctaLabel="Sign Up" />
    </div>
  ),
};

export const SignInDefault: Story = {
  render: () => (
    <div className="p-6">
      <SignInFormView
        callbackHref="/sign-up"
        email=""
        googleEnabled
        onEmailChange={noop}
        onGoogleClick={noop}
        onPasswordChange={noop}
        onSubmit={(event) => event.preventDefault()}
        onUseDifferentEmail={noop}
        password=""
        step="email"
      />
    </div>
  ),
};

export const SignInPasswordStep: Story = {
  render: () => (
    <div className="p-6">
      <SignInFormView
        callbackHref="/sign-up"
        email="owner@example.com"
        error="Credenciales invalidas"
        googleEnabled
        onEmailChange={noop}
        onGoogleClick={noop}
        onPasswordChange={noop}
        onSubmit={(event) => event.preventDefault()}
        onUseDifferentEmail={noop}
        password="bad-password"
        step="password"
      />
    </div>
  ),
};

export const SignUpSetupStep: Story = {
  render: () => (
    <div className="p-6">
      <SignUpFormView
        accountHref="/sign-in"
        email=""
        name=""
        onBack={noop}
        onEmailChange={noop}
        onGoogleClick={noop}
        onNameChange={noop}
        onPasswordChange={noop}
        onSubmit={(event) => event.preventDefault()}
        onUsageChange={noop}
        password=""
        step="setup"
        usage="business"
      />
    </div>
  ),
};

export const SignUpAccountStep: Story = {
  render: () => (
    <div className="p-6">
      <SignUpFormView
        accountHref="/sign-in"
        email="owner@example.com"
        googleEnabled
        name="Sebastian"
        onBack={noop}
        onEmailChange={noop}
        onGoogleClick={noop}
        onNameChange={noop}
        onPasswordChange={noop}
        onSubmit={(event) => event.preventDefault()}
        onUsageChange={noop}
        password=""
        step="account"
        supportUrl="https://cerramos.com/contact"
        usage="business"
      />
    </div>
  ),
};

export const OnboardingDefault: Story = {
  render: () => (
    <CommerceOnboardingFormView
      businessName=""
      email="owner@example.com"
      name="Sebastian"
      onBusinessNameChange={noop}
      onSubmit={(event) => event.preventDefault()}
    />
  ),
};
