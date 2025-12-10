"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      richColors
      position="bottom-right"
      toastOptions={{
        className:
          "rounded-xl border border-neutral-200 bg-white text-neutral-900 shadow-lg",
      }}
    />
  );
}
