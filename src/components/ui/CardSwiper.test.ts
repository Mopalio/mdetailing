import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { SWIPE_BREAKPOINT } from './CardSwiper';

/* CardSwiper decides in script where the cards stop fitting, and wash.css
   decides the same thing again in a media query. Two places holding one
   number drift silently: the row becomes a grid at one width and starts
   behaving like a strip at another, and nothing errors. This asserts they
   are still the same number.

   The derivation is in CardSwiper.tsx and is deliberately not asserted
   here, because as written it comes to 968 rather than 976. Pinning the
   wrong arithmetic would be worse than pinning nothing. */
describe('the swipe breakpoint', () => {
  /* vitest runs from the project root, and its transform does not leave
     import.meta.url as a file: URL, so resolve from cwd instead. */
  const css = readFileSync(
    path.resolve(process.cwd(), 'src/app/wash.css'),
    'utf-8'
  );

  it('matches the media query in wash.css', () => {
    const widths = [...css.matchAll(/@media\s*\(min-width:\s*(\d+)px\)/g)].map(
      (m) => Number(m[1])
    );

    expect(widths).toContain(SWIPE_BREAKPOINT);
  });
});
