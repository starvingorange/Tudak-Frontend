import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const variantClasses = {
  // Outline text is #333 in light theme, #ffc227 in dark — handled via --btn-outline-fg.
  // hover:text-* pins the color: without it, the global `a:hover` rule in
  // tokens/layout.css (higher specificity than a plain text-* class on the
  // same <a>) would repaint it brand-yellow on hover.
  primary:
    "bg-[var(--brand-yellow)] text-[var(--brand-on-yellow)] text-[15px] px-6 py-3 rounded-[var(--radius-button)] hover:brightness-105 hover:text-[var(--brand-on-yellow)]",
  outline:
    "bg-transparent text-[var(--btn-outline-fg)] text-[13px] px-[22px] py-2 rounded-[var(--radius-button-sm)] border-[1.5px] border-[var(--brand-yellow)] hover:bg-[var(--brand-yellow)] hover:text-[var(--brand-on-yellow)]",
} as const;

interface ButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: keyof typeof variantClasses;
  icon?: ReactNode;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  icon,
  children,
  className,
  href = "#",
  ...rest
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.25 font-sans font-extrabold no-underline transition-colors box-border",
        variantClasses[variant],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </Link>
  );
}
