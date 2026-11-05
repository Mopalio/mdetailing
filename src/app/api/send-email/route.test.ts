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

/* The SDK resolves rather than rejects when the provider refuses a
   send: the refusal arrives as { data: null, error }. That is the whole
   reason this route could report a booking as sent that nobody ever
   received, and it is why asserting a rejected promise here proves
   nothing. Verified against resend 4.8 in node_modules. */
const accepted = () => ({ data: { id: 'mail_test' }, error: null });
const rejected = (message: string) => ({
  data: null,
  error: { name: 'validation_error', message },
});

/** every html body the route handed the provider during one call */
function sentHtml() {
  return send.mock.calls.map((call) => String(call[0].html));
}

beforeEach(() => {
  process.env.RESEND_API_KEY = 'test-key-not-a-real-one';
  send.mockReset();
  send.mockResolvedValue(accepted());
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

  it('confirms the booking when both mails are accepted', async () => {
    const response = await POST(request(booking()));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.message).toMatch(/check your/i);
  });

  it('reports failure when the business notification is refused', async () => {
    send.mockResolvedValueOnce(accepted()).mockResolvedValueOnce(rejected('domain is not verified'));

    const response = await POST(request(booking()));
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload.success).toBe(false);
  });

  it('does not promise a confirmation email that was refused', async () => {
    send.mockResolvedValueOnce(rejected('recipient address is invalid')).mockResolvedValueOnce(accepted());

    const response = await POST(request(booking()));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.message).not.toMatch(/check your/i);
  });

  it('still tells the business about a booking whose confirmation was refused', async () => {
    send.mockResolvedValueOnce(rejected('recipient address is invalid')).mockResolvedValueOnce(accepted());

    await POST(request(booking()));

    expect(send).toHaveBeenCalledTimes(2);
    expect(String(send.mock.calls[1][0].to)).toContain('mdetailing2025@gmail.com');
  });

  it('reports failure when the provider throws', async () => {
    send.mockRejectedValue(new Error('network is down'));

    const response = await POST(request(booking()));
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.success).toBe(false);
  });
});
