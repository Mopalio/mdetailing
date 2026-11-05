import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Appointment } from './Appointment';

/* fetch is mocked at the module boundary, the same way the mail route's
   own test mocks the provider: this form posts a real booking to a
   route that mails a real person. Nothing inside the form is stubbed,
   so the estimate and the validation are the component's own.

   The clock is pinned because the earliest bookable date is derived
   from today, and a test that drifts with the calendar is not a test. */

const TODAY = '2026-11-05T09:00:00.000Z';
const EARLIEST = '2026-11-07';

let fetchMock: ReturnType<typeof vi.fn>;

/** the fields the form is currently reporting, with the message shown */
function reported() {
  return Object.fromEntries(
    [...document.querySelectorAll('.fld.is-bad')].map((label) => [
      label.querySelector('input, textarea')?.getAttribute('name'),
      label.querySelector('.fld__err')?.textContent,
    ])
  );
}

function field(label: RegExp) {
  return screen.getByLabelText(label);
}

function fill(label: RegExp, value: string) {
  const el = field(label);
  fireEvent.change(el, { target: { value } });
  fireEvent.blur(el);
}

function fillValidBooking(overrides: Record<string, string> = {}) {
  const values: Record<string, string> = {
    'Your name': 'Alex Mertens',
    Email: 'alex@example.com',
    Postcode: 'L-1234',
    'Car make and model': 'Audi A4',
    'Preferred date': '2026-12-01',
    ...overrides,
  };
  for (const [label, value] of Object.entries(values)) {
    fill(new RegExp('^' + label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), value);
  }
}

function submitForm() {
  fireEvent.click(screen.getByRole('button', { name: /Request this slot/i }));
}

function estimate() {
  return document.querySelector('.total__v')?.textContent;
}

function postedBody() {
  return JSON.parse(String(fetchMock.mock.calls[0][1].body));
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(TODAY));

  fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ success: true }),
  });
  vi.stubGlobal('fetch', fetchMock);
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      root = null;
      rootMargin = '';
      thresholds: number[] = [];
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }
  );
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
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function mount() {
  return render(<Appointment title="Book a slot" subtitle="We come to you" />);
}

describe('the live estimate', () => {
  it('opens on the price of the size that is preselected', () => {
    mount();

    expect(screen.getByDisplayValue('medium')).toBeChecked();
    expect(estimate()).toBe('€65');
  });

  it('follows the vehicle size', () => {
    mount();

    fireEvent.click(screen.getByDisplayValue('small'));
    expect(estimate()).toBe('€50');

    fireEvent.click(screen.getByDisplayValue('large'));
    expect(estimate()).toBe('€80');
  });

  it('adds an extra on top of the size', () => {
    mount();

    fireEvent.click(screen.getByDisplayValue('ceramic'));

    expect(estimate()).toBe('€185');
  });

  it('adds up several extras', () => {
    mount();

    fireEvent.click(screen.getByDisplayValue('small'));
    fireEvent.click(screen.getByDisplayValue('ceramic'));
    fireEvent.click(screen.getByDisplayValue('interior'));
    fireEvent.click(screen.getByDisplayValue('engine'));

    expect(estimate()).toBe('€265');
  });

  it('comes back down when an extra is taken off again', () => {
    mount();

    fireEvent.click(screen.getByDisplayValue('ceramic'));
    expect(estimate()).toBe('€185');

    fireEvent.click(screen.getByDisplayValue('ceramic'));
    expect(estimate()).toBe('€65');
  });

  it('counts every extra at once', () => {
    mount();

    fireEvent.click(screen.getByDisplayValue('large'));
    for (const v of ['ceramic', 'interior', 'lights', 'engine']) {
      fireEvent.click(screen.getByDisplayValue(v));
    }

    expect(estimate()).toBe('€335');
  });

  it('keeps the extras when the size changes', () => {
    mount();

    fireEvent.click(screen.getByDisplayValue('lights'));
    fireEvent.click(screen.getByDisplayValue('large'));

    expect(estimate()).toBe('€120');
  });
});

describe('what the form says is wrong', () => {
  it('turns the browser off, so the messages are its own', () => {
    const { container } = mount();

    expect(container.querySelector('form')).toHaveProperty('noValidate', true);
  });

  it('names every required field that is empty, in its own words', () => {
    mount();

    submitForm();

    expect(reported()).toEqual({
      name: 'We need a name for the booking',
      email: 'That address does not look right',
      postcode: 'We need this to confirm we cover you',
      car: 'Which car are we treating?',
      date: 'Pick a date from tomorrow onwards',
    });
  });

  it('does not post a booking it has already said is wrong', () => {
    mount();

    submitForm();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('leaves the optional fields out of it', () => {
    mount();

    submitForm();

    expect(Object.keys(reported())).not.toContain('phone');
    expect(Object.keys(reported())).not.toContain('plate');
    expect(Object.keys(reported())).not.toContain('notes');
  });

  it('reports only the field that is actually wrong', () => {
    mount();
    fillValidBooking({ Email: 'alex-at-example.com' });

    submitForm();

    expect(reported()).toEqual({ email: 'That address does not look right' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('treats whitespace as empty', () => {
    mount();
    fillValidBooking({ 'Your name': '   ' });

    submitForm();

    expect(reported()).toEqual({ name: 'We need a name for the booking' });
  });

  it('puts the cursor in the first field it is complaining about', () => {
    mount();
    fillValidBooking({ 'Your name': '' });

    submitForm();

    expect(document.activeElement).toBe(field(/^Your name/));
  });

  it.each([
    ['no at sign', 'alex.example.com'],
    ['nothing before the at sign', '@example.com'],
    ['no domain', 'alex@'],
    ['a one-letter tld', 'alex@example.c'],
    ['a space in it', 'alex mertens@example.com'],
  ])('rejects an address with %s', (_name, email) => {
    mount();
    fillValidBooking({ Email: email });

    submitForm();

    expect(reported()).toEqual({ email: 'That address does not look right' });
  });

  it('rejects a date earlier than the earliest bookable one', () => {
    mount();
    fillValidBooking({ 'Preferred date': '2026-11-06' });

    submitForm();

    expect(reported()).toEqual({ date: 'Pick a date from tomorrow onwards' });
  });

  it('accepts the earliest bookable date itself', async () => {
    mount();
    fillValidBooking({ 'Preferred date': EARLIEST });

    submitForm();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(reported()).toEqual({});
  });

  it('offers that same earliest date to the date picker', () => {
    mount();

    expect(field(/^Preferred date/)).toHaveAttribute('min', EARLIEST);
  });

  it('stops complaining as soon as the field is corrected', () => {
    mount();
    submitForm();
    expect(Object.keys(reported())).toContain('email');

    fireEvent.change(field(/^Email/), { target: { value: 'alex@example.com' } });

    expect(Object.keys(reported())).not.toContain('email');
  });

  it('does not start complaining about a field nobody has touched', () => {
    mount();

    fill(/^Your name/, 'Alex Mertens');

    expect(reported()).toEqual({});
  });

  it('complains on leaving a field empty, without waiting for submit', () => {
    mount();

    fireEvent.change(field(/^Email/), { target: { value: 'nope' } });
    fireEvent.blur(field(/^Email/));

    expect(reported()).toEqual({ email: 'That address does not look right' });
  });
});

describe('a booking that is good to send', () => {
  it('posts it to the mail route with the estimate worked into the message', async () => {
    mount();
    fillValidBooking();
    fill(/^Phone/, '+352 000 000');
    fill(/^Plate/, 'AB 1234');
    fill(/^Anything we should know/, 'Gate code 42');
    fireEvent.click(screen.getByDisplayValue('large'));
    fireEvent.click(screen.getByDisplayValue('ceramic'));
    fireEvent.click(screen.getByDisplayValue('engine'));

    submitForm();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock.mock.calls[0][0]).toBe('/api/send-email');
    expect(postedBody()).toEqual({
      name: 'Alex Mertens',
      email: 'alex@example.com',
      phone: '+352 000 000',
      carSize: 'Large (EUR 80)',
      date: '2026-12-01',
      time: 'To be confirmed',
      message: [
        'Car: Audi A4 (AB 1234)',
        'Postcode: L-1234',
        'Extras: Ceramic coating, Engine bay',
        'Estimate: EUR 235',
        'Notes: Gate code 42',
      ].join('\n'),
    });
  });

  it('says so rather than leaving the phone blank', async () => {
    mount();
    fillValidBooking();

    submitForm();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(postedBody().phone).toBe('Not given');
    expect(postedBody().message).toContain('Extras: None');
    expect(postedBody().message).not.toContain('Notes:');
  });

  it('shows the request back, with the same estimate on it', async () => {
    mount();
    fillValidBooking();
    fireEvent.click(screen.getByDisplayValue('ceramic'));

    submitForm();

    expect(await screen.findByText('Request sent')).toBeInTheDocument();
    const recap = document.querySelector('.bform__recap')?.textContent ?? '';
    expect(recap).toContain('Audi A4');
    expect(recap).toContain('Medium');
    expect(recap).toContain('Ceramic coating');
    expect(recap).toContain('L-1234');
    expect(recap).toContain('EUR 185');
  });

  it('sends once per press, not once per field', async () => {
    mount();
    fillValidBooking();

    submitForm();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  });
});

describe('when the mail route will not take it', () => {
  it('says what went wrong instead of claiming it was sent', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ success: false, message: 'Mail is down' }),
    });
    mount();
    fillValidBooking();

    submitForm();

    expect(await screen.findByText('Mail is down')).toBeInTheDocument();
    expect(screen.queryByText('Request sent')).not.toBeInTheDocument();
  });

  it('survives the request failing outright', async () => {
    fetchMock.mockRejectedValue(new Error('offline'));
    mount();
    fillValidBooking();

    submitForm();

    expect(await screen.findByText('offline')).toBeInTheDocument();
    expect(screen.queryByText('Request sent')).not.toBeInTheDocument();
  });

  it('lets the booking be sent again afterwards', async () => {
    fetchMock.mockRejectedValueOnce(new Error('offline'));
    mount();
    fillValidBooking();

    submitForm();
    expect(await screen.findByText('offline')).toBeInTheDocument();

    submitForm();

    expect(await screen.findByText('Request sent')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
