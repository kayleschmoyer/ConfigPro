import { useCallback, useMemo, useState } from 'react';
import { formatDateTime } from '../lib/format';
import type { Message } from '../lib/types';
import { usePortal } from './usePortal';

export const useMessages = () => {
  const { snapshot } = usePortal();
  const [threads, setThreads] = useState<Record<string, Message[]>>(() =>
    snapshot.messages
      ? snapshot.messages.reduce<Record<string, Message[]>>((acc, message) => {
          acc[message.threadId] = [...(acc[message.threadId] ?? []), message];
          return acc;
        }, {})
      : {}
  );

  const unreadCount = useMemo(
    () =>
      Object.values(threads)
        .flat()
        .filter(message => !message.read).length,
    [threads]
  );

  const appendMessage = useCallback((threadId: string, text: string) => {
    const newMessage: Message = {
      id: `local-${Date.now()}`,
      threadId,
      from: 'CUSTOMER',
      at: new Date().toISOString(),
      text,
      read: true
    };
    setThreads(current => ({ ...current, [threadId]: [...(current[threadId] ?? []), newMessage] }));
  }, []);

  const markThreadRead = useCallback((threadId: string) => {
    setThreads(current => ({
      ...current,
      [threadId]: (current[threadId] ?? []).map(message => ({ ...message, read: true }))
    }));
  }, []);

  const formattedThreads = useMemo(
    () =>
      Object.entries(threads).map(([threadId, messages]) => ({
        threadId,
        messages: messages.map(message => ({
          ...message,
          atLabel: formatDateTime(message.at)
        }))
      })),
    [threads]
  );

  return { threads: formattedThreads, unreadCount, appendMessage, markThreadRead };
};
