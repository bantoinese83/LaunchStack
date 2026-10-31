import Link from 'next/link';
import Image from 'next/image';

/** Same wordmark lockup as marketing header — for auth cards on paper. */
export function MysticAuthLogo() {
  return (
    <Link href="/" className="mx-auto mb-5 inline-block">
      <Image
        src="/brand/mystic-hair-logo-light.png"
        alt="Mystic Hair Co."
        width={240}
        height={72}
        priority
        className="h-12 w-auto max-w-[min(240px,70vw)] object-contain object-center"
      />
    </Link>
  );
}
