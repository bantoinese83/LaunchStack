'use client';

import { useMemo, useState } from 'react';
import { CalendarPlus } from 'lucide-react';
import { MysticIcon } from '@/components/mystic/icons/MysticIcon';
import { MysticStripeWordmark } from '@/components/mystic/MysticStripeWordmark';
import {
  MYSTIC_PACKAGES,
  MYSTIC_SERVICES,
  formatUsd,
  formatVisitWhen,
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
import { MysticClientPage } from '@/components/mystic/MysticClientPage';
import { mysticCard } from '@/components/mystic/mystic-styles';
import Image from 'next/image';
import { MysticConfettiBurst } from '@/components/mystic/MysticConfettiBurst';
import { MYSTIC_MARKETING_IMAGES } from '@/lib/mystic/marketing-images';
import { MysticSummaryRowGroup } from '@/components/mystic/MysticSummaryRowGroup';

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

  const confirmed = Boolean(appointment && serviceName);

  return (
    <MysticClientPage className="py-4 md:py-6">
      <MysticConfettiBurst active={confirmed} />
      <div className="text-center">
        {confirmed ? (
          <>
            <Image
              src={MYSTIC_MARKETING_IMAGES.stylistCutout}
              alt="Luke — Mystic Hair Co. stylist"
              width={220}
              height={286}
              className="mx-auto -mb-2 h-auto w-[min(220px,55vw)] drop-shadow-[0_16px_32px_rgba(26,31,24,0.25)]"
              priority
            />
            <p className="type-hand-lg text-success">You&apos;re confirmed!</p>
            <h1 className="font-display mt-3 text-3xl font-medium tracking-tight text-ink md:text-4xl">
              You&apos;re on the books
            </h1>
            <p className="mt-4 text-muted">
              Luke will see you soon. Check SMS and email for on-the-way and arrival updates.
              {refShort ? (
                <>
                  <br />
                  <span className="font-mono text-xs text-muted/80">Ref {refShort}</span>
                </>
              ) : null}
            </p>
          </>
        ) : (
          <>
            <p className="type-eyebrow text-plum">Payment received</p>
            <h1 className="font-display mt-3 text-3xl font-medium tracking-tight text-ink md:text-4xl">
              We&apos;re confirming your visit
            </h1>
            <p className="mt-4 flex flex-wrap items-center gap-x-1 gap-y-1 text-muted">
              <MysticStripeWordmark height={12} className="shrink-0" />
              <span>
                checkout went through, but visit details aren&apos;t ready yet — that can take a
                moment after payment. Check Visits, refresh this page, or message Luke if nothing
                shows in a few minutes.
              </span>
              {refShort ? (
                <>
                  <br />
                  <span className="font-mono text-xs text-muted/80">Ref {refShort}</span>
                </>
              ) : null}
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <MysticMagneticButton type="button" onClick={() => window.location.reload()}>
                Refresh
              </MysticMagneticButton>
              <MysticMagneticLink href="/visits" variant="secondary">
                My visits
              </MysticMagneticLink>
              <MysticMagneticLink href="/messages" variant="secondary">
                Message Luke
              </MysticMagneticLink>
            </div>
          </>
        )}
      </div>

      {confirmed ? (
        <div className="mt-10 space-y-4 text-left">
          <MysticSummaryRowGroup
            rows={[
              { id: 'service', label: 'Service', value: serviceName as string },
              {
                id: 'when',
                label: 'When',
                value: formatVisitWhen(appointment!.startsAt),
              },
              { id: 'where', label: 'Where', value: appointment!.addressLine },
            ]}
          />

          {calendar ? (
            <div className={`${mysticCard} flex flex-col gap-2 p-5 sm:flex-row`}>
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

      {confirmed ? (
        <section className="mt-10 overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-gold-soft via-surface to-accent-soft p-6 text-left shadow-[0_20px_50px_-32px_rgba(26,31,24,0.25)]">
          <div className="flex items-start gap-3">
            <span className="rounded-full bg-gold/15 p-2.5 text-gold">
              <MysticIcon name="packageOffer" className="h-5 w-5" strokeWidth={1.85} />
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
      ) : null}

      {confirmed ? (
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <MysticMagneticLink href="/visits">My visits</MysticMagneticLink>
          <MysticMagneticLink href="/messages" variant="secondary">
            Message Luke
          </MysticMagneticLink>
        </div>
      ) : null}
    </MysticClientPage>
  );
}
