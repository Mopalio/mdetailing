import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mountWasher } from './washer';

/* mountWasher is framework-agnostic: it takes elements and returns a
   teardown, which is what makes it testable without a browser. jsdom
   gives us the elements but none of the three things it needs, so the
   harness below supplies them:

     - a 2D context, since jsdom has no canvas backend and getContext
       returns null (mountWasher then returns a no-op handle)
     - requestAnimationFrame as a queue we step by hand, because what
       is under test here is what survives a cancel, and that is a
       question about frames rather than about pixels
     - a clock, so the self-rinse can be run to completion

   Nothing in the washer itself is stubbed. The assertions are all on
   the progress numbers and the finish callback it reports through,
   never on what it drew. */

const FRAME_W = 460;
const FRAME_H = 320;

let clock = 0;
let nextFrameId = 1;
const queuedFrames = new Map<number, FrameRequestCallback>();

/** advance the clock and run every frame currently queued */
function flush(step = 16) {
  clock += step;
  const due = [...queuedFrames.values()];
  queuedFrames.clear();
  for (const cb of due) cb(clock);
}

function gradient() {
  return { addColorStop: () => {} } as unknown as CanvasGradient;
}

function fakeContext() {
  return {
    globalCompositeOperation: 'source-over',
    fillStyle: '' as unknown,
    filter: 'none',
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    createLinearGradient: vi.fn(gradient),
    createRadialGradient: vi.fn(gradient),
  };
}

function pointer(el: Element, type: string, x: number, y: number) {
  el.dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, bubbles: true }));
}

function mount() {
  const frame = document.createElement('div');
  const image = document.createElement('img');
  const canvas = document.createElement('canvas');
  frame.append(image, canvas);
  document.body.append(frame);

  const size = { w: FRAME_W, h: FRAME_H };
  Object.defineProperty(frame, 'offsetWidth', { configurable: true, get: () => size.w });
  Object.defineProperty(frame, 'offsetHeight', { configurable: true, get: () => size.h });
  canvas.getContext = (() => fakeContext()) as unknown as HTMLCanvasElement['getContext'];

  const progress: number[] = [];
  const onFinish = vi.fn();
  const handle = mountWasher(
    { frame, image, canvas, shine: null, suds: null, tool: null, hint: null, done: null },
    { onProgress: (p) => progress.push(p), onFinish }
  );

  /* the washer sizes itself on the first frame after mount */
  flush();

  return {
    canvas,
    image,
    handle,
    progress,
    onFinish,
    size,
    latest: () => progress[progress.length - 1],
    finished: () => progress[progress.length - 1] === 100,
  };
}

type Harness = ReturnType<typeof mount>;

/** hold the trigger and sweep the frame until the wash finishes itself */
function sweepUntilFinished(h: Harness) {
  pointer(h.canvas, 'pointerdown', 10, 10);
  flush();
  for (let y = 0; y <= FRAME_H; y += 18) {
    for (let x = 0; x <= FRAME_W; x += 18) {
      if (h.finished()) return true;
      pointer(h.canvas, 'pointermove', x, y);
      flush();
    }
  }
  return h.finished();
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  clock = 0;
  nextFrameId = 1;
  queuedFrames.clear();

  vi.spyOn(performance, 'now').mockImplementation(() => clock);
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    const id = nextFrameId++;
    queuedFrames.set(id, cb);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    queuedFrames.delete(id);
  });
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('the pressure washer', () => {
  it('starts at nothing cleaned', () => {
    const h = mount();

    expect(h.progress[0]).toBe(0);
  });

  it('reports more coverage as the jet moves across the frame', () => {
    const h = mount();

    pointer(h.canvas, 'pointerdown', 60, 60);
    flush();
    const first = h.latest();

    pointer(h.canvas, 'pointermove', 300, 200);
    flush();

    expect(first).toBeGreaterThan(0);
    expect(h.latest()).toBeGreaterThan(first);
  });

  /* Coverage is what the hero's progress bar reads from. A number that
     can go backwards is a bar that visibly un-fills while someone is
     still washing, so this asserts the whole reported sequence rather
     than only the end of it. */
  it('never reports less coverage than it already reported', () => {
    const h = mount();

    sweepUntilFinished(h);

    for (let i = 1; i < h.progress.length; i++) {
      expect(h.progress[i]).toBeGreaterThanOrEqual(h.progress[i - 1]);
    }
  });

  it('does not count the same spot twice when the jet is held still', () => {
    const h = mount();

    pointer(h.canvas, 'pointerdown', 220, 160);
    flush();
    const afterOne = h.latest();

    for (let i = 0; i < 25; i++) flush();

    expect(afterOne).toBeGreaterThan(0);
    expect(h.latest()).toBe(afterOne);
  });

  /* Going over a panel again is what someone actually does, and it is
     where double counting would show: the bar would race ahead of the
     paint and the car would be declared clean with grime still on it. */
  it('adds nothing for a second pass over a stripe already cleaned', () => {
    const h = mount();
    const stripe = [60, 100, 140, 180, 220, 260];

    pointer(h.canvas, 'pointerdown', stripe[0], 160);
    flush();
    for (const x of stripe) {
      pointer(h.canvas, 'pointermove', x, 160);
      flush();
    }
    const afterFirstPass = h.latest();

    for (let pass = 0; pass < 3; pass++) {
      for (const x of [...stripe].reverse()) {
        pointer(h.canvas, 'pointermove', x, 160);
        flush();
      }
    }

    expect(afterFirstPass).toBeGreaterThan(0);
    expect(h.latest()).toBe(afterFirstPass);
  });

  /* Past the threshold the wash is no longer the reader's job. Letting
     go of the trigger is the ordinary way to leave it there, so the
     release is part of the scenario rather than an edge of it. */
  it('finishes on its own once past the threshold, even after the trigger is released', () => {
    const h = mount();

    expect(sweepUntilFinished(h)).toBe(true);

    pointer(h.canvas, 'pointerup', 0, 0);

    for (let i = 0; i < 60 && h.onFinish.mock.calls.length === 0; i++) {
      flush();
      vi.advanceTimersByTime(16);
    }
    vi.advanceTimersByTime(1000);

    expect(h.latest()).toBe(100);
    expect(h.onFinish).toHaveBeenCalledTimes(1);
  });

  it('does not take any more input once it has finished', () => {
    const h = mount();
    sweepUntilFinished(h);
    const atFinish = h.progress.length;

    pointer(h.canvas, 'pointerdown', 50, 50);
    flush();
    pointer(h.canvas, 'pointermove', 200, 200);
    flush();

    expect(h.progress.slice(atFinish).every((p) => p === 100)).toBe(true);
  });

  /* A resize that does not change the measured size is routine: on a
     phone the address bar sliding away fires one, and so does the
     keyboard opening. Restarting on those wipes a wash in progress
     back to zero under someone who is still holding the trigger. */
  it('does not reset coverage when a resize leaves the frame the same size', () => {
    const h = mount();

    pointer(h.canvas, 'pointerdown', 120, 120);
    flush();
    pointer(h.canvas, 'pointermove', 300, 180);
    flush();
    pointer(h.canvas, 'pointerup', 300, 180);
    const reached = h.latest();
    expect(reached).toBeGreaterThan(0);

    window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(500);
    flush();

    expect(h.latest()).toBe(reached);
    expect(Math.min(...h.progress.slice(1))).toBeGreaterThan(0);
  });

  it('survives a burst of resize events at the same size', () => {
    const h = mount();

    pointer(h.canvas, 'pointerdown', 120, 120);
    flush();
    pointer(h.canvas, 'pointerup', 120, 120);
    const reached = h.latest();

    for (let i = 0; i < 10; i++) {
      window.dispatchEvent(new Event('resize'));
      vi.advanceTimersByTime(30);
    }
    vi.advanceTimersByTime(500);
    flush();

    expect(h.latest()).toBe(reached);
  });

  it('does not reset coverage when the hero image arrives mid-wash', () => {
    const h = mount();

    pointer(h.canvas, 'pointerdown', 120, 120);
    flush();
    pointer(h.canvas, 'pointermove', 300, 180);
    flush();
    pointer(h.canvas, 'pointerup', 300, 180);
    const reached = h.latest();
    expect(reached).toBeGreaterThan(0);

    h.image.dispatchEvent(new Event('load'));
    flush();

    expect(h.latest()).toBe(reached);
    expect(Math.min(...h.progress.slice(1))).toBeGreaterThan(0);
  });

  it('keeps the trigger held when the hero image arrives mid-wash', () => {
    const h = mount();

    pointer(h.canvas, 'pointerdown', 120, 120);
    flush();
    const before = h.latest();
    expect(before).toBeGreaterThan(0);

    h.image.dispatchEvent(new Event('load'));
    flush();
    pointer(h.canvas, 'pointermove', 300, 180);
    flush();

    expect(h.latest()).toBeGreaterThan(before);
  });

  it('still rebuilds when the image load is what gives the frame its height', () => {
    const h = mount();

    pointer(h.canvas, 'pointerdown', 120, 120);
    flush();
    pointer(h.canvas, 'pointerup', 120, 120);
    expect(h.latest()).toBeGreaterThan(0);

    h.size.h = FRAME_H + 140;
    h.image.dispatchEvent(new Event('load'));
    flush();

    expect(h.latest()).toBe(0);
  });

  it('reset puts it back to nothing cleaned', () => {
    const h = mount();

    pointer(h.canvas, 'pointerdown', 120, 120);
    flush();
    expect(h.latest()).toBeGreaterThan(0);

    h.handle.reset();

    expect(h.latest()).toBe(0);
  });

  it('stops reporting after destroy', () => {
    const h = mount();

    pointer(h.canvas, 'pointerdown', 120, 120);
    flush();
    const before = h.progress.length;

    h.handle.destroy();
    pointer(h.canvas, 'pointerdown', 200, 200);
    flush();
    vi.advanceTimersByTime(1000);

    expect(h.progress.length).toBe(before);
  });

  it('returns a usable handle when there is no 2D context at all', () => {
    const frame = document.createElement('div');
    const image = document.createElement('img');
    const canvas = document.createElement('canvas');
    canvas.getContext = (() => null) as unknown as HTMLCanvasElement['getContext'];

    const onProgress = vi.fn();
    const handle = mountWasher(
      { frame, image, canvas, shine: null, suds: null, tool: null, hint: null, done: null },
      { onProgress }
    );

    expect(() => {
      handle.reset();
      handle.destroy();
    }).not.toThrow();
    expect(onProgress).not.toHaveBeenCalled();
  });
});
