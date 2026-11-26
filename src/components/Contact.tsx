import { lazy, type ReactNode } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './icons';
import { profile } from '../config/profile';
import SectionHeading from './SectionHeading';
import Reveal from './Reveal';
import ContactForm from './contact/ContactForm';
import Lazy3D from './3d/Lazy3D';

const StackScene = lazy(() => import('./contact/StackScene'));

function CtaLink({ href, label, icon, sub }: { href: string; label: string; icon: ReactNode; sub: string }) {
  const base = 'glass flex items-center gap-4 rounded-2xl p-5 transition-colors';
  if (!href) {
    return (
      <div aria-disabled="true" className={`${base} cursor-not-allowed border-dashed opacity-70`}>
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-slate-400">{icon}</span>
        <span>
          <span className="block text-sm font-medium text-[var(--text)]">{label}</span>
          <span className="block text-xs text-[var(--text-muted)]">Profile link coming soon</span>
        </span>
      </div>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} hover:border-sky-400/50 hover:bg-sky-400/5`}>
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-sky-400/10 text-sky-200">{icon}</span>
      <span>
        <span className="block text-sm font-medium text-[var(--text)]">{label}</span>
        <span className="block text-xs text-[var(--text-muted)]">{sub}</span>
      </span>
      <span className="visually-hidden">(opens in a new tab)</span>
    </a>
  );
}

export default function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="scroll-mt-24 py-[var(--m-section-y)] lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <SectionHeading eyebrow="08 — Contact" title="Let's build something great." id="contact-title">
              <p>
                Interested in discussing cloud infrastructure, DevOps, Linux administration, or software engineering
                opportunities? I&apos;d love to connect.
              </p>
            </SectionHeading>

            <ul className="mt-10 space-y-4 text-sm text-[var(--text)]">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-sky-300" aria-hidden="true" />
                <a href={`mailto:${profile.email}`} className="inline-flex min-h-11 items-center hover:text-sky-300">
                  {profile.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-sky-300" aria-hidden="true" />
                <a href={`tel:${profile.phone.replace(/[^+\d]/g, '')}`} className="inline-flex min-h-11 items-center hover:text-sky-300">
                  {profile.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-sky-300" aria-hidden="true" />
                <span>{profile.location.replace('Based in ', '')}</span>
              </li>
            </ul>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <CtaLink href={`mailto:${profile.email}`} label="Email" sub="Send a message" icon={<Mail className="h-5 w-5" aria-hidden="true" />} />
              <CtaLink href={profile.linkedin} label="LinkedIn" sub="Connect professionally" icon={<LinkedinIcon className="h-5 w-5" aria-hidden="true" />} />
              <CtaLink href={profile.github} label="GitHub" sub="Browse code" icon={<GithubIcon className="h-5 w-5" aria-hidden="true" />} />
            </div>

            <Lazy3D className="mt-6 hidden h-[220px] min-[900px]:block" fallback={null}>
              <StackScene />
            </Lazy3D>
          </div>

          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
