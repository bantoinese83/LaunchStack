'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

type Props = {
  url: string;
  size?: number;
  /** Shown under QR (usually the referral code). */
  label?: string;
  className?: string;
};

export function MysticReferralQr({ url, size = 160, label, className = '' }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void QRCode.toDataURL(url, {
      width: size,
      margin: 1,
      color: { dark: '#1F1E1E', light: '#FAF8F4' },
      errorCorrectionLevel: 'M',
    }).then((png) => {
      if (active) setDataUrl(png);
    });
    return () => {
      active = false;
    };
  }, [url, size]);

  return (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`}>
      <div
        className="rounded-2xl border border-line/80 bg-surface p-3"
        aria-hidden={!label}
        role={label ? 'img' : undefined}
        aria-label={label ? `QR code for invite link, code ${label}` : undefined}
      >
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL from qrcode
          <img src={dataUrl} alt="" width={size} height={size} className="block" />
        ) : (
          <div
            className="animate-pulse rounded-xl bg-line/40"
            style={{ width: size, height: size }}
          />
        )}
      </div>
      {label ? <p className="font-mono text-sm font-medium text-ink">{label}</p> : null}
    </div>
  );
}

export async function referralQrDataUrl(url: string, size = 512): Promise<string> {
  return QRCode.toDataURL(url, {
    width: size,
    margin: 2,
    color: { dark: '#1F1E1E', light: '#FFFFFF' },
    errorCorrectionLevel: 'M',
  });
}
