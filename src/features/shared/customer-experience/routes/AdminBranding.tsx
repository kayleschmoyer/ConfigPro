import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { resolveTheme } from '@/app/config/theme';

const themes = [
  { label: 'Default', value: 'default' },
  { label: 'Daycare', value: 'daycare' },
  { label: 'Construction', value: 'construction' }
];

export const AdminBranding = () => {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-foreground">Portal branding</h2>
        <p className="text-sm text-muted">Control logo, accent colors, and typography across the experience.</p>
      </header>
      <section className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Portal name" placeholder="ConfigPro Portal" />
          <Input label="Logo URL" placeholder="https://cdn.example.com/logo.svg" />
          <Select label="Theme" defaultValue="default">
            {themes.map(theme => (
              <option key={theme.value} value={theme.value}>
                {theme.label}
              </option>
            ))}
          </Select>
          <Input label="Font" defaultValue={resolveTheme().font} />
        </div>
        <div className="mt-6 flex justify-end">
          <Button>Save branding</Button>
        </div>
      </section>
    </div>
  );
};

export default AdminBranding;
