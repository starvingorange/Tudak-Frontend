"use client";

import { Camera } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import {
  preUpload,
  signup,
} from "@/api/generated/auth-controller/auth-controller";
import type {
  CommonResponsePresignedUrlResponse,
  CommonResponseSignupAuthResponse,
} from "@/api/generated/model";
import {
  clearStoredSignupToken,
  getStoredSignupToken,
  setStoredAccessToken,
  setStoredSignupToken,
} from "@/lib/auth";
import { cn } from "@/lib/utils";

const MIN_NICKNAME_LENGTH = 2;
const MAX_NICKNAME_LENGTH = 12;

type ProfileSetupViewProps = {
  initialSignupToken?: string;
};

export function ProfileSetupView({
  initialSignupToken,
}: ProfileSetupViewProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [nickname, setNickname] = useState("");
  const [signupToken, setSignupTokenState] = useState<string | null>(
    initialSignupToken ?? null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [debugMessage, setDebugMessage] = useState("");

  const trimmedLength = nickname.trim().length;
  const valid =
    trimmedLength >= MIN_NICKNAME_LENGTH &&
    trimmedLength <= MAX_NICKNAME_LENGTH;
  // Real availability can only be confirmed by the backend on save, so this
  // hint only ever flags an invalid format — it never claims a name is free.
  const hint =
    nickname.length === 0
      ? "2~12자, 한글·영문·숫자를 쓸 수 있어요."
      : valid
        ? ""
        : "2자 이상 입력해주세요.";

  useEffect(() => {
    if (initialSignupToken) {
      setStoredSignupToken(initialSignupToken);
      setSignupTokenState(initialSignupToken);

      const nextSearchParams = new URLSearchParams(searchParams.toString());
      nextSearchParams.delete("signupToken");
      const nextQuery = nextSearchParams.toString();
      const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      router.replace(nextUrl);
      return;
    }

    setSignupTokenState(getStoredSignupToken());
  }, [initialSignupToken, pathname, router, searchParams]);

  const onPhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhoto(URL.createObjectURL(file));
    setErrorMessage("");
  };

  const submit = async () => {
    if (!valid || !photoFile || !signupToken || submitting) return;

    setSubmitting(true);
    setErrorMessage("");
    setDebugMessage("");
    let nextDebugMessage = "";

    try {
      const contentType = photoFile.type || "image/jpeg";
      const preUploadResponse = await preUpload({
        signupToken,
        contentType,
      });
      const preUploadBody =
        preUploadResponse as unknown as CommonResponsePresignedUrlResponse;
      const uploadData = preUploadBody.data as
        | {
            presignedUrl?: string;
            s3objectKey?: string;
            s3ObjectKey?: string;
          }
        | undefined;
      const resolvedS3ObjectKey =
        uploadData?.s3objectKey ?? uploadData?.s3ObjectKey;

      if (
        !preUploadBody.success ||
        !uploadData?.presignedUrl ||
        !resolvedS3ObjectKey
      ) {
        nextDebugMessage = JSON.stringify(
          {
            stage: "preUpload",
            success: preUploadBody.success,
            message: preUploadBody.message,
            uploadData,
            resolvedS3ObjectKey,
          },
          null,
          2,
        );
        setDebugMessage(nextDebugMessage);
        throw new Error(
          preUploadBody.message || "프로필 이미지 업로드 준비에 실패했어요.",
        );
      }

      const uploadResult = await fetch(uploadData.presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
        },
        body: photoFile,
      });

      if (!uploadResult.ok) {
        nextDebugMessage = JSON.stringify(
          {
            stage: "s3Upload",
            status: uploadResult.status,
            statusText: uploadResult.statusText,
          },
          null,
          2,
        );
        setDebugMessage(nextDebugMessage);
        throw new Error("프로필 이미지를 업로드하지 못했어요.");
      }

      const signupResponse = await signup({
        signupToken,
        nickname: nickname.trim(),
        s3ObjectKey: resolvedS3ObjectKey,
      });
      const signupBody =
        signupResponse as unknown as CommonResponseSignupAuthResponse;
      const accessToken = signupBody.data?.accessToken;

      if (!signupBody.success || !accessToken) {
        nextDebugMessage = JSON.stringify(
          {
            stage: "signup",
            success: signupBody.success,
            message: signupBody.message,
          },
          null,
          2,
        );
        setDebugMessage(nextDebugMessage);
        throw new Error(signupBody.message || "회원가입을 완료하지 못했어요.");
      }

      setStoredAccessToken(accessToken);
      clearStoredSignupToken();
      router.replace("/");
    } catch (error) {
      const signupRequestPayload = photoFile
        ? {
            signupToken,
            nickname: nickname.trim(),
            fileName: photoFile.name,
            fileType: photoFile.type || "image/jpeg",
            fileSize: photoFile.size,
          }
        : {
            signupToken,
            nickname: nickname.trim(),
          };
      const response = (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response instanceof Response
          ? error.response
          : null
      ) as Response | null;
      let responseBody: unknown = null;

      if (response) {
        try {
          responseBody = await response.clone().json();
        } catch {
          try {
            responseBody = await response.clone().text();
          } catch {
            responseBody = null;
          }
        }
      }

      const nextMessage =
        error instanceof Error
          ? error.message
          : "온보딩 중 문제가 생겼어요. 다시 시도해주세요.";

      setErrorMessage(nextMessage);
      setDebugMessage(
        nextDebugMessage ||
          JSON.stringify(
            {
              stage: "exception",
              message: error instanceof Error ? error.message : String(error),
              status: response?.status,
              statusText: response?.statusText,
              responseBody,
              signupRequestPayload,
            },
            null,
            2,
          ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-3.5">
        <div className="relative w-[140px] h-[52px]">
          <Image
            src="/assets/logo-hero-light.png"
            alt="투닭"
            fill
            sizes="140px"
            className="object-contain dark:hidden"
          />
          <Image
            src="/assets/logo-hero-dark.png"
            alt="투닭"
            fill
            sizes="140px"
            className="object-contain hidden dark:block"
          />
        </div>
        <h1 className="text-[26px] font-black tracking-[-0.5px] m-0">
          프로필을 설정해주세요
        </h1>
        <div className="text-[15px] font-semibold text-[var(--text-2)] whitespace-nowrap">
          토론에서 사용할 프로필이에요. 나중에 바꿀 수 있어요.
        </div>
      </div>

      <div className="flex flex-col items-center gap-7 w-[420px] max-w-[90vw] bg-[var(--bg-card)] border border-[var(--border-1)] rounded-3xl p-10 box-border">
        <div className="relative w-[140px] h-[140px]">
          <div className="w-[140px] h-[140px] rounded-full overflow-hidden border-[3px] border-[var(--brand-yellow)] box-border bg-[var(--bg-hero)]">
            <Image
              src={photo ?? "/assets/profile-placeholder.png"}
              alt="프로필 사진"
              width={140}
              height={140}
              className="w-full h-full object-cover"
              unoptimized={photo !== null}
            />
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="프로필 사진 변경"
            className="absolute bottom-0.5 right-0.5 w-[38px] h-[38px] rounded-full bg-[var(--brand-yellow)] border-[3px] border-[var(--bg-card)] box-border flex items-center justify-center cursor-pointer"
          >
            <Camera size={17} strokeWidth={2} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onPhotoChange}
            className="hidden"
          />
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          <div className="text-sm font-extrabold">닉네임</div>
          <div className="relative">
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={MAX_NICKNAME_LENGTH}
              placeholder="닉네임을 입력해주세요"
              className={cn(
                "w-full h-[54px] rounded-2xl border-[1.5px] pr-[76px] pl-[18px] text-[15px] font-bold box-border bg-[var(--bg-card)] outline-none",
                !valid && nickname.length > 0
                  ? "border-[#FF6B6B]"
                  : "border-[var(--border-1)]",
              )}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[var(--text-3)]">
              {nickname.length} / {MAX_NICKNAME_LENGTH}
            </span>
          </div>
          <div
            className={cn(
              "text-[13px] min-h-[18px]",
              nickname.length === 0 || valid
                ? "text-[var(--text-3)]"
                : "text-[#FF6B6B]",
            )}
          >
            {hint}
          </div>
          {!signupToken && (
            <div className="text-[13px] text-[#FF6B6B]">
              로그인 세션이 없어요. 카카오 로그인부터 다시 진행해주세요.
            </div>
          )}

          {errorMessage && (
            <div className="whitespace-pre-wrap break-all text-[13px] text-[#FF6B6B]">
              {debugMessage ? `${errorMessage}\n${debugMessage}` : errorMessage}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => void submit()}
          disabled={!valid || !photoFile || !signupToken || submitting}
          className={cn(
            "w-full h-14 rounded-2xl text-base font-black font-sans",
            valid && photoFile && signupToken && !submitting
              ? "bg-[var(--brand-yellow)] text-[var(--brand-on-yellow)] cursor-pointer hover:brightness-[0.97]"
              : "bg-[var(--border-1)] text-[var(--text-3)] cursor-not-allowed",
          )}
        >
          {submitting ? "가입 완료 중..." : "투닭 시작하기"}
        </button>
      </div>
    </>
  );
}
