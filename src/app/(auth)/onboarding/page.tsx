import { ProfileSetupView } from "@/features/auth/profile-setup-view";

type OnboardingPageProps = {
  searchParams: Promise<{
    signupToken?: string | string[];
  }>;
};

const readSearchParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <ProfileSetupView
      initialSignupToken={readSearchParam(resolvedSearchParams.signupToken)}
    />
  );
}
