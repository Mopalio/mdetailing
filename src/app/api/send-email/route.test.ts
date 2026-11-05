// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

/* The provider is mocked at the module boundary, so no test in this file
   can send real mail. That matters more here than in most suites: the
   route mails a real customer address and the business inbox. */
const { send } = vi.hoisted(() => ({ send: vi.fn() }));

vi.mock('resend', () => ({
  Resend: class {
    emails = { send };
  },
}));

import { POST } from './route';

function booking(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Alex Mertens',
    email: 'alex@example.com',
    phone: '+352 000 000',
    carSize: 'Medium Car',
    date: '2026-11-12',
    time: 'to be confirmed',
    message: 'Postcode L-1234\nPlate AB 1234',
    ...overrides,
  };
}

function request(body: unknown) {
  return new Request('http://localhost/api/send-email', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as unknown as NextRequest;
}

/** every html body the route handed the provider during one call */
function sentHtml() {
  return send.mock.calls.map((call) => String(call[0].html));
}

beforeEach(() => {
  process.env.RESEND_API_KEY = 'test-key-not-a-real-one';
  send.mockReset();
  send.mockResolvedValue({ id: 'mail_test' });
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('POST /api/send-email', () => {
  it('escapes markup typed by the customer, in both the customer and business mails', async () => {
    const attack = '<img src=x onerror="alert(1)">';

    await POST(request(booking({ name: attack })));

    const bodies = sentHtml();
    expect(bodies).toHaveLength(2);
    for (const html of bodies) {
      expect(html).not.toContain('<img src=x');
      expect(html).toContain('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
    }
  });

  it('escapes every customer-typed field, not only the name', async () => {
    await POST(
      request(
        booking({
          email: 'a<b>@example.com',
          phone: '<b>352</b>',
          carSize: '<script>x</script>',
          message: 'line one\n<hr>',
        })
      )
    );

    const business = sentHtml()[1];
    expect(business).not.toContain('<script>');
    expect(business).not.toContain('<hr>');
    expect(business).toContain('&lt;script&gt;x&lt;/script&gt;');
    expect(business).toContain('&lt;hr&gt;');
  });

  it('leaves an ordinary booking readable', async () => {
    await POST(request(booking()));

    const customer = sentHtml()[0];
    expect(customer).toContain('Alex Mertens');
    expect(customer).toContain('2026-11-12');
    expect(customer).not.toContain('&lt;');
  });

  it('reports failure rather than claiming the booking was sent', async () => {
    send.mockRejectedValue(new Error('provider is down'));

    const response = await POST(request(booking()));
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.success).toBe(false);
  });
});
