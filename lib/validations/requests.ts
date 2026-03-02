import { z } from 'zod';
import { idTypeEnum } from './ids';

export const createRequestSchema = z.object({
  id_type: idTypeEnum,
  full_name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  registration_number: z.string().min(1, { message: "ID / Serial / Registration number is required." }),
  description: z.string().optional(),
  contact_phone: z.string().min(10, { message: "Contact phone is required." }),
  contact_email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal("")),
  date_lost: z.string().optional(),
  last_seen_location: z.string().optional(),
  image_url: z.string().optional(),
});

export const updateRequestSchema = z.object({
  description: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email().optional(),
  status: z.enum(['submitted', 'under_review', 'match_found', 'closed', 'expired']).optional(),
});
