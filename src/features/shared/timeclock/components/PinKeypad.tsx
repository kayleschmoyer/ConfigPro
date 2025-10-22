import { motion } from 'framer-motion';
import { Button } from '../../../shared/ui/Button';
import { cn } from '../../../lib/cn';

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'];

export type PinKeypadProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  disabled?: boolean;
  maxLength?: number;
};

export const PinKeypad = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  maxLength = 6,
}: PinKeypadProps) => {
  const handlePress = (key: string) => {
    if (disabled) return;
    if (key === 'clear') {
      onChange('');
      return;
    }
    if (key === 'back') {
      onChange(value.slice(0, -1));
      return;
    }
    if (value.length >= maxLength) {
      onSubmit?.(value);
      return;
    }
    const next = `${value}${key}`;
    onChange(next);
    if (next.length === maxLength) {
      onSubmit?.(next);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-3">
        {Array.from({ length: maxLength }).map((_, index) => {
          const filled = index < value.length;
          return (
            <motion.span
              key={index}
              aria-hidden
              className={cn(
                'h-3 w-3 rounded-full border border-surface/60 transition-colors',
                filled ? 'bg-primary border-primary' : 'bg-transparent'
              )}
              animate={{ scale: filled ? 1.1 : 1 }}
            />
          );
        })}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {keys.map((key) => {
          const label = key === 'back' ? '⌫' : key === 'clear' ? 'Clear' : key;
          return (
            <Button
              key={key}
              type="button"
              variant={key === 'clear' ? 'outline' : 'primary'}
              size="lg"
              disabled={disabled}
              onClick={() => handlePress(key)}
              className={cn(
                'h-16 rounded-3xl text-2xl font-semibold shadow-md shadow-primary/10',
                key === 'clear' && 'text-sm uppercase tracking-wide'
              )}
              aria-label={key === 'back' ? 'Delete digit' : `Key ${label}`}
            >
              {label}
            </Button>
          );
        })}
      </div>
      <div className="text-center text-sm text-muted">PIN entry is obscured for privacy.</div>
    </div>
  );
};
