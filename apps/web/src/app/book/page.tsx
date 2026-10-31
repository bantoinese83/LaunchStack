import type { Metadata } from 'next';
import { BookFlowClient } from './BookFlowClient';

export const metadata: Metadata = {
  title: 'Book a house call',
  description: 'Book Mystic Hair Co. blowouts, cuts, and updos at your home in Chicago.',
};

export default function BookPage() {
  return (
    <div className="min-h-screen bg-paper">
      <BookFlowClient />
    </div>
  );
}
