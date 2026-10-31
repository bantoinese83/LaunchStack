import { MysticSuccessPage } from '@/components/mystic/MysticSuccessPage';

export default function MembershipSuccessPage() {
  return (
    <MysticSuccessPage
      eyebrow="Active"
      title="Welcome to the family"
      description={
        <p>
          Your membership or package is active. Credits apply automatically the next time you book a
          blowout.
        </p>
      }
      actions={[
        { href: '/book', label: 'Book a house call', primary: true },
        { href: '/visits', label: 'My visits' },
        { href: '/account', label: 'Account' },
      ]}
    />
  );
}
