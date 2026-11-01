import { MysticClientPage } from '@/components/mystic/MysticClientPage';
import { WelcomeClient } from './WelcomeClient';

export const metadata = {
  title: 'Welcome — Mystic Hair Co.',
};

export default function WelcomePage() {
  return (
    <MysticClientPage width="wide" loose>
      <WelcomeClient />
    </MysticClientPage>
  );
}
