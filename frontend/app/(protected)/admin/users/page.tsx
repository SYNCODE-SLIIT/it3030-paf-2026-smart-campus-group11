import { ProtectedAppFrame } from '@/components/auth/ProtectedRouteFrames';
import { AdminUsersScreen } from '@/components/screens/AdminUsersScreen';
import { requireAdminUser } from '@/lib/server-auth';

export default async function AdminUsersPage() {
  const appUser = await requireAdminUser();

  return (
    <ProtectedAppFrame requireAdmin>
      <AdminUsersScreen currentUser={appUser} />
    </ProtectedAppFrame>
  );
}
