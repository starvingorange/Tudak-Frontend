<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# 프로젝트 구조 & 네이밍 컨벤션

Next.js 자체는 예약된 라우팅 파일명(`page`, `layout`, `loading`, `error`,
`route`, `template`, `default`, `not-found`) 외에는 아무런 규칙을 강제하지
않는다 — 아래 내용은 전부 이 프로젝트에서 자체적으로 정한 컨벤션이다.
일관성을 위해 따르고, 파일 하나만 다른 스타일로 새로 만들지 말 것.

## 폴더

- `src/app/` — 라우팅 전용 (`(auth)`, `(main)`, `(no-footer)` route group으로
  URL에 영향 없이 레이아웃만 분리). `page.tsx`는 얇게 유지하고 실제 내용은
  `features/*`의 view 컴포넌트에 위임한다.
- `src/features/` — 도메인별로 폴더 하나 (`debates`, `votes`, `mypage`,
  `auth`, `main`, `shared`). 관련된 컴포넌트 여러 개가 한 폴더에 같이
  있는 구조이고, 컴포넌트 하나당 폴더 하나로 쪼개지 않는다 (이유는 아래
  "컴포넌트 하나당 파일 하나(폴더 아님)" 참고).
- `src/components/` — 특정 feature에 종속되지 않는 재사용 컴포넌트. `ui/`는
  범용 디자인시스템 프리미티브, `layout/`은 앱 전역 UI(네브바/푸터),
  도메인 성격이 있지만 공유되는 컴포넌트(`auth/` 등)는 자기 서브폴더를 가짐.
- `src/lib/` — "우리 백엔드에 REST로 요청" 이외의 크로스커팅 유틸리티.
  3rd-party 연동 헬퍼(OAuth 리다이렉트 URL 빌더), WebSocket 등 REST가 아닌
  프로토콜 코드, 범용 훅/유틸이 여기 속함.
- `src/api/` — `api/`, `types/`는 **생성 전용**, `hooks/`는 그 위에
  손으로 작성. 아래 "Orval 생성 API 레이어" 참고. `api-client.ts`,
  `orval-mutator.ts`(생성 코드가 의존하는 파일), `common/query-helpers.ts`,
  `{domain}/hooks/*.ts` 외에는 절대 손으로 파일을 만들지 않는다.
- `src/stores/` — Zustand 스토어. `src/providers/` — `app/layout.tsx`를
  감싸야 하는 React context provider.

## 파일 네이밍

- 손으로 작성하는 파일은 예외 없이 전부 **kebab-case** — JSX가 있으면
  `.tsx`, 없으면 그냥 `.ts`. export하는 컴포넌트/훅은 평소대로
  PascalCase/camelCase (`debate-card.tsx` → `DebateCard`,
  `use-login-gate.tsx` → `useLoginGate`).
- PascalCase 파일명은 그 자체로 유효한 스타일이긴 하지만 이 프로젝트에서는
  쓰지 않는다 — `app/` 밑 라우트 세그먼트도 kebab이고 나머지 코드베이스도
  전부 kebab인데 거기에 섞으면 얻는 것 없이 일관성만 깨진다.
- 역할별 접미사 규칙 (기존 패턴 그대로):
  - `*-view.tsx` — 라우트의 `page.tsx`가 렌더하는 최상위 컴포넌트
  - `*-modal.tsx` — 모달
  - `*-list.tsx` — 리스트/컬렉션 컴포넌트
  - `*-card.tsx` / `*-row.tsx` — 리스트/그리드 안의 개별 아이템 컴포넌트
  - `*-section.tsx` — 랜딩/복합 페이지의 한 섹션
  - `use-*.ts(x)` — 훅 (파일명은 kebab-case, 내부 export는 `useXxx`).
    훅 자체가 JSX를 반환하면 `.tsx` 사용 (예: `use-login-gate.tsx`는
    모달 엘리먼트를 반환함)
  - `data.ts` — 해당 feature 폴더 안에서만 쓰는 목업/정적 데이터. 새로
    목업을 추가하기 전에 대응되는 `src/api/{domain}/hooks/`가 이미 있는지
    부터 확인할 것 (아래 참고)

## 컴포넌트 하나당 파일 하나 (폴더 아님)

컴포넌트 하나당 폴더 하나(`component-name/ComponentName.tsx` +
`index.ts` 배럴) 패턴은 쓰지 않는다. 이 패턴은 그 폴더 안에 같이 묶을 게
있을 때(테스트, CSS Module, Storybook 스토리, 그 컴포넌트 전용
서브컴포넌트) 값어치를 하는데, 이 프로젝트는 스타일을 인라인 Tailwind로
처리하고 테스트/스토리 파일도 없어서 폴더로 쪼개봤자 `index.ts` 관리
비용만 늘고 얻는 게 없다. 특정 컴포넌트가 실제로 같이 묶을 파일이 쌓이기
시작하면 그때 그 컴포넌트만 폴더로 승격시킨다 — 미리 다 쪼개두지 않는다.

## 라우트

이동 가능한 경로는 전부 `src/lib/routes.ts`의 `ROUTES` 객체를 거친다 —
`href`나 `router.push()`에 경로 문자열을 하드코딩하지 않는다. `ROUTES`는
`src/app`의 라우트 트리를 1:1로 미러링하므로, 페이지를 추가하면 같은
변경 안에서 여기도 같이 추가한다.

## Orval 생성 API 레이어

`src/api/{domain}/{api,types}/`는 백엔드 OpenAPI 스펙으로부터
`pnpm api:generate`(`orval.config.ts` + `scripts/restructure-api.ts`)가
생성한다 — 생성된 파일마다 "Do not edit manually" 표시가 있고, 다음
재생성 때 그대로 덮어써진다. 생성 결과가 이상해 보이면 `scripts/restructure-api.ts`나
스펙 쪽을 고치는 것이지, 산출물을 손으로 고치는 게 아니다. `orval.config.ts`의
`client`는 `"fetch"`로 설정돼 있어 orval은 react-query 훅을 생성하지 않고
fetch 함수와 URL 헬퍼만 만든다.

`src/api/{domain}/hooks/`는 생성되지 않는다 — 그 도메인의 `api/`, `types/`가
생성된 뒤, 그걸 감싸는 `useQuery`/`useMutation` 훅을 손으로 작성한다. 공용
`SecondParameter`/`withQueryKey` 헬퍼는 `src/api/common/query-helpers.ts`에
손으로 유지되며, 새 훅을 작성할 때 참고용으로 기존 `hooks/*.ts` 파일들의
패턴(쿼리 키 함수, `useQuery`/`useMutation` 옵션 빌더)을 따른다.

- `api/{op}.ts` — 실제 fetch 호출 (`orvalApiClient`, ky 기반). react-query가
  필요 없는 곳(이벤트 핸들러 등, 훅을 못 쓰는 위치)에서는 직접 호출해도 됨
  — OAuth 콜백 뷰들이 `postLogin`을 이렇게 쓰고 있음.
- `hooks/{op}.ts` — `api/` 함수를 감싼 `useQuery`/`useMutation` 래퍼. 손으로
  작성. 로딩/에러 상태나 캐시 무효화가 필요한 컴포넌트에서 사용.
- `types/` — 순수 `Request`/`Response` 타입 alias, 로직 없음. 2개 이상
  도메인이 같이 쓰는 타입은 `src/api/common/types/`로 자동 승격됨.

`features/*/data.ts` 목업 데이터를 아직 쓰고 있는 feature라면, 새로 fetch
로직을 짜기 전에 `src/api/`에 대응되는 훅이 이미 있는지부터 확인할 것 —
`api/`, `types/`는 생성만 되고 아직 훅이 없는 도메인도 있다.

## 컴포넌트

```tsx
// 함수 선언 + named export — React.FC도, const 화살표 함수도 아님
export function DebateCard({ room, onJoin, onRequireLogin }: DebateCardProps) {
  return <div>...</div>;
}
```

- **named export + `function` 선언.** `React.FC` 아님, `export default`
  아님. 유일한 예외는 Next.js 라우트 파일(`page.tsx`, `layout.tsx`,
  `route.ts`)인데, 이건 프레임워크 자체가 default export를 요구하기 때문
  — 그 외 모든 파일은 named export만 사용.
- **props 타입은 `interface {ComponentName}Props`, 컴포넌트 바로 위에
  선언.** `interface Props`처럼 줄여쓰지 않는다. `union`/`intersection`이
  진짜로 필요할 때만 `interface` 대신 `type` 사용 (예:
  `components/ui/button.tsx`의 `ButtonProps`는 `href` 유무로 갈리는
  discriminated union이라 `type`).
- `"use client"`는 실제로 필요한 파일(이벤트 핸들러, 훅, 브라우저 API
  사용)에만 붙인다 — feature 폴더 전체에 습관적으로 다 붙이지 않는다.

## TypeScript

- 확장/구현되는 객체 형태(주로 props)는 `interface`. 그 외 전부 `type` —
  union, primitive, 파생 타입 (`type ListFilter = "전체" | CategorySlug`,
  `type Side = "pro" | "con"`).
- `any` 지양. 지금 코드베이스에 사실상 안 쓰이고 있으니 계속 그 상태를
  유지할 것 — `any`가 필요해 보인다면 대부분 실제 타입이 이미 어딘가에
  있다.
- 백엔드가 이미 정의한 타입을 손으로 다시 만들지 않는다 — 먼저
  `src/api/{domain}/types/`부터 확인 (위 "Orval 생성 API 레이어" 참고).

## 스타일링 (Tailwind, CSS-in-JS 아님)

이 프로젝트는 JSX 안에 Tailwind 유틸리티 클래스를 직접 쓴다 —
Emotion/styled-components도 없고, 컴포넌트마다 별도 `.styles.ts` 파일도
없다.

- 디자인 토큰(`src/tokens/*.css`)은 Tailwind v4의 CSS 변수 문법으로 참조:
  `bg-(--bg-card)`, `text-(--text-2)`, `border-(--border-1)` — `bg-[#fefefe]`
  같은 식으로 쓰지 않는다. 테마와 관련되거나 재사용되는 색상은 원시 hex
  값보다 토큰을 우선한다.
- 조건부/병합 className은 `cn()`(`src/lib/utils.ts`, clsx + tailwind-merge)
  사용 — 템플릿 문자열로 클래스를 직접 이어붙이지 않는다.
- 테마 토큰 체계에 속하지 않고 재사용도 안 될 단발성 색상(예: 빈 좌석
  placeholder 원의 테두리/텍스트 색)은 인라인 `style={{ ... }}` hex 값으로
  써도 된다 — 실제로 몇 군데 이렇게 쓰고 있음 (`debate-card.tsx`의 빈 좌석
  상태). 딱 한 번 쓰는 색을 위해 새 CSS 변수를 만들지 않는다.

## 데이터 페칭

- 컴포넌트에서는 손으로 작성한 `hooks/{op}.ts`를 쓰고, 원본
  `api/{op}.ts` 함수는 컴포넌트 밖(훅을 못 쓰는 이벤트 핸들러 등)에서만
  사용 — 위 "Orval 생성 API 레이어" 참고.
- 실제로 추가할 로직이 있는 게 아니라면 `useQuery`/`useMutation` 결과를
  또 다른 커스텀 훅으로 감싸지 않는다 — `hooks/{op}.ts`를 컴포넌트에서
  바로 호출한다.
- 이 코드베이스 어디에도(`features/`, `components/`, `lib/`) `index.ts`
  배럴 파일이 없다 — 파일에서 바로 import한다
  (`@/features/debates/debate-card`, re-export하는 `index.ts` 아님).
  새로 만들지 않는다.

## 주석

기본은 주석 없음 — 이름을 잘 지으면 "무엇을 하는지"는 코드 자체로
드러난다. 코드만으로는 알 수 없는 걸 담을 때만 쓴다:

- 비직관적인 제약이나 우회 방법 (`api-client.ts`의 reissue 클라이언트를
  별도 `ky` 인스턴스로 분리한 이유 설명)
- 미래에 누군가 실수로 깨뜨리기 쉬운 불변조건 (`auth-store.ts`의
  `skipHydration` + 수동 `rehydrate()`가 왜 중요한지 설명)

컴포넌트/함수마다 기본으로 doc-comment 헤더를 다는 건 하지 않는다.

## 툴링 & 명령어

```bash
pnpm dev            # 개발 서버 실행
pnpm build           # 프로덕션 빌드
pnpm lint            # biome check
pnpm lint:fix        # biome check --write
pnpm format          # biome format --write
pnpm api:generate    # OpenAPI 스펙으로 src/api/ 재생성
                     # (.env.local에 ORVAL_OPENAPI_URL 필요, 또는 ./openapi.json)
npx tsc --noEmit     # 타입체크 (아직 전용 package.json 스크립트는 없음)
```

- **린트/포맷은 Biome** — ESLint + Prettier 아님. `biome.json`이 둘 다
  커버하고, `assist.organizeImports`가 포맷할 때 import를 자동 정렬한다.
  import 순서를 손으로 맞추거나 자동 정렬과 싸우지 않는다.
- **husky pre-commit**이 `lint-staged` → `biome check --write`를 staged
  파일에 자동 실행한다. 커밋 직후 이상한 git 상태 에러가 나면, 작업이
  날아갔다고 바로 단정하기 전에 `git status`/`.git/MERGE_HEAD`부터 확인할
  것 — 이 훅 자체의 stash/restore 과정이 원인일 수 있다.
- 이 프로젝트엔 아직 테스트 러너가 설정돼 있지 않다.

## Git & 커밋

Conventional Commits 스타일 접두사 + 한국어 설명, 기존 히스토리 그대로:
`feat:`, `fix:`, `refactor:`, `chore:` (예: `feat: 구글 로그인 연동`,
`refactor: css 리팩터링`). commit-msg 훅으로 강제되고 있진 않지만, 일관성을
위해 `git log`에 이미 있는 패턴을 따를 것.

## 하지 말 것

- `href`/`router.push()`에 경로 문자열 하드코딩 — `ROUTES` 쓸 것.
- `src/api/{domain}/{api,types}/` 밑을 손으로 작성/수정 —
  `scripts/restructure-api.ts`나 스펙을 고칠 것. `hooks/`는 손으로
  작성하는 게 맞음.
- 컴포넌트 하나당 폴더 하나 구조나 `index.ts` 배럴 만들기.
- PascalCase 파일명 — 항상 kebab-case.
- Next.js 라우트 파일 외에 `React.FC`나 `export default` 쓰기.
- props 타입을 `interface Props`로 줄여쓰기.
- Emotion/styled-components/CSS Modules 쓰기 — Tailwind +
  `src/tokens/*.css`만.
- 대응되는 `src/api/{domain}/hooks/`가 이미 있는지 확인 안 하고
  `features/*/data.ts`에 목업 데이터 추가하기.
- `console.log` 쓰기 — `console.warn`/`console.error`는 실제 경고/에러
  상황이면 괜찮음 (지금도 딱 그런 몇 곳에서만 쓰이고 있음).
