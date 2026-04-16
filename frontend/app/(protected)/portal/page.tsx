import { redirect } from 'next/navigation';

import { ProtectedAppFrame } from '@/components/auth/ProtectedRouteFrames';
import { PortalDashboard } from '@/components/screens/PortalDashboard';
import { getUserHomePath } from '@/lib/auth-routing';
import { requireProtectedUser } from '@/lib/server-auth';

export default async function PortalPage() {
  const appUser = await requireProtectedUser();

  if (appUser.userType === 'STUDENT') {
    redirect(getUserHomePath(appUser));
  }

  return (
    <ProtectedAppFrame>
      <PortalDashboard user={appUser} />
    </ProtectedAppFrame>
  );
}
