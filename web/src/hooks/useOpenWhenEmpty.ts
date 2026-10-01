import { useState } from "react";

/**
 * Opens once, on the first render where we know the list is empty.
 * Later toggles stick, including after the list gains its first item.
 * `empty` stays undefined while the list is still loading.
 */
export function useOpenWhenEmpty(empty: boolean | undefined) {
  const [open, setOpen] = useState(false);
  const [primed, setPrimed] = useState(false);
  if (!primed && empty !== undefined) {
    setPrimed(true);
    if (empty) setOpen(true);
  }
  return [open, () => setOpen((value) => !value)] as const;
}
