'use client';

import Image from 'next/image';

export type InspoPhoto = { id: string; public_url: string };

export function MysticInspoGallery({
  photos,
  label = 'Inspo',
}: {
  photos: InspoPhoto[];
  label?: string;
}) {
  if (!photos.length) return null;

  return (
    <div className="mt-3">
      <p className="text-xs font-medium text-muted">{label}</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {photos.map((photo) => (
          <li key={photo.id}>
            <a
              href={photo.public_url}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-xl border border-line"
            >
              <Image
                src={photo.public_url}
                alt="Inspo reference"
                width={88}
                height={88}
                className="h-[88px] w-[88px] object-cover"
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
