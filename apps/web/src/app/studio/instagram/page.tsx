import { redirect } from 'next/navigation';

/** Instagram automation is deferred — keep route from 404ing old bookmarks. */
export default function StudioInstagramPage() {
  redirect('/studio');
}
