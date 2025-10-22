import { useState } from 'react';
import { MessageThread } from '../components/MessageThread';
import { useMessages } from '../hooks/useMessages';

export const PortalMessages = () => {
  const { threads, appendMessage, markThreadRead } = useMessages();
  const [activeThreadId, setActiveThreadId] = useState<string>(threads[0]?.threadId ?? '');

  const activeThread = threads.find(thread => thread.threadId === activeThreadId) ?? threads[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
      <aside className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">Inbox</h2>
        <ul className="space-y-2">
          {threads.map(thread => (
            <li key={thread.threadId}>
              <button
                type="button"
                onClick={() => {
                  setActiveThreadId(thread.threadId);
                  markThreadRead(thread.threadId);
                }}
                className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  activeThread?.threadId === thread.threadId
                    ? 'border-primary/80 bg-primary/10 text-primary'
                    : 'border-border/50 bg-surface/70 text-foreground hover:bg-surface/80'
                }`}
              >
                <p className="font-semibold">Thread {thread.threadId.slice(-4)}</p>
                <p className="text-xs text-muted">{thread.messages.at(-1)?.atLabel}</p>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      {activeThread ? (
        <MessageThread
          threadId={activeThread.threadId}
          messages={activeThread.messages}
          onReply={(threadId, text) => appendMessage(threadId, text)}
        />
      ) : (
        <div className="flex items-center justify-center rounded-3xl border border-dashed border-border/60 bg-surface/60 text-sm text-muted">
          Select a thread to view messages.
        </div>
      )}
    </div>
  );
};

export default PortalMessages;
