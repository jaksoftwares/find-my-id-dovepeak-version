import { z } from 'zod';
import { idTypeEnum } from './ids';

export const createSubmissionSchema = z.object({
  id_type: idTypeEnum,
  full_name: z.string().min(2),
  registration_number: z.string().min(2),
  location_found: z.string().optional(),
  contact_info: z.string().optional(),
  image_url: z.string().url(),
});

export const updateSubmissionSchema = z.object({
  approved: z.boolean(),
});
