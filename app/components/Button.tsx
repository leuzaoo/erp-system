import * as React from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "outline" | "danger";

interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: ButtonVariant;
}

export default function Button({
  children,
  className,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center cursor-pointer justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border border-transparent",
    outline: "border border-blue-600 text-blue-600 focus:ring-blue-500",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border border-transparent",
  };

  return (
    <button
      type={type}
      className={clsx(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
