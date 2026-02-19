import { z } from 'zod';

export const createClaimSchema = z.object({
  item_id: z.string().uuid(),
  proof_description: z.string().min(10),
});

export const updateClaimSchema = z.object({
  status: z.enum(['approved', 'rejected', 'completed']),
  admin_notes: z.string().optional(),
});
