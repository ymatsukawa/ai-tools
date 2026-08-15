// Single source of truth — re-exported so the two definitions cannot drift apart.
export type { FontOption } from '../../shared/types/common';

export interface Message {
  role: string;
  content: string;
}