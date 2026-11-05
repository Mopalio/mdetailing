import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerWash, washTo } from './washController';

/* The whole point of this module is that navigation does not depend on
   the curtain being there. Nothing is mocked: registering a stand-in
   go() is how a real curtain registers itself. */

afterEach(() => {
  registerWash(null);
});

describe('washTo with no curtain mounted', () => {
  it('still runs the swap', async () => {
    const swap = vi.fn();

    await washTo(swap);

    expect(swap).toHaveBeenCalledTimes(1);
  });

  it('runs the swap straight away rather than on a later tick', () => {
    const swap = vi.fn();

    washTo(swap);

    expect(swap).toHaveBeenCalledTimes(1);
  });

  it('resolves', async () => {
    await expect(washTo(() => {})).resolves.toBeUndefined();
  });
});

describe('washTo with a curtain mounted', () => {
  it('hands the swap to the curtain and does not run it as well', async () => {
    const swap = vi.fn();
    const go = vi.fn(async (fn: () => void) => {
      fn();
    });
    registerWash(go);

    await washTo(swap);

    expect(go).toHaveBeenCalledTimes(1);
    expect(go.mock.calls[0][0]).toBe(swap);
    expect(swap).toHaveBeenCalledTimes(1);
  });

  it('waits on the curtain before resolving', async () => {
    const order: string[] = [];
    let release = () => {};
    registerWash(
      (fn) =>
        new Promise<void>((resolve) => {
          release = () => {
            fn();
            order.push('swapped');
            resolve();
          };
        })
    );

    const pending = washTo(() => {}).then(() => order.push('resolved'));
    expect(order).toEqual([]);

    release();
    await pending;

    expect(order).toEqual(['swapped', 'resolved']);
  });

  it('uses the curtain registered most recently', async () => {
    const first = vi.fn(async () => {});
    const second = vi.fn(async () => {});
    registerWash(first);
    registerWash(second);

    await washTo(() => {});

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  /* An unmounted curtain is the same situation as never having had
     one, and the swap has to survive it either way. */
  it('goes back to the immediate swap once the curtain unregisters', async () => {
    const go = vi.fn(async () => {});
    registerWash(go);
    registerWash(null);

    const swap = vi.fn();
    await washTo(swap);

    expect(go).not.toHaveBeenCalled();
    expect(swap).toHaveBeenCalledTimes(1);
  });
});
