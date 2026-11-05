import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { WashTransition } from './WashTransition';
import { washTo } from './washController';

/* Only the parts that are decisions rather than animation: what the
   server sends on first paint, and which clicks the curtain takes
   over. The tests run under prefers-reduced-motion, which is a mode
   the component supports rather than a stand-in for one. It is also
   the mode where the rule that matters most is easiest to state: with
   no animation at all, the reader still has to end up where they
   clicked. */

/* Dispatch a click and report whether the curtain claimed it. The
   trailing listener runs after the component's, so it reads the
   verdict and then stops jsdom trying to follow the link for real on
   the cases the curtain is supposed to leave alone. */
function click(el: Element, init: MouseEventInit = {}) {
  let intercepted = false;
  const trailing = (e: Event) => {
    intercepted = e.defaultPrevented;
    e.preventDefault();
  };
  document.addEventListener('click', trailing);
  el.dispatchEvent(
    new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init })
  );
  document.removeEventListener('click', trailing);
  return { intercepted };
}

function page() {
  document.body.insertAdjacentHTML(
    'beforeend',
    `<main>
       <a id="to-pricing" href="#pricing">View pricing</a>
       <a id="to-nowhere" href="#does-not-exist">Nowhere</a>
       <a id="to-top" href="#">Top</a>
       <a id="to-site" href="/terms">Terms</a>
       <a id="to-new-tab" href="#pricing" target="_blank">New tab</a>
       <a id="to-download" href="#pricing" download>Download</a>
       <a id="to-pricing-deep" href="#pricing"><span id="inner">Deep</span></a>
       <section id="pricing">Pricing</section>
     </main>`
  );
  return (id: string) => document.getElementById(id) as HTMLElement;
}

let scrollIntoView: ReturnType<typeof vi.fn>;

beforeEach(() => {
  scrollIntoView = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView;
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
  sessionStorage.clear();
  history.replaceState(null, '', '/');
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('the curtain markup', () => {
  it('is already covering the screen before any script runs', () => {
    const html = renderToStaticMarkup(<WashTransition />);

    expect(html).toContain('--cover:100%');
  });

  it('carries a noscript escape hatch, so it cannot trap a reader without JavaScript', () => {
    const html = renderToStaticMarkup(<WashTransition />);

    expect(html).toContain('<noscript>');
    expect(html).toContain('.wash{display:none!important}');
  });

  it('is hidden from assistive technology', () => {
    const { container } = render(<WashTransition />);

    expect(container.querySelector('.wash')).toHaveAttribute('aria-hidden', 'true');
  });

  /* The server sends this markup and the browser has to produce the
     same thing on its first render, or React throws the whole tree
     away and rebuilds it. Evaluating the module a second time is the
     nearest a single process gets to being two of them. */
  it('lays the foam out identically in a second, independent evaluation', async () => {
    const first = renderToStaticMarkup(<WashTransition />);

    vi.resetModules();
    const fresh = await import('./WashTransition');
    const second = renderToStaticMarkup(<fresh.WashTransition />);

    expect(second).toBe(first);
    expect(first).toContain('--sway');
  });

  it('renders the same markup every time inside one evaluation', () => {
    expect(renderToStaticMarkup(<WashTransition />)).toBe(
      renderToStaticMarkup(<WashTransition />)
    );
  });
});

describe('which clicks the curtain takes over', () => {
  it('takes over an in-page link and moves the page to the target', () => {
    const el = page();
    render(<WashTransition />);

    expect(click(el('to-pricing')).intercepted).toBe(true);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.instances[0]).toBe(el('pricing'));
    expect(location.hash).toBe('#pricing');
  });

  it('takes over a click that lands on something inside the link', () => {
    const el = page();
    render(<WashTransition />);

    expect(click(el('inner')).intercepted).toBe(true);
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['meta', { metaKey: true }],
    ['ctrl', { ctrlKey: true }],
    ['shift', { shiftKey: true }],
    ['alt', { altKey: true }],
  ])('leaves a %s-click alone, so the browser can still open it its own way', (_name, init) => {
    const el = page();
    render(<WashTransition />);

    expect(click(el('to-pricing'), init).intercepted).toBe(false);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('leaves a middle click alone', () => {
    const el = page();
    render(<WashTransition />);

    expect(click(el('to-pricing'), { button: 1 }).intercepted).toBe(false);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it.each([
    ['a bare hash', 'to-top'],
    ['a target that is not on the page', 'to-nowhere'],
    ['a link to another page', 'to-site'],
    ['a link that opens a new tab', 'to-new-tab'],
    ['a download link', 'to-download'],
  ])('leaves %s alone', (_name, id) => {
    const el = page();
    render(<WashTransition />);

    expect(click(el(id)).intercepted).toBe(false);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('leaves a click alone that something else already handled', () => {
    const el = page();
    render(<WashTransition />);
    const link = el('to-pricing');
    link.addEventListener('click', (e) => e.preventDefault());

    click(link);

    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('stops taking clicks over once it unmounts', () => {
    const el = page();
    const view = render(<WashTransition />);

    view.unmount();

    expect(click(el('to-pricing')).intercepted).toBe(false);
    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});

describe('the curtain as a registered wash', () => {
  it('registers itself, so washTo goes through it', async () => {
    render(<WashTransition />);
    const swap = vi.fn();

    await washTo(swap);

    expect(swap).toHaveBeenCalledTimes(1);
  });

  /* The swap has to survive the curtain being torn down mid-flight,
     which is what unmounting during a wash amounts to. */
  it('leaves washTo working after it unmounts', async () => {
    const view = render(<WashTransition />);
    view.unmount();

    const swap = vi.fn();
    await washTo(swap);

    expect(swap).toHaveBeenCalledTimes(1);
  });
});
