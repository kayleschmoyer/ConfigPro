import type { ReactNode } from 'react';
import { ForbiddenPage } from '../pages/errors/ForbiddenPage';
import { useCurrentUser } from '../shared/state/auth';
import { isAdmin, type User as GuardUser } from '../lib/authz';

interface AdminGuardProps {
  children: ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const currentUser = useCurrentUser();
  const guardUser: GuardUser | null = currentUser
    ? { id: currentUser.id, email: currentUser.email, org: currentUser.org, roles: currentUser.roles }
    : null;

  if (!isAdmin(guardUser)) {
    return <ForbiddenPage />;
  }

  return <>{children}</>;
};
