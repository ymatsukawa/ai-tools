import { useState, useCallback, useEffect } from 'react';

export const useCookie = <T,>(
  key: string,
  defaultValue: T,
  expiryDays: number = 365
): [T, (value: T) => void] => {
  // Initialize state from cookie or default value
  const [value, setValue] = useState<T>(() => {
    if (typeof document === 'undefined') return defaultValue;

    const cookies = document.cookie.split(';');
    const cookie = cookies.find(c => c.trim().startsWith(`${key}=`));

    if (cookie) {
      try {
        const cookieValue = cookie.split('=')[1];
        return JSON.parse(decodeURIComponent(cookieValue));
      } catch {
        return defaultValue;
      }
    }

    return defaultValue;
  });

  // Update cookie whenever value changes
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const expires = new Date();
    expires.setDate(expires.getDate() + expiryDays);

    const cookieValue = encodeURIComponent(JSON.stringify(value));
    document.cookie = `${key}=${cookieValue}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
  }, [key, value, expiryDays]);

  const updateValue = useCallback((newValue: T) => {
    setValue(newValue);
  }, []);

  return [value, updateValue];
};
