"use client";

import { Bell, House, ThumbsUp, Vote } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

const NAV_LINKS = [
  { href: "/", label: "홈", icon: House },
  { href: "/votes", label: "투표", icon: ThumbsUp },
  { href: "/debates", label: "토론", icon: Vote },
] as const;

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-[var(--bg-surface)] border-b border-[var(--border-1)] sticky top-0 z-10">
      <div className="max-w-[1180px] mx-auto h-16 flex items-center gap-9 px-4">
        <Link href="/" className="block h-[42px] w-[132px] relative shrink-0">
          <Image
            src="/assets/logo-nav-light.png"
            alt="투닭"
            fill
            className="object-contain object-left dark:hidden"
          />
          <Image
            src="/assets/logo-nav-dark.png"
            alt="투닭"
            fill
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
                  "flex items-center gap-[7px] px-3.5 text-[15px] box-border border-b-[3px]",
                  active
                    ? "font-bold text-[var(--text-1)] border-[var(--brand-yellow)]"
                    : "font-semibold text-[var(--text-label)] border-transparent",
                )}
              >
                <Icon size={17} strokeWidth={active ? 2.4 : 2.2} />
                {label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-[18px]">
          <ThemeToggle />
          <div className="relative w-6 h-6 text-[var(--text-1)]">
            <Bell size={22} strokeWidth={2} />
            <span className="absolute -top-px -right-px w-2 h-2 rounded-full bg-[var(--live-dot)] border-2 border-[var(--bg-surface)]" />
          </div>
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
