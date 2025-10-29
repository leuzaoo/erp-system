import * as React from "react";

interface Props extends React.ComponentProps<"input"> {
  label?: string;
}

export default function Input({ type = "text", name, label, ...props }: Props) {
  return (
    <>
      {label && (
        <label
          className="mb-1 block text-left text-sm font-bold"
          htmlFor={name}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        name={name}
        className="mb-4 w-full rounded-md bg-gray-100 px-3 py-2 text-sm outline-0 focus:ring-2 focus:ring-blue-500"
        {...props}
      />
    </>
  );
}
