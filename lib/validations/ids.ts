import { z } from 'zod';

export const idTypeEnum = z.enum(['national_id', 'student_id', 'drivers_license', 'passport', 'other']);
export const idStatusEnum = z.enum(['pending', 'verified', 'claimed', 'returned', 'archived']);

export const createIdSchema = z.object({
  id_type: idTypeEnum,
  full_name: z.string().min(2),
  registration_number: z.string().min(2),
  sighting_location: z.string().optional(),
  holding_location: z.string().optional(),
  description: z.string().optional(),
  visibility: z.boolean().default(true),
  found_date: z.string().optional(), // ISO date string
  image_url: z.string().url(),
});

export const updateIdSchema = z.object({
  status: idStatusEnum.optional(),
  holding_location: z.string().optional(),
  description: z.string().optional(),
  visibility: z.boolean().optional(),
});
