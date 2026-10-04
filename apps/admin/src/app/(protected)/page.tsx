import { loadAdminDashboard } from '@/lib/admin-data';
import { AdminDashboard } from './AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function InternalAdminDashboard() {
  const data = await loadAdminDashboard();
  return <AdminDashboard {...data} />;
}
