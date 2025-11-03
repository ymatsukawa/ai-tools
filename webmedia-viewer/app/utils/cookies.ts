export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  const pop = parts.pop();
  if (parts.length === 2 && pop) {
    return pop.split(';').shift() || null;
  }
  return null;
};

export const setCookie = (
  name: string,
  value: string,
  days: number = 365
) => {
  if (typeof document === 'undefined') return;

  const date = new Date();
  const time = date.getTime() + days * 24 * 60 * 60 * 1000;
  date.setTime(time);
  const expires = date.toUTCString();
  document.cookie = `${name}=${value};expires=${expires};path=/`;
};
