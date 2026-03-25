import { requireSession } from "@repo/auth/server";
import { redirect } from "next/navigation";
import CommerceOnboardingForm from "./commerce-onboarding-form";

const OnboardingPage = async () => {
  const session = await requireSession();

  // Onboarding only exists for signed-in users who still need a commerce record.
  // Once a commerce is attached, the authenticated dashboard can resolve
  // merchant-scoped data and this page is no longer relevant.
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
