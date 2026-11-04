/* ═══════════════════════════════════════════════════════════════
   washController: lets anything on the page ask for the wash.

   The curtain itself lives in <WashTransition>, mounted once in the
   layout. Rather than thread a context through every section that
   might link somewhere, the curtain registers its go() here on
   mount and anything can call washTo().

   If no curtain is mounted, or it is already busy, the swap still
   happens; it just happens without the curtain. Navigation must
   never depend on an animation having run.
   ═══════════════════════════════════════════════════════════ */

type Go = (swap: () => void) => Promise<void>;

let impl: Go | null = null;

export function registerWash(fn: Go | null) {
  impl = fn;
}

/** Run `swap` behind the wash, or immediately if there is no curtain. */
export function washTo(swap: () => void): Promise<void> {
  if (impl) return impl(swap);
  swap();
  return Promise.resolve();
}
