import * as React from "react";

interface Props extends Omit<React.ComponentProps<"input">, "size"> {
  label?: string;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

export default function Input({
  type = "text",
  name,
  label,
  variant = "light",
  readOnly = false,
  size = "md",
  ...props
}: Props) {
  const baseClasses = `w-full rounded-md text-sm outline-0 focus:ring-2 transition ${readOnly ? "cursor-not-allowed opacity-70" : ""}`;
  const variants = {
    light:
      "bg-pattern-100 focus:ring-blue-500 placeholder-pattern-300 border border-pattern-200",
    dark: "bg-medium text-white border border-pattern-800 focus:ring-pattern-800 placeholder-pattern-300",
  };
  const inputSize = {
    sm: "text-sm py-1 px-2",
    md: "text-base py-2 px-3",
    lg: "text-lg py-3 px-4",
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
        readOnly={readOnly}
        className={`${baseClasses} ${variants[variant]} ${inputSize[size]}`}
        {...props}
      />
    </div>
  );
}
