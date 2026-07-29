"use client";

import { House, MessageCircle, Vote } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./notification-bell";

const NAV_LINKS = [
  { href: "/", label: "홈", icon: House },
  { href: "/votes", label: "투표", icon: Vote },
  { href: "/debates", label: "토론", icon: MessageCircle },
] as const;

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-(--bg-surface) border-b border-(--border-1) sticky top-0 z-10">
      <div className="max-w-295 mx-auto h-16 flex items-center gap-9 px-4">
        <Link href="/" className="block h-10.5 w-33 relative shrink-0">
          <Image
            src="/assets/logo-nav-light.png"
            alt="투닭"
            fill
            sizes="132px"
            className="object-contain object-left dark:hidden"
          />
          <Image
            src="/assets/logo-nav-dark.png"
            alt="투닭"
            fill
            sizes="132px"
            className="object-contain object-left hidden dark:block"
          />
        </Link>
        <div className="flex items-stretch gap-2 h-16 flex-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.75 px-3.5 text-[15px] box-border border-b-[3px]",
                  active
                    ? "font-bold text-(--text-1) border-(--brand-yellow)"
                    : "font-semibold text-(--text-label) border-transparent",
                )}
              >
                <Icon size={17} strokeWidth={active ? 2.4 : 2.2} />
                {label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-4.5">
          {/* 추후 다크 모드 필요시 활성화 */}
          {/* <ThemeToggle /> */}
          <NotificationBell />
          <Image
            src="/assets/avatar.png"
            alt="프로필"
            width={40}
            height={40}
            className="rounded-full block"
          />
        </div>
      </div>
    </nav>
  );
}
