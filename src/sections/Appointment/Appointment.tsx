'use client';

import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════
   Appointment: the booking form.

   Ported from the booking artboard (design/js/parts.js booking()
   and design/js/form.js). What the prototype could only fake, it
   fakes no longer: the prototype had no endpoint to post to, so
   submit was handled in script. Here it posts to the existing
   /api/send-email route and only then shows the summary.

   Kept from the design: the live estimate that adds up the size
   card and the extras pills, inline validation with real messages
   rather than "this field is required", and the form becoming a
   recap of the request once it has been sent.
   ═══════════════════════════════════════════════════════════ */

interface AppointmentProps {
  title: string;
  subtitle: string;
}

const SIZES = [
  { v: 'small', n: 'Small', d: 'Compact, sedan', p: 50 },
  { v: 'medium', n: 'Medium', d: 'SUV, mid-size', p: 65 },
  { v: 'large', n: 'Large', d: 'Van, truck', p: 80 },
];

const EXTRAS = [
  { v: 'ceramic', n: 'Ceramic coating', p: 120 },
  { v: 'interior', n: 'Interior deep clean', p: 60 },
  { v: 'lights', n: 'Headlight restoration', p: 40 },
  { v: 'engine', n: 'Engine bay', p: 35 },
];

type Values = {
  name: string;
  email: string;
  phone: string;
  postcode: string;
  car: string;
  date: string;
  plate: string;
  notes: string;
};

const EMPTY: Values = {
  name: '',
  email: '',
  phone: '',
  postcode: '',
  car: '',
  date: '',
  plate: '',
  notes: '',
};

/* message shown when a required field is wrong, not "required" */
const ERRORS: Partial<Record<keyof Values, string>> = {
  name: 'We need a name for the booking',
  email: 'That address does not look right',
  postcode: 'We need this to confirm we cover you',
  car: 'Which car are we treating?',
  date: 'Pick a date from tomorrow onwards',
};

const REQUIRED: (keyof Values)[] = ['name', 'email', 'postcode', 'car', 'date'];


/* Defined at module scope on purpose. Declared inside the section it
   would be a new component type on every render, so React would
   remount the input on each keystroke and the caret would jump out. */
function Field({
  k,
  label,
  values,
  bad,
  onChange,
  onBlur,
  type = 'text',
  wide,
  autoComplete,
  textarea,
  min,
}: {
  k: keyof Values;
  label: string;
  values: Values;
  bad: Set<keyof Values>;
  onChange: (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: (k: keyof Values) => () => void;
  type?: string;
  wide?: boolean;
  autoComplete?: string;
  textarea?: boolean;
  min?: string;
}) {
  return (
    <label
      className={['fld', wide ? 'bform__wide' : '', bad.has(k) ? 'is-bad' : '']
        .filter(Boolean)
        .join(' ')}
    >
      {textarea ? (
        <textarea
          name={k}
          placeholder=" "
          value={values[k]}
          onChange={onChange(k)}
          onBlur={onBlur(k)}
        />
      ) : (
        <input
          name={k}
          type={type}
          placeholder=" "
          value={values[k]}
          onChange={onChange(k)}
          onBlur={onBlur(k)}
          autoComplete={autoComplete}
          min={type === 'date' ? min : undefined}
          required={REQUIRED.includes(k)}
        />
      )}
      <span>{label}</span>
      <em className="fld__err">{ERRORS[k]}</em>
    </label>
  );
}

export function Appointment({ title, subtitle }: AppointmentProps) {
  const [values, setValues] = useState<Values>(EMPTY);
  const [size, setSize] = useState('medium');
  const [extras, setExtras] = useState<string[]>([]);
  const [bad, setBad] = useState<Set<keyof Values>>(new Set());
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<null | { recap: [string, string][] }>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  /* bookings start the day after tomorrow, as in the prototype */
  const minDate = useMemo(
    () => new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10),
    []
  );

  const total = useMemo(() => {
    const s = SIZES.find((x) => x.v === size)?.p ?? 0;
    const e = extras.reduce(
      (sum, v) => sum + (EXTRAS.find((x) => x.v === v)?.p ?? 0),
      0
    );
    return s + e;
  }, [size, extras]);

  const invalid = (k: keyof Values, v: string) => {
    if (!REQUIRED.includes(k)) return false;
    const t = v.trim();
    if (!t) return true;
    if (k === 'email') return !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t);
    if (k === 'date') return t < minDate;
    return false;
  };

  const set = (k: keyof Values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const v = e.target.value;
    setValues((p) => ({ ...p, [k]: v }));
    /* once a field is marked bad, correct it as they type */
    setBad((p) => {
      if (!p.has(k)) return p;
      if (invalid(k, v)) return p;
      const n = new Set(p);
      n.delete(k);
      return n;
    });
  };

  const blur = (k: keyof Values) => () => {
    setBad((p) => {
      const n = new Set(p);
      if (invalid(k, values[k])) n.add(k);
      else n.delete(k);
      return n;
    });
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFailed(null);

    const wrong = new Set(REQUIRED.filter((k) => invalid(k, values[k])));
    if (wrong.size) {
      setBad(wrong);
      const first = formRef.current?.querySelector<HTMLElement>('.fld.is-bad input');
      first?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      first?.focus({ preventScroll: true });
      return;
    }

    const sizeName = SIZES.find((x) => x.v === size)?.n ?? '';
    const extraNames = extras.map((v) => EXTRAS.find((x) => x.v === v)?.n ?? v);

    /* the route takes the booking in its own shape, so the parts it
       has no field for travel in the message */
    const detail = [
      'Car: ' + values.car + (values.plate ? ' (' + values.plate + ')' : ''),
      'Postcode: ' + values.postcode,
      'Extras: ' + (extraNames.length ? extraNames.join(', ') : 'None'),
      'Estimate: EUR ' + total,
      values.notes ? 'Notes: ' + values.notes : '',
    ]
      .filter(Boolean)
      .join('\n');

    setSending(true);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: values.phone || 'Not given',
          carSize: sizeName + ' (EUR ' + (SIZES.find((x) => x.v === size)?.p ?? 0) + ')',
          date: values.date,
          time: 'To be confirmed',
          message: detail,
        }),
      });
      const data = await res.json().catch(() => ({ success: res.ok }));
      if (!res.ok || data.success === false) {
        throw new Error(data.message || 'Could not send the request');
      }

      setSent({
        recap: [
          ['Car', values.car + (values.plate ? ' · ' + values.plate : '')],
          ['Package', sizeName],
          ['Extras', extraNames.length ? extraNames.join(', ') : 'None'],
          ['Date', values.date],
          ['Area', values.postcode],
          ['Estimate', 'EUR ' + total],
        ],
      });
    } catch (err) {
      setFailed(
        err instanceof Error
          ? err.message
          : 'Could not send the request. Please try again.'
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="appointment" className="bg-ink py-20 text-fg">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="book--form">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-4 flex items-center gap-2.5 text-[0.68rem] font-medium uppercase tracking-[0.24em] text-fg-mid">
              <span className="inline-block h-1.5 w-1.5 bg-chrome-200" />
              Book
            </p>
            <h2 className="mb-4 text-[clamp(2rem,4.6vw,3.25rem)] font-light leading-[1.05] tracking-[-0.03em]">
              {title}
            </h2>
            <p className="max-w-[40ch] text-base leading-relaxed text-fg-mid lg:text-lg">
              {subtitle}
            </p>

            <dl className="mt-10 flex gap-10">
              <div>
                <dt className="font-mono text-2xl font-light tracking-tight text-fg">
                  30 km
                </dt>
                <dd className="mt-1 text-[0.62rem] uppercase tracking-[0.18em] text-fg-dim">
                  around Luxembourg
                </dd>
              </div>
              <div>
                <dt className="font-mono text-2xl font-light tracking-tight text-fg">
                  2 to 4 d
                </dt>
                <dd className="mt-1 text-[0.62rem] uppercase tracking-[0.18em] text-fg-dim">
                  typical lead time
                </dd>
              </div>
            </dl>
          </motion.div>

          <form className="bform" ref={formRef} noValidate onSubmit={submit}>
            {sent ? (
              <div className="bform__done" role="status">
                <div className="bform__tick">✓</div>
                <h3>Request sent</h3>
                <p>We reply the same day with a confirmed slot.</p>
                <div className="bform__recap">
                  {sent.recap.map(([k, v]) => (
                    <div key={k}>
                      {k} &nbsp;<b>{v}</b>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="bform__grid">
                  <Field k="name" label="Your name" autoComplete="name"  values={values} bad={bad} onChange={set} onBlur={blur} min={minDate} />
                  <Field k="email" type="email" label="Email" autoComplete="email"  values={values} bad={bad} onChange={set} onBlur={blur} min={minDate} />
                  <Field k="phone" type="tel" label="Phone (optional)" autoComplete="tel"  values={values} bad={bad} onChange={set} onBlur={blur} min={minDate} />
                  <Field
                    k="postcode"
                    label="Postcode"
                    autoComplete="postal-code"
                   values={values} bad={bad} onChange={set} onBlur={blur} min={minDate} />
                  <Field k="car" label="Car make and model" wide  values={values} bad={bad} onChange={set} onBlur={blur} min={minDate} />
                  <Field k="date" type="date" label="Preferred date"  values={values} bad={bad} onChange={set} onBlur={blur} min={minDate} />
                  <Field k="plate" label="Plate (optional)"  values={values} bad={bad} onChange={set} onBlur={blur} min={minDate} />

                  <fieldset className="sizes">
                    <legend>Vehicle size</legend>
                    <div className="sizes__row">
                      {SIZES.map((s) => (
                        <label className="sz" key={s.v}>
                          <input
                            type="radio"
                            name="size"
                            value={s.v}
                            checked={size === s.v}
                            onChange={() => setSize(s.v)}
                          />
                          <span className="sz__box">
                            <span className="sz__n">{s.n}</span>
                            <span className="sz__d">{s.d}</span>
                            <span className="sz__p">€{s.p}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div className="xtra">
                    {EXTRAS.map((x) => (
                      <label className="chk" key={x.v}>
                        <input
                          type="checkbox"
                          value={x.v}
                          checked={extras.includes(x.v)}
                          onChange={(e) =>
                            setExtras((p) =>
                              e.target.checked
                                ? [...p, x.v]
                                : p.filter((v) => v !== x.v)
                            )
                          }
                        />
                        <span>
                          {x.n} €{x.p}
                        </span>
                      </label>
                    ))}
                  </div>

                  <Field
                    k="notes"
                    label="Anything we should know?"
                    wide
                    textarea
                   values={values} bad={bad} onChange={set} onBlur={blur} min={minDate} />
                </div>

                <div className="bform__foot">
                  <div className="total">
                    <span className="total__k">Estimate</span>
                    <span className="total__v">€{total}</span>
                  </div>
                  <button
                    className="btn btn--solid btn--lg"
                    type="submit"
                    disabled={sending}
                  >
                    <span className="btn__sq" />
                    {sending ? 'Sending' : 'Request this slot'}
                  </button>
                  {failed ? (
                    <p className="bform__note" style={{ color: 'var(--error)' }}>
                      {failed}
                    </p>
                  ) : (
                    <p className="bform__note">
                      No payment now. We confirm the slot by email, then you pay
                      on the day.
                    </p>
                  )}
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
