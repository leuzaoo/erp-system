import * as React from "react";

interface Props extends React.ComponentProps<"input"> {
  label?: string;
  variant?: "light" | "dark";
}

export default function Input({
  type = "text",
  name,
  label,
  variant = "light",
  ...props
}: Props) {
  const baseClasses =
    "w-full rounded-md px-3 py-2 text-sm outline-0 focus:ring-2 transition";
  const variants = {
    light: "bg-gray-100 text-gray-900 focus:ring-blue-500 placeholder-gray-500",
    dark: "bg-neutral-900 text-white border border-neutral-700 focus:ring-neutral-600 placeholder-neutral-400",
  };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={name}
          className={`mb-1 block text-left text-sm font-bold ${
            variant === "dark" ? "text-white" : "text-gray-700"
          }`}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        name={name}
        className={`${baseClasses} ${variants[variant]}`}
        {...props}
      />
    </div>
  );
}
