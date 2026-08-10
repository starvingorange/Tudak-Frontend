import { KakaoCallbackView } from "@/features/auth/kakao-callback-view";

type KakaoCallbackPageProps = {
  searchParams: Promise<{
    code?: string | string[];
    error?: string | string[];
  }>;
};

const readSearchParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export default async function KakaoCallbackPage({
  searchParams,
}: KakaoCallbackPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <KakaoCallbackView
      authCode={readSearchParam(resolvedSearchParams.code)}
      authError={readSearchParam(resolvedSearchParams.error)}
    />
  );
}
