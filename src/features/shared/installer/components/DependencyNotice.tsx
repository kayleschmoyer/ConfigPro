import { Info } from 'lucide-react';

interface DependencyNoticeProps {
  dependencies: string[];
}

export const DependencyNotice = ({ dependencies }: DependencyNoticeProps) => {
  if (!dependencies.length) return null;
  return (
    <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <Info className="h-3.5 w-3.5 text-primary" aria-hidden />
      Requires {dependencies.join(', ')}
    </p>
  );
};
