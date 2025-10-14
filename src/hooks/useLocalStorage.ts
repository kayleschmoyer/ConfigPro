import { useCallback, useEffect, useState } from 'react';

const isBrowser = () => typeof window !== 'undefined';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const readValue = useCallback(() => {
    if (!isBrowser()) return initialValue;
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initialValue;
    } catch (error) {
      console.warn('ConfigPro: unable to read storage', error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [value, setValue] = useState<T>(readValue);

  useEffect(() => {
    setValue(readValue());
  }, [readValue]);

  const setStoredValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const result = next instanceof Function ? next(prev) : next;
        if (isBrowser()) {
          window.localStorage.setItem(key, JSON.stringify(result));
        }
        return result;
      });
    },
    [key]
  );

  return [value, setStoredValue] as const;
}
