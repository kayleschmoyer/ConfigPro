import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { cn } from '@/lib/cn';
import type { Message } from '../lib/types';

interface MessageThreadProps {
  threadId: string;
  messages: Array<Message & { atLabel: string }>;
  onReply: (threadId: string, text: string) => void;
}

export const MessageThread = ({ threadId, messages, onReply }: MessageThreadProps) => {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (data.get('message') as string) ?? '';
    if (!text.trim()) return;
    onReply(threadId, text);
    event.currentTarget.reset();
  };

  return (
    <section aria-labelledby={`thread-${threadId}`} className="flex h-full flex-col gap-4">
      <div className="flex-1 space-y-4 overflow-y-auto rounded-3xl border border-border/50 bg-surface/60 p-6">
        {messages.map((message, index) => (
          <motion.article
            layout
            key={message.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: index * 0.04 }}
            className={cn(
              'max-w-xl rounded-2xl border border-border/40 px-5 py-4 text-sm shadow-sm shadow-primary/10',
              message.from === 'CUSTOMER'
                ? 'ml-auto bg-primary/10 text-primary-foreground'
                : 'mr-auto bg-surface/80 text-foreground'
            )}
          >
            <header className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted">
              <span>{message.from === 'CUSTOMER' ? 'You' : 'ConfigPro team'}</span>
              <span>{message.atLabel}</span>
            </header>
            <p className="text-sm leading-relaxed text-foreground/90">{message.text}</p>
          </motion.article>
        ))}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="rounded-3xl border border-border/60 bg-surface/80 p-5">
        <fieldset className="flex flex-col gap-4" aria-label="Reply composer">
          <Input name="message" placeholder="Type your secure message" />
          <div className="flex justify-end">
            <Button type="submit">Send reply</Button>
          </div>
        </fieldset>
      </form>
    </section>
  );
};
