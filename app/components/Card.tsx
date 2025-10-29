import React from "react";

export default function Card({
  children,
  className,
}: React.ComponentProps<"div">) {
  return (
    <div
      className={[
        "bg-background w-full rounded-xl border border-gray-300 p-6",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
