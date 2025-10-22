import { ShieldAlert } from 'lucide-react';
import { Button } from '../../shared/ui/Button';

export const ForbiddenPage = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-slate-950 to-slate-900 p-8 text-center text-slate-100">
      <ShieldAlert className="h-16 w-16 text-amber-400" aria-hidden />
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Restricted to ConfigPro admins</h1>
        <p className="text-sm text-slate-300">
          You need ConfigPro admin permissions to view this workspace. Contact your ConfigPro administrator if you believe this is an error.
        </p>
      </div>
      <Button asChild variant="secondary">
        <a href="/shared/installer">Return to installer</a>
      </Button>
    </main>
  );
};
