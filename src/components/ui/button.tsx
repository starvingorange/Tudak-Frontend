import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";

const variantClasses = {
  // hover:text-* pins the color: without it, the global `a:hover` rule in
  // tokens/layout.css (higher specificity than a plain text-* class on the
  // same <a>) would repaint it brand-yellow on hover.
  primary:
    "bg-(--brand-yellow) text-(--brand-on-yellow) hover:brightness-105 hover:text-(--brand-on-yellow)",
  // Outline text is #333 in light theme, #ffc227 in dark — handled via --btn-outline-fg.
  outline:
    "bg-transparent text-(--btn-outline-fg) border-[1.5px] border-(--brand-yellow) hover:bg-(--brand-yellow) hover:text-(--brand-on-yellow)",
} as const;

const sizeClasses = {
  md: "text-[15px] px-6 py-3 rounded-(--radius-button) gap-2.25",
  sm: "text-[13px] px-5 py-2.25 rounded-(--radius-button-sm) gap-1.75",
} as const;

type ButtonVariant = keyof typeof variantClasses;
type ButtonSize = keyof typeof sizeClasses;

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

type ButtonProps = BaseButtonProps &
  (
    | ({ href: string } & Omit<
        AnchorHTMLAttributes<HTMLAnchorElement>,
        "className" | "children"
      >)
    | ({ href?: undefined } & Omit<
        ButtonHTMLAttributes<HTMLButtonElement>,
        "className" | "children"
      >)
  );

/** Shared CTA button. Pass `href` for a link, or `onClick` (no `href`) for
 * an action button — e.g. one that opens a modal instead of navigating. */
export function Button({
  variant = "primary",
  size = "md",
  icon,
  children,
  className,
  ...rest
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center font-sans font-extrabold no-underline transition-colors box-border cursor-pointer",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

  if (rest.href) {
    const { href, ...linkRest } = rest as {
      href: string;
    } & AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {icon}
        {children}
      </Link>
    );
  }

  const { href: _href, ...buttonRest } = rest as {
    href?: undefined;
  } & ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type="button" className={classes} {...buttonRest}>
      {icon}
      {children}
    </button>
  );
}
