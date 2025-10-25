"use client";
import { useEffect } from "react";
import { supabaseBrowser } from "@/utils/supabase/client";

export default function SupabaseListener() {
  useEffect(() => {
    const supabase = supabaseBrowser();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  return null;
}
