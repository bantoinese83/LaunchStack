import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BookFlowClient } from './BookFlowClient';

export const metadata: Metadata = {
  title: 'Book a house call',
  description: 'Book Mystic Hair Co. blowouts, cuts, and updos at your home in Chicago.',
};

export default function BookPage() {
  return (
    <Suspense fallback={null}>
      <BookFlowClient />
    </Suspense>
  );
}
