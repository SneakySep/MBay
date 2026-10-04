"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

/**
 * Shared filter behavior: every control writes one query param and resets
 * paging, so filter state lives entirely in the URL (SSR-friendly, shareable).
 */
export function useFilterParam(param: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const value = searchParams.get(param) ?? "";

  const setValue = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set(param, next);
    else params.delete(param);
    params.delete("page"); // server always renders page 1 on filter change
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return { value, setValue, isPending };
}
