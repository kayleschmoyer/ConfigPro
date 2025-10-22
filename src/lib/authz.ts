export type User = { id: string; email: string; org?: string; roles: string[] };

const DOMAIN_ALLOW = ['configpro.com', 'configpro.dev'];
const ADMIN_ROLES = ['ADMIN', 'M_EMPLOYEE', 'BILLING'];

export const isConfigPro = (user: User | null | undefined) => {
  if (!user) return false;
  const domain = user.email.split('@')[1]?.toLowerCase();
  return user.org === 'ConfigPro' && (!!domain && DOMAIN_ALLOW.includes(domain));
};

export const isAdmin = (user: User | null | undefined) => {
  if (!isConfigPro(user)) return false;
  return ADMIN_ROLES.some((role) => user?.roles?.includes(role));
};

export const ADMIN_CONSTANTS = {
  DOMAIN_ALLOW,
  ADMIN_ROLES,
};
