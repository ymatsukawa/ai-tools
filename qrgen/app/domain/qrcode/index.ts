import { z } from 'zod';
import { qr } from './objects';

export type QRCode = z.infer<typeof qr>