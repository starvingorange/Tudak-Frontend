import { GoogleCallbackView } from "@/features/auth/google-callback-view";

type GoogleCallbackPageProps = {
  searchParams: Promise<{
    code?: string | string[];
    error?: string | string[];
  }>;
};

const readSearchParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export default async function GoogleCallbackPage({
  searchParams,
}: GoogleCallbackPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <GoogleCallbackView
      authCode={readSearchParam(resolvedSearchParams.code)}
      authError={readSearchParam(resolvedSearchParams.error)}
    />
  );
}
