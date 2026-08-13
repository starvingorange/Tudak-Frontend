"use client";

import { useGetMyDebateList } from "@/api/user-debate/hooks/useGetMyDebateList";
import { BACKEND_TO_CATEGORY } from "@/features/shared/categories";
import { MyDebateRow } from "./my-debate-row";

export function MyDebatesView() {
  const { data, isLoading } = useGetMyDebateList({
    pageable: { page: 0, size: 20 },
  });
  const debates = data?.data?.content ?? [];

  if (isLoading) return null;

  if (debates.length === 0) {
    return (
      <div className="border border-dashed border-(--border-1) rounded-(--radius-section) py-14 text-center text-[15px] text-(--text-2)">
        아직 참여한 토론이 없어요.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {debates.map((debate, index) => (
        <MyDebateRow
          // biome-ignore lint/suspicious/noArrayIndexKey: 목록 응답에 id가 없어서 안정적인 키가 없다.
          key={index}
          category={
            debate.categoryType
              ? BACKEND_TO_CATEGORY[debate.categoryType]
              : "기타"
          }
          title={debate.title ?? ""}
          agrees={debate.agrees ?? 0}
          disagrees={debate.disagrees ?? 0}
        />
      ))}
    </div>
  );
}
