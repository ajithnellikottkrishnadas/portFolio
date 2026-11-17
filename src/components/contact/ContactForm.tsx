import { useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { profile } from '../../config/profile';

interface Values {
  name: string;
  email: string;
  message: string;
  website: string; // honeypot: real users never fill this
}

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validate(v: Values): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = 'Please enter your name (at least 2 characters).';
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'Please enter a valid email address.';
  if (v.message.trim().length < 10) e.message = 'Message should be at least 10 characters.';
  if (v.message.length > 2000) e.message = 'Message must be 2000 characters or fewer.';
  return e;
}

/**
 * No backend is configured, so submitting opens the visitor's email client with the
 * message prefilled addressed to the profile email. Validation and failure states are handled.
 */
export default function ContactForm() {
  const [values, setValues] = useState<Values>({ name: '', email: '', message: '', website: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<{ kind: 'idle' | 'ok' | 'error'; text: string }>({ kind: 'idle', text: '' });

  const update = (field: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field as keyof Errors]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setStatus({ kind: 'ok', text: 'Email address copied to clipboard.' });
    } catch {
      setStatus({ kind: 'error', text: `Could not copy automatically. Email me at ${profile.email}.` });
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (values.website) return; // bot trap

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setStatus({ kind: 'error', text: 'Please fix the highlighted fields.' });
      return;
    }

    const subject = `Portfolio contact from ${values.name.trim()}`;
    const body = `${values.message.trim()}\n\n— ${values.name.trim()} (${values.email.trim()})`;
    const href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      window.location.href = href;
      setStatus({
        kind: 'ok',
        text: 'Your email app should open with the message ready. If it does not, use the copy button below.',
      });
    } catch {
      setStatus({ kind: 'error', text: 'Could not open your email app. Use the copy button below.' });
    }
  };

  const field = (
    id: keyof Values,
    label: string,
    type: 'text' | 'email' | 'textarea',
    autoComplete?: string,
  ) => {
    const err = errors[id as keyof Errors];
    const common = `w-full rounded-xl border bg-white/[0.03] px-4 py-3 text-sm text-[var(--text)] placeholder:text-slate-500 outline-none transition focus:border-sky-400/60 focus:bg-white/[0.05] ${
      err ? 'border-rose-400/60' : 'border-white/10'
    }`;
    return (
      <div>
        <label htmlFor={`cf-${id}`} className="mb-1.5 block text-sm text-[var(--text-muted)]">
          {label}
        </label>
        {type === 'textarea' ? (
          <textarea
            id={`cf-${id}`}
            rows={5}
            value={values[id]}
            onChange={update(id)}
            maxLength={2400}
            aria-invalid={!!err}
            aria-describedby={err ? `cf-${id}-err` : undefined}
            className={`${common} resize-y`}
            placeholder="What would you like to discuss?"
          />
        ) : (
          <input
            id={`cf-${id}`}
            type={type}
            value={values[id]}
            onChange={update(id)}
            autoComplete={autoComplete}
            aria-invalid={!!err}
            aria-describedby={err ? `cf-${id}-err` : undefined}
            className={common}
          />
        )}
        {err && (
          <p id={`cf-${id}-err`} className="mt-1.5 text-xs text-rose-300">
            {err}
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={onSubmit} noValidate className="glass grid gap-5 rounded-2xl p-6 md:p-8" aria-label="Contact form">
      {field('name', 'Name', 'text', 'name')}
      {field('email', 'Email', 'email', 'email')}
      {field('message', 'Message', 'textarea')}

      {/* Honeypot: hidden from people and assistive tech, catches naive bots. */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="cf-website">Website</label>
        <input id="cf-website" tabIndex={-1} autoComplete="off" value={values.website} onChange={update('website')} />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-violet-500 px-6 py-3 text-sm font-medium text-white shadow-[0_10px_40px_-12px_rgba(56,189,248,0.6)] transition hover:brightness-110"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          Send message
        </button>
        <button
          type="button"
          onClick={copyEmail}
          className="rounded-full border border-white/15 px-5 py-3 text-sm text-[var(--text)] transition hover:border-sky-400/50"
        >
          Copy email address
        </button>
      </div>

      <p role="status" aria-live="polite" className={`min-h-[1.25rem] text-sm ${status.kind === 'error' ? 'text-rose-300' : 'text-emerald-300'}`}>
        {status.text}
      </p>
    </form>
  );
}
