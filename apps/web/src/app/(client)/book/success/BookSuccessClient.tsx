'use client';

import { useMemo, useState } from 'react';
import { CalendarPlus, Sparkles } from 'lucide-react';
import {
  MYSTIC_PACKAGES,
  MYSTIC_SERVICES,
  formatUsd,
  type PackageId,
  type ServiceId,
} from '@template/mystic';
import { buildCalendarLinks } from '@/lib/mystic/calendar-event';
import type { BookSuccessAppointment } from '@/lib/mystic/load-book-success';
import {
  MysticMagneticAnchor,
  MysticMagneticButton,
  MysticMagneticLink,
} from '@/components/mystic/MysticMagneticButton';
import { mysticCard } from '@/components/mystic/mystic-styles';

type Props = {
  appointment: BookSuccessAppointment | null;
  refShort?: string;
};

const UPSELL_PACKAGE_ID: PackageId = 'pack_4';

export function BookSuccessClient({ appointment, refShort }: Props) {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const calendar = useMemo(() => {
    if (!appointment) return null;
    return buildCalendarLinks({
      serviceId: appointment.serviceId,
      startsAt: appointment.startsAt,
      durationMinutes: appointment.durationMinutes,
      addressLine: appointment.addressLine,
    });
  }, [appointment]);

  const serviceName =
    appointment &&
    (MYSTIC_SERVICES.find((s) => s.id === (appointment.serviceId as ServiceId))?.name ??
      'House call');

  const upsellPack = MYSTIC_PACKAGES.find((p) => p.id === UPSELL_PACKAGE_ID)!;

  async function buyPackage() {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const res = await fetch('/api/mystic/checkout/package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: UPSELL_PACKAGE_ID }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCheckoutError(data.error ?? 'Could not start checkout');
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      setCheckoutError('Could not start checkout');
    } finally {
      setCheckoutLoading(false);
    }
  }

  function downloadIcs() {
    if (!calendar) return;
    const a = document.createElement('a');
    a.href = calendar.icsDataUrl;
    a.download = calendar.icsFilename;
    a.click();
  }

  return (
    <div className="mx-auto max-w-lg py-4 md:py-6">
      <div className="text-center">
        <p className="type-eyebrow text-success">Confirmed</p>
        <h1 className="font-display mt-3 text-3xl font-medium tracking-tight text-ink md:text-4xl">
          You&apos;re on the books
        </h1>
        <p className="mt-4 text-muted">
          Luke will see you soon. Check SMS and email for door-timer and on-the-way updates.
          {refShort ? (
            <>
              <br />
              <span className="font-mono text-xs text-muted/80">Ref {refShort}</span>
            </>
          ) : null}
        </p>
      </div>

      {appointment && serviceName ? (
        <div className={`${mysticCard} mt-10 p-6 text-left`}>
          <p className="font-medium text-ink">{serviceName}</p>
          <p className="mt-1 text-sm text-muted">
            {new Date(appointment.startsAt).toLocaleString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
          <p className="mt-1 text-sm text-muted">{appointment.addressLine}</p>

          {calendar ? (
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <MysticMagneticAnchor
                href={calendar.googleUrl}
                variant="primary"
                target="_blank"
                rel="noreferrer"
              >
                <CalendarPlus className="h-4 w-4" aria-hidden />
                Add to Google Calendar
              </MysticMagneticAnchor>
              <MysticMagneticButton type="button" variant="secondary" onClick={downloadIcs}>
                <CalendarPlus className="h-4 w-4" aria-hidden />
                Apple / Outlook (.ics)
              </MysticMagneticButton>
            </div>
          ) : null}
        </div>
      ) : null}

      <section className="mt-10 overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-gold-soft via-surface to-accent-soft p-6 text-left shadow-[0_20px_50px_-32px_rgba(26,31,24,0.25)]">
        <div className="flex items-start gap-3">
          <span className="rounded-full bg-gold/15 p-2 text-gold">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="type-eyebrow text-plum">Save on your next visits</p>
            <h2 className="font-display mt-1 text-xl font-medium text-ink">
              {upsellPack.blowoutCount}-blowout package
            </h2>
            <p className="mt-2 text-sm text-muted">
              {formatUsd(upsellPack.priceCents)} total · {upsellPack.savingsLabel} · valid{' '}
              {upsellPack.expiresMonths} months. Credits apply automatically at checkout.
            </p>
            {checkoutError ? <p className="mt-2 text-sm text-danger">{checkoutError}</p> : null}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <MysticMagneticButton type="button" disabled={checkoutLoading} onClick={buyPackage}>
                {checkoutLoading ? 'Redirecting…' : 'Buy package'}
              </MysticMagneticButton>
              <MysticMagneticLink href="/memberships" variant="secondary">
                Compare memberships
              </MysticMagneticLink>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <MysticMagneticLink href="/visits">My visits</MysticMagneticLink>
        <MysticMagneticLink href="/messages" variant="secondary">
          Message Luke
        </MysticMagneticLink>
      </div>
    </div>
  );
}
