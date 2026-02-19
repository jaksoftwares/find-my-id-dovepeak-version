import { z } from 'zod';
import { idTypeEnum } from './ids';

export const createRequestSchema = z.object({
  id_type: idTypeEnum,
  full_name: z.string().min(2),
  registration_number: z.string().optional(),
  description: z.string().optional(),
  contact_phone: z.string().optional(),
});

export const updateRequestSchema = z.object({
  description: z.string().optional(),
  contact_phone: z.string().optional(),
  status: z.enum(['submitted', 'matched', 'closed']).optional(),
});
