import { Button } from '../../../shared/ui/Button';

export const Scheduling = () => {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-10">
      <h2 className="text-2xl font-semibold text-white">Scheduling</h2>
      <p className="text-sm text-muted-foreground">
        Scheduling is managed in ConfigPro Workforce. Launch the dedicated console to review published rosters and shift swaps.
      </p>
      <Button
        variant="outline"
        size="lg"
        className="self-start"
        onClick={() => {
          if (typeof window !== 'undefined') {
            window.open('/scheduling', '_blank');
          }
        }}
      >
        Open Scheduling console
      </Button>
    </div>
  );
};
