# CLAUDE.md

이 파일은 Claude Code가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 프로젝트 컨벤션

구조, 네이밍, 스타일링, 데이터 페칭 등 전체 컨벤션은
[AGENTS.md](./AGENTS.md)에 있습니다 — 코드를 생성하거나 수정하기 전에
먼저 읽으세요.

@AGENTS.md

## 명령어

```bash
pnpm dev            # 개발 서버
pnpm build          # 프로덕션 빌드
pnpm lint           # biome check
pnpm lint:fix       # biome check --write
pnpm format         # biome format --write
pnpm api:generate   # OpenAPI 스펙으로 src/api/ 재생성
npx tsc --noEmit    # 타입체크
```

## 핵심 규칙 요약

1. 파일은 전부 kebab-case, 예외 없음 — PascalCase/camelCase는 export하는
   식별자에만 적용.
2. `features/`는 도메인별로 묶고, 컴포넌트 하나당 폴더 하나는 안 함 —
   `index.ts` 배럴 없음.
3. named export + `function` 선언, Next.js 라우트 파일(`page.tsx`/
   `layout.tsx`)만 예외로 default export 필수.
4. props 타입은 컴포넌트 바로 위에 `interface {ComponentName}Props`,
   줄여쓰지 않음.
5. Tailwind + `src/tokens/*.css` CSS 변수 토큰(`bg-(--bg-card)`) —
   Emotion/styled-components/CSS Modules 없음.
6. `src/api/{domain}/{api,types}/`는 `pnpm api:generate`로 생성됨 —
   손으로 수정하지 말고 `scripts/restructure-api.ts`나 스펙을 고칠 것.
   `hooks/`는 생성되지 않고 그 위에 손으로 작성.
7. 이동 가능한 경로는 전부 `src/lib/routes.ts`의 `ROUTES`를 거침 —
   경로 문자열 하드코딩 없음.
8. 린트/포맷은 Biome (ESLint/Prettier 아님), import 자동 정렬이 포맷 시
   실행되니 손으로 순서 맞추지 말 것.
