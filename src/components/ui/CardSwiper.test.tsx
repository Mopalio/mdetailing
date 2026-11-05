import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { CardSwiper, SWIPE_BREAKPOINT } from './CardSwiper';

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

/* jsdom has no PointerEvent, and the swiper reads pointerType to stay
   out of the way of touch, so the property is attached by hand. */
function pointer(el: Element, type: string, x: number) {
  const e = new MouseEvent(type, { clientX: x, bubbles: true });
  Object.defineProperty(e, 'pointerType', { value: 'mouse' });
  el.dispatchEvent(e);
}

function row(strip: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: strip,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));

  const onOpen = vi.fn();
  const { container } = render(
    <CardSwiper label="Before and after examples">
      <button type="button" onClick={onOpen}>
        Open the car
      </button>
    </CardSwiper>
  );

  return {
    scroller: container.querySelector('.swipe') as HTMLElement,
    card: screen.getByRole('button', { name: 'Open the car' }),
    onOpen,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('a drag across a card', () => {
  it('does not open it where the row is a strip', () => {
    const { card, onOpen } = row(true);

    pointer(card, 'pointerdown', 260);
    pointer(card, 'pointermove', 200);
    pointer(card, 'pointerup', 200);
    fireEvent.click(card);

    expect(onOpen).not.toHaveBeenCalled();
  });

  it('does not open it where the row is a grid', () => {
    const { card, onOpen } = row(false);

    pointer(card, 'pointerdown', 260);
    pointer(card, 'pointermove', 200);
    pointer(card, 'pointerup', 200);
    fireEvent.click(card);

    expect(onOpen).not.toHaveBeenCalled();
  });
});

describe('a click on a card', () => {
  it('opens it where the row is a strip', () => {
    const { card, onOpen } = row(true);

    pointer(card, 'pointerdown', 260);
    pointer(card, 'pointerup', 260);
    fireEvent.click(card);

    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('opens it where the row is a grid', () => {
    const { card, onOpen } = row(false);

    pointer(card, 'pointerdown', 260);
    pointer(card, 'pointerup', 260);
    fireEvent.click(card);

    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});

describe('the drag itself', () => {
  it('moves the strip', () => {
    const { scroller, card } = row(true);

    pointer(card, 'pointerdown', 260);
    pointer(card, 'pointermove', 200);

    expect(scroller.classList.contains('is-drag')).toBe(true);
  });

  it('leaves the grid alone', () => {
    const { scroller, card } = row(false);

    pointer(card, 'pointerdown', 260);
    pointer(card, 'pointermove', 200);

    expect(scroller.classList.contains('is-drag')).toBe(false);
  });
});
