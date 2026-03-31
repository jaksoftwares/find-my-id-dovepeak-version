
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function getIDPlaceholder(id_type?: string): string {
  const templates: Record<string, string> = {
    national_id: '/templates/nationalid-template.png',
    student_id: '/templates/jkuat-id-placeholder.png',
    driving_license: '/templates/drivinglicence-template.png',
    passport: '/templates/passport-template.png',
    atm_card: '/templates/atmcard-template.png',
    nhif: '/templates/nhifcard-template.png',
  };

  return templates[id_type || ''] || '/templates/id-placeholder.png';
}
