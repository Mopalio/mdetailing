import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { WASH_BOOT_SCRIPT, WASH_SEEN_CLASS, WASH_SESSION_KEY } from './session';

/* The curtain is sent by the server already covering the screen, so
   everything here is about what happens to it when React is not the
   thing that lifts it: a reader who has already seen the intro, and a
   bundle that never arrives at all. */

const read = (p: string) => readFileSync(path.resolve(process.cwd(), p), 'utf-8');

const css = read('src/app/wash.css');

const boot = () => new Function(WASH_BOOT_SCRIPT)();

/* the @media blocks for one at-rule, brace matched, so a test about
   what is inside them cannot accidentally read the rest of the file */
function atRule(marker: string) {
  const out: string[] = [];
  let at = css.indexOf(marker);
  while (at !== -1) {
    const start = css.indexOf('{', at);
    let depth = 0;
    let i = start;
    for (; i < css.length; i++) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}' && --depth === 0) break;
    }
    out.push(css.slice(start, i + 1));
    at = css.indexOf(marker, i);
  }
  return out.join('\n');
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.classList.remove(WASH_SEEN_CLASS);
  sessionStorage.clear();
});

describe('the boot script', () => {
  it('marks the document when the intro has already played this session', () => {
    sessionStorage.setItem(WASH_SESSION_KEY, '1');

    boot();

    expect(document.documentElement.classList.contains(WASH_SEEN_CLASS)).toBe(true);
  });

  it('leaves a first visit alone', () => {
    boot();

    expect(document.documentElement.classList.contains(WASH_SEEN_CLASS)).toBe(false);
  });

  it('does not throw where storage is blocked', () => {
    vi.stubGlobal('sessionStorage', {
      getItem() {
        throw new Error('access denied');
      },
    });

    expect(() => boot()).not.toThrow();
    expect(document.documentElement.classList.contains(WASH_SEEN_CLASS)).toBe(false);
  });

  it('is still wired into the layout ahead of the curtain', () => {
    const layout = read('src/app/layout.tsx');
    const script = layout.indexOf('__html: WASH_BOOT_SCRIPT');
    const curtain = layout.indexOf('<WashTransition');

    expect(script).toBeGreaterThan(-1);
    expect(curtain).toBeGreaterThan(-1);
    expect(script).toBeLessThan(curtain);
  });
});

describe('the stylesheet', () => {
  it('keeps the intro curtain down for a reader who has already seen it', () => {
    const rule = css.match(/\.wash-seen \.wash\.is-intro \{([^}]*)\}/);

    expect(rule).not.toBeNull();
    expect(rule![1]).toContain('visibility: hidden');
    expect(rule![1]).toContain('pointer-events: none');
  });

  it('names the class the boot script actually sets', () => {
    expect(css).toContain('.' + WASH_SEEN_CLASS + ' ');
  });

  it('lifts the intro curtain later than the component would give up on it', () => {
    const rule = css.match(/^\.wash\.is-intro \{([^}]*)\}/m);
    expect(rule).not.toBeNull();

    const delay = rule![1].match(/(\d+(?:\.\d+)?)s forwards/);
    expect(delay).not.toBeNull();
    const failsafeMs = Number(delay![1]) * 1000;

    const transition = read('src/components/wash/WashTransition.tsx');
    const watchdogs = [...transition.matchAll(/arm\((\d+)\)/g)].map((m) => Number(m[1]));
    expect(watchdogs.length).toBeGreaterThan(0);

    expect(failsafeMs).toBeGreaterThan(Math.max(...watchdogs));
  });

  it('is not switched off for a reader who asked for less motion', () => {
    const reduced = atRule('@media (prefers-reduced-motion: reduce)');
    expect(reduced).toContain('.wash__foam');

    expect(reduced).not.toContain('washFailsafe');
    expect(reduced).not.toMatch(/(^|[,{}\s])\.wash(\.is-intro)?\s*[,{]/m);
  });
});
