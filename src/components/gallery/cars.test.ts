import { describe, expect, it, vi } from 'vitest';
import { FLEET, carSVG, rng, type CarOptions } from './cars';

/* The gallery renders these on the server and again on the client, so
   two separate runs of the same input have to agree down to the byte.
   Every car is also on the page at once, twice over, because a
   before/after pair is one car in both states: the ids inside one SVG
   are in the same document as the ids inside all the others. */

/** every id this SVG defines */
function idsIn(svg: string) {
  return [...svg.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
}

/** every id this SVG points at with url(#...) */
function refsIn(svg: string) {
  return [...svg.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]);
}

/** the twelve SVGs the gallery actually puts on the page */
function wholeFleet() {
  return FLEET.flatMap((car) => {
    const base: CarOptions = { type: car.type, paint: car.paint, seed: car.seed };
    return [
      { car, dirty: true, svg: carSVG({ ...base, dirty: true }) },
      { car, dirty: false, svg: carSVG({ ...base, dirty: false }) },
    ];
  });
}

describe('carSVG, run twice', () => {
  it('gives byte-identical markup for the same seed and options', () => {
    for (const { car } of wholeFleet()) {
      const opts: CarOptions = { type: car.type, paint: car.paint, seed: car.seed, dirty: true };

      expect(carSVG(opts)).toBe(carSVG(opts));
    }
  });

  it('gives byte-identical markup with no options at all', () => {
    expect(carSVG()).toBe(carSVG());
    expect(carSVG({})).toBe(carSVG());
  });

  it('does not drift when the same car is asked for many times over', () => {
    const opts: CarOptions = { type: 'suv', seed: 37, dirty: true };
    const first = carSVG(opts);

    for (let i = 0; i < 20; i++) expect(carSVG(opts)).toBe(first);
  });

  /* A second evaluation of the module is the closest this can get to
     the server process and the browser being two different runs. It
     catches anything decided once at import time out of something
     that varies per run, which would survive the repeat-call tests
     above and still mismatch on hydration. */
  it('gives the same markup from a freshly evaluated module', async () => {
    const before = wholeFleet().map((entry) => entry.svg);

    vi.resetModules();
    const fresh = await import('./cars');
    const after = fresh.FLEET.flatMap((car) => [
      fresh.carSVG({ type: car.type, paint: car.paint, seed: car.seed, dirty: true }),
      fresh.carSVG({ type: car.type, paint: car.paint, seed: car.seed, dirty: false }),
    ]);

    expect(after).toEqual(before);
  });

  it('is not simply ignoring the seed', () => {
    const a = carSVG({ type: 'coupe', seed: 11, dirty: true });
    const b = carSVG({ type: 'coupe', seed: 12, dirty: true });

    expect(a).not.toBe(b);
  });
});

describe('the ids inside the fleet', () => {
  it('are unique across every car on the page, in both states', () => {
    const all = wholeFleet().flatMap((entry) => idsIn(entry.svg));
    const duplicates = all.filter((id, i) => all.indexOf(id) !== i);

    expect(all.length).toBeGreaterThan(0);
    expect(duplicates).toEqual([]);
  });

  it('differ between the before and the after of one car', () => {
    const car = FLEET[0];
    const dirty = idsIn(carSVG({ type: car.type, seed: car.seed, dirty: true }));
    const clean = idsIn(carSVG({ type: car.type, seed: car.seed, dirty: false }));

    expect(dirty).not.toHaveLength(0);
    expect(dirty.filter((id) => clean.includes(id))).toEqual([]);
  });

  it('differ between two cars of the same body type', () => {
    const coupes = FLEET.filter((c) => c.type === 'coupe');
    expect(coupes.length).toBeGreaterThan(1);

    const first = idsIn(carSVG({ type: 'coupe', seed: coupes[0].seed, dirty: true }));
    const second = idsIn(carSVG({ type: 'coupe', seed: coupes[1].seed, dirty: true }));

    expect(first.filter((id) => second.includes(id))).toEqual([]);
  });

  /* Unique ids are only half of it: they have to be the ones the car
     points at. A car referring to an id defined by a different car
     still renders, which is exactly why it would go unnoticed. */
  it('cover every url(#...) the same car refers to', () => {
    for (const { car, dirty, svg } of wholeFleet()) {
      const defined = new Set(idsIn(svg));
      const dangling = refsIn(svg).filter((ref) => !defined.has(ref));

      expect({ id: car.id, dirty, dangling }).toEqual({ id: car.id, dirty, dangling: [] });
    }
  });
});

describe('the markup itself', () => {
  it('parses as a single SVG element', () => {
    for (const { car, svg } of wholeFleet()) {
      const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');

      expect(doc.querySelector('parsererror'), car.id).toBeNull();
      expect(doc.documentElement.tagName).toBe('svg');
    }
  });

  it('labels the dirty car as before and the clean one as after', () => {
    expect(carSVG({ dirty: true })).toContain('Vehicle before detailing');
    expect(carSVG({ dirty: false })).toContain('Vehicle after detailing');
  });

  /* The geometry falls back, the id does not: the unrecognised string
     stays in the uid, so the two still differ by their ids. That is
     harmless here, since unique is all the ids have to be, but it is
     why this compares the markup with the ids taken out. */
  it('falls back to the coupe for a body type it does not know', () => {
    const withoutIds = (svg: string) =>
      svg.replace(/(id="|url\(#)[^")]+/g, '$1X').replace(/aria-label="[^"]*"/, '');

    const unknown = carSVG({ type: 'hovercraft' as never, seed: 5 });

    expect(withoutIds(unknown)).toBe(withoutIds(carSVG({ type: 'coupe', seed: 5 })));
    expect(idsIn(unknown).every((id) => !idsIn(carSVG({ type: 'coupe', seed: 5 })).includes(id))).toBe(true);
  });

  it('paints the body in the colour it was given', () => {
    expect(carSVG({ paint: '#abcdef', seed: 3 })).toContain('#abcdef');
  });
});

describe('rng', () => {
  it('replays the same sequence for the same seed', () => {
    const a = rng(42);
    const b = rng(42);

    expect(Array.from({ length: 50 }, a)).toEqual(Array.from({ length: 50 }, b));
  });

  it('gives a different sequence for a different seed', () => {
    const a = Array.from({ length: 50 }, rng(42));
    const b = Array.from({ length: 50 }, rng(43));

    expect(a).not.toEqual(b);
  });

  it('stays inside 0 and 1', () => {
    const r = rng(7);

    for (let i = 0; i < 500; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});
