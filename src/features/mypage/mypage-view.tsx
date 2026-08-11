"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  History,
  LogOut,
  MessageCircle,
  Settings,
  ThumbsUp,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type {
  CommonResponseFindMyPageResponse,
  CommonResponsePresignedUrlResponse,
  CommonResponseVoid,
} from "@/api/generated/model";
import {
  getMyPageQueryKey,
  preUpload1,
  useModifyProfile,
  useMyPage,
} from "@/api/generated/user-controller/user-controller";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { getMyCompletedDebates, getMyVotes } from "./data";
import { EditProfileModal } from "./edit-profile-modal";
import { LogoutModal } from "./logout-modal";
import { MenuRow } from "./menu-row";

export function MyPageView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState("");
  const [saveDebugMessage, setSaveDebugMessage] = useState("");

  const myDebates = getMyCompletedDebates();
  const myVotes = getMyVotes();
  const { data, isLoading, isError, error } = useMyPage();
  const myPageBody = data as unknown as
    | CommonResponseFindMyPageResponse
    | undefined;
  const profile = myPageBody?.data;
  const nickname = profile?.nickname?.trim() || "사용자";
  const photo = profile?.presignedUrl ?? null;
  const debateCount = profile?.debateCount ?? myDebates.length;
  const pollCount = profile?.pollCount ?? myVotes.length;

  const modifyProfileMutation = useModifyProfile({
    mutation: {
      onError: (mutationError) => {
        setSaveErrorMessage(
          mutationError instanceof Error
            ? mutationError.message
            : "프로필 저장 중 문제가 생겼어요.",
        );
      },
    },
  });

  const profileLoadErrorMessage =
    error instanceof Error ? error.message : "프로필 정보를 불러오지 못했어요.";

  return (
    <div className="mx-auto max-w-241 px-4 pt-2 pb-10">
      <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:py-9">
        <div>
          <h1 className="m-0 text-[28px] font-extrabold tracking-[-0.5px] sm:text-[32px]">
            마이페이지
          </h1>
          <div className="mt-2 text-[14px] text-(--text-2) sm:text-[15px]">
            내 프로필과 지금까지의 활동 내역을 확인해보세요!
          </div>
        </div>
        <Image
          src="/assets/stickers/st-pro-happy.png"
          alt="투닭 캐릭터"
          width={175}
          height={172}
          priority
          className="h-28 w-28 self-end object-contain sm:mr-10 sm:h-37.5 sm:w-37.5"
        />
      </div>

      <section className="bg-(--bg-surface) border border-(--border-1) rounded-(--radius-section) overflow-hidden">
        <div className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-[26px_28px]">
          <Image
            src={photo ?? "/assets/avatar.png"}
            alt="프로필"
            width={88}
            height={88}
            className="w-22 h-22 rounded-full shrink-0 object-cover"
            unoptimized={photo !== null}
          />
          <div className="flex-1 min-w-0">
            <div className="text-xl font-extrabold tracking-[-0.3px]">
              {isLoading ? "불러오는 중..." : nickname}
            </div>
            <div className="mt-1.5 text-sm text-(--text-2)">
              토론에서 사용하는 프로필이에요.
            </div>
            {isError && (
              <div className="mt-2 text-[13px] text-[#FF6B6B]">
                {profileLoadErrorMessage}
              </div>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setEditing(true)}
            disabled={isLoading || isError}
            className="w-full sm:w-auto"
          >
            프로필 수정
          </Button>
        </div>
        <div className="grid grid-cols-2 border-t border-(--border-1) bg-(--bg-hero)">
          <div className="flex flex-col items-center gap-1 py-4 sm:py-5">
            <span className="text-[13px] font-bold text-(--text-2)">
              참여한 토론
            </span>
            <span className="text-[22px] font-black">{debateCount}건</span>
          </div>
          <div className="flex flex-col items-center gap-1 border-l border-(--border-1) py-4 sm:py-5">
            <span className="text-[13px] font-bold text-(--text-2)">
              참여한 투표
            </span>
            <span className="text-[22px] font-black">{pollCount}건</span>
          </div>
        </div>
      </section>

      <section className="mt-7">
        <SectionHeader
          icon={<History size={18} className="text-(--text-1)" />}
          title="활동 내역"
        />
        <div className="bg-(--bg-surface) border border-(--border-1) rounded-(--radius-section) mt-4.5 overflow-hidden">
          <MenuRow
            href="/mypage/debates"
            icon={<MessageCircle size={20} />}
            label="참여한 토론"
            trailing={`${myDebates.length}건`}
          />
          <MenuRow
            href="/mypage/votes"
            icon={<ThumbsUp size={20} />}
            label="참여한 투표"
            trailing={`${myVotes.length}건`}
          />
        </div>
      </section>

      <section className="mt-7">
        <SectionHeader
          icon={<Settings size={18} className="text-(--text-1)" />}
          title="계정"
        />
        <div className="bg-(--bg-surface) border border-(--border-1) rounded-(--radius-section) mt-4.5 overflow-hidden">
          <MenuRow
            icon={<LogOut size={20} />}
            label="로그아웃"
            onClick={() => setLoggingOut(true)}
          />
        </div>
      </section>

      {editing && (
        <EditProfileModal
          nickname={nickname}
          photo={photo}
          onClose={() => setEditing(false)}
          saving={modifyProfileMutation.isPending}
          errorMessage={
            saveDebugMessage
              ? `${saveErrorMessage}\n${saveDebugMessage}`
              : saveErrorMessage
          }
          onSave={async (nextNickname, nextPhotoFile) => {
            setSaveErrorMessage("");
            setSaveDebugMessage("");
            try {
              let s3ObjectKey: string | undefined;

              if (nextPhotoFile) {
                const contentType = nextPhotoFile.type || "image/jpeg";
                const preUploadResponse = await preUpload1({
                  contentType,
                });
                const uploadResponse =
                  preUploadResponse as unknown as CommonResponsePresignedUrlResponse;
                const uploadData = uploadResponse.data as
                  | {
                      presignedUrl?: string;
                      s3objectKey?: string;
                      s3ObjectKey?: string;
                    }
                  | undefined;
                const resolvedS3ObjectKey =
                  uploadData?.s3objectKey ?? uploadData?.s3ObjectKey;

                if (
                  !uploadResponse?.success ||
                  !uploadData?.presignedUrl ||
                  !resolvedS3ObjectKey
                ) {
                  setSaveDebugMessage(
                    JSON.stringify(
                      {
                        stage: "preUpload",
                        success: uploadResponse?.success,
                        message: uploadResponse?.message,
                        uploadData,
                        resolvedS3ObjectKey,
                      },
                      null,
                      2,
                    ),
                  );
                  setSaveErrorMessage(
                    uploadResponse?.message ||
                      "프로필 이미지 업로드 준비에 실패했어요.",
                  );
                  return;
                }

                const uploadResult = await fetch(uploadData.presignedUrl, {
                  method: "PUT",
                  headers: {
                    "Content-Type": contentType,
                  },
                  body: nextPhotoFile,
                });

                if (!uploadResult.ok) {
                  setSaveDebugMessage(
                    JSON.stringify(
                      {
                        stage: "s3Upload",
                        status: uploadResult.status,
                        statusText: uploadResult.statusText,
                      },
                      null,
                      2,
                    ),
                  );
                  setSaveErrorMessage("프로필 이미지를 업로드하지 못했어요.");
                  return;
                }

                s3ObjectKey = resolvedS3ObjectKey;
              }

              const response = await modifyProfileMutation.mutateAsync({
                data: {
                  nickname: nextNickname,
                  ...(s3ObjectKey ? { s3ObjectKey } : {}),
                } as {
                  nickname: string;
                  s3ObjectKey?: string;
                },
              });
              const modifyProfileBody =
                response as unknown as CommonResponseVoid;

              if (!modifyProfileBody.success) {
                setSaveDebugMessage(
                  JSON.stringify(
                    {
                      stage: "modifyProfile",
                      success: modifyProfileBody.success,
                      message: modifyProfileBody.message,
                      payload: {
                        nickname: nextNickname,
                        s3ObjectKey,
                      },
                    },
                    null,
                    2,
                  ),
                );
                setSaveErrorMessage(
                  modifyProfileBody.message || "프로필을 저장하지 못했어요.",
                );
                return;
              }

              await queryClient.invalidateQueries({
                queryKey: getMyPageQueryKey(),
              });
              setSaveErrorMessage("");
              setSaveDebugMessage("");
              setEditing(false);
            } catch (error) {
              setSaveDebugMessage(
                JSON.stringify(
                  {
                    stage: "exception",
                    message:
                      error instanceof Error ? error.message : String(error),
                  },
                  null,
                  2,
                ),
              );
              console.error("[profile] save failed", error);
              // The mutation-level error handler already surfaces the message.
            }
          }}
        />
      )}

      {loggingOut && (
        <LogoutModal
          onClose={() => setLoggingOut(false)}
          onConfirm={() => router.push("/")}
        />
      )}
    </div>
  );
}
