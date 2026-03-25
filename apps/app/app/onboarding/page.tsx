import { requireSession } from "@repo/auth/server";
import { redirect } from "next/navigation";
import CommerceOnboardingForm from "./commerce-onboarding-form";

const OnboardingPage = async () => {
  const session = await requireSession();

  if (session.user.commerceId) {
    redirect("/");
  }

  return (
    <CommerceOnboardingForm
      email={session.user.email}
      name={session.user.name}
    />
  );
};

export default OnboardingPage;
