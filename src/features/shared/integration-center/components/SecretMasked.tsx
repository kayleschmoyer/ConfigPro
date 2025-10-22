import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { cn } from '@/lib/cn';
import type { SecretMask } from '../lib';
import { confirmReveal } from '../lib/secrets';

interface SecretMaskedProps {
  secret: SecretMask;
  confirmPhrase?: string;
  label?: string;
  onReveal?: () => void;
}

export function SecretMasked({ secret, confirmPhrase = 'reveal', label, onReveal }: SecretMaskedProps) {
  const [revealed, setRevealed] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [copied, setCopied] = useState(false);

  const handleReveal = async () => {
    if (!confirmReveal(confirmation, confirmPhrase)) return;
    setRevealed(true);
    setConfirmation('');
    onReveal?.();
  };

  const handleCopy = async () => {
    if (!revealed) return;
    try {
      await navigator.clipboard.writeText(secret.masked);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.warn('Clipboard copy failed', error);
    }
  };

  return (
    <div className="space-y-3">
      {label && <p className="text-xs uppercase tracking-[0.3em] text-muted">{label}</p>}
      <motion.div
        layout
        className={cn(
          'flex items-center justify-between rounded-2xl border border-border/50 bg-surface/80 px-4 py-3 text-sm font-mono text-foreground/80 shadow-inner shadow-primary/5',
          revealed && 'bg-primary/10 text-primary'
        )}
      >
        <span aria-live="polite">{revealed ? secret.masked : `${secret.prefix}•••••••••`}</span>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="subtle" onClick={handleCopy} disabled={!revealed}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </motion.div>
      {!revealed && (
        <motion.div
          layout
          className="flex items-center gap-2 rounded-2xl bg-surface/60 p-3 text-xs text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <span className="flex-1">Type “{confirmPhrase}” to reveal once.</span>
          <Input
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder="Confirmation"
            aria-label="Confirm to reveal secret"
            className="h-9 w-40"
          />
          <Button size="sm" variant="outline" onClick={handleReveal} disabled={!confirmation}>
            Reveal
          </Button>
        </motion.div>
      )}
    </div>
  );
}
