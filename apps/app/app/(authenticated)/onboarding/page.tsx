import { auth } from "@repo/auth/server";
import { redirect } from "next/navigation";
import { OnboardingForm } from "../components/onboarding-form";

const OnboardingPage = async () => {
  const { orgId, redirectToSignIn, userId } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  if (orgId) {
    redirect("/");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <OnboardingForm />
    </div>
  );
};

export default OnboardingPage;
