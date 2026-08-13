"use client";

import { House, MessageCircle, Vote } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { useIsLoggedIn } from "@/stores/auth-store";
import { NotificationBell } from "./notification-bell";

const NAV_LINKS = [
  { href: ROUTES.HOME(), label: "홈", icon: House },
  { href: ROUTES.VOTES(), label: "투표", icon: Vote },
  { href: ROUTES.DEBATES(), label: "토론", icon: MessageCircle },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  // The auth store starts `accessToken: null` (matching SSR) and only
  // updates after AuthProvider's rehydrate() runs, so this never mismatches.
  const loggedIn = useIsLoggedIn();

  return (
    <nav className="bg-(--bg-surface) border-b border-(--border-1) sticky top-0 z-10">
      <div className="mx-auto flex h-16 max-w-295 items-center gap-3 px-3 sm:gap-9 sm:px-4">
        <Link
          href={ROUTES.HOME()}
          className="relative block h-8.5 w-26 shrink-0 sm:h-10.5 sm:w-33"
        >
          <Image
            src="/assets/logo-nav-light.png"
            alt="투닭"
            fill
            sizes="(max-width: 639px) 104px, 132px"
            className="object-contain object-left dark:hidden"
          />
          <Image
            src="/assets/logo-nav-dark.png"
            alt="투닭"
            fill
            sizes="(max-width: 639px) 104px, 132px"
            className="object-contain object-left hidden dark:block"
          />
        </Link>
        <div className="flex h-16 min-w-0 flex-1 items-stretch gap-0.5 sm:gap-2">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex min-w-0 items-center gap-1 px-1.5 text-[13px] box-border border-b-[3px] sm:gap-1.75 sm:px-3.5 sm:text-[15px]",
                  active
                    ? "font-bold text-(--text-1) border-(--brand-yellow)"
                    : "font-semibold text-(--text-label) border-transparent",
                )}
              >
                <Icon
                  size={15}
                  strokeWidth={active ? 2.4 : 2.2}
                  className="shrink-0 sm:size-4.25"
                />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4.5">
          {/* 추후 다크 모드 필요시 활성화 */}
          {/* <ThemeToggle /> */}
          <NotificationBell />
          {loggedIn ? (
            <Link href={ROUTES.MY_PAGE()} className="block shrink-0">
              <Image
                src="/assets/avatar.png"
                alt="프로필"
                width={40}
                height={40}
                sizes="(max-width: 639px) 32px, 40px"
                className="block rounded-full size-8 sm:size-10"
              />
            </Link>
          ) : (
            <Button
              size="sm"
              onClick={() => router.push(ROUTES.LOGIN())}
              className="shrink-0"
            >
              로그인
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
