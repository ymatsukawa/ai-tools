import { z } from 'zod';

export const qr = z.object({
  input: z.string().max(4296)
});