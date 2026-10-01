import { useState } from "react";

/**
 * Opens once, on the first render where we know the list is empty.
 * Later toggles stick. Call `close` after a successful create so the
 * list gets the page back. `empty` stays undefined while the list is loading.
 */
export function useOpenWhenEmpty(empty: boolean | undefined) {
  const [open, setOpen] = useState(false);
  const [primed, setPrimed] = useState(false);
  if (!primed && empty !== undefined) {
    setPrimed(true);
    if (empty) setOpen(true);
  }
  return [
    open,
    () => setOpen((value) => !value),
    () => setOpen(false),
  ] as const;
}
