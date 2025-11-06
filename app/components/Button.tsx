export default function Button({
  children,
  className,
  type,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type={type || "button"}
      className={[
        "hover:bg-primary/90 cursor-pointer! rounded-md bg-blue-700 px-4 py-2 text-sm font-bold text-white transition-colors disabled:pointer-events-none disabled:opacity-80",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
