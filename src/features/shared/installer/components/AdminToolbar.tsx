import { ShieldCheck, Settings2, FileSpreadsheet, GitCompare, ClipboardList, Power } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/lib/cn';

interface AdminToolbarProps {
  adminMode: boolean;
  onAdminModeChange: (enabled: boolean) => void;
  onEditPricing: () => void;
  onEditCatalog: () => void;
  onEditDependencies: () => void;
  onViewAudit: () => void;
  isConfigPro?: boolean;
  lastPublishedAt?: string;
}

export const AdminToolbar = ({
  adminMode,
  onAdminModeChange,
  onEditPricing,
  onEditCatalog,
  onEditDependencies,
  onViewAudit,
  isConfigPro,
  lastPublishedAt,
}: AdminToolbarProps) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-3xl border border-primary/40 bg-primary/10 p-4 text-sm text-primary-foreground shadow-lg shadow-primary/10 backdrop-blur',
      )}
      role="region"
      aria-label="ConfigPro admin toolbar"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-white">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Admin
          </span>
          {isConfigPro && (
            <span className="rounded-full bg-primary/30 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-primary-foreground">
              Internal
            </span>
          )}
          <div className="flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-[0.65rem] uppercase tracking-[0.28em]">
            <Power className="h-3.5 w-3.5" aria-hidden />
            Admin mode
            <Switch
              checked={adminMode}
              onCheckedChange={onAdminModeChange}
              aria-label="Toggle admin mode"
            />
          </div>
        </div>
        {lastPublishedAt && (
          <span className="text-xs text-primary-foreground/80">
            Pricing published {new Date(lastPublishedAt).toLocaleString()}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary" onClick={onEditPricing} disabled={!adminMode}>
          <FileSpreadsheet className="mr-2 h-4 w-4" aria-hidden />
          Edit pricing
        </Button>
        <Button size="sm" variant="secondary" onClick={onEditCatalog} disabled={!adminMode}>
          <Settings2 className="mr-2 h-4 w-4" aria-hidden />
          Edit catalog
        </Button>
        <Button size="sm" variant="secondary" onClick={onEditDependencies} disabled={!adminMode}>
          <GitCompare className="mr-2 h-4 w-4" aria-hidden />
          Dependencies
        </Button>
        <Button size="sm" variant="secondary" onClick={onViewAudit}>
          <ClipboardList className="mr-2 h-4 w-4" aria-hidden />
          View audit
        </Button>
      </div>
    </div>
  );
};
