import React from "react";

export default function Card({
  children,
  className,
}: React.ComponentProps<"div">) {
  return (
    <div
      className={[
        "bg-background border-pattern-200 w-full min-w-56 rounded-xl border p-6",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
