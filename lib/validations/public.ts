
import * as z from "zod"

export const lostIdSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal("")),
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  idType: z.enum(["NATIONAL_ID", "STUDENT_ID", "KCSE_CERTIFICATE", "DRIVING_LICENSE", "OTHER"]),
  serialNumber: z.string().min(1, { message: "Serial/Registration number is required." }),
  description: z.string().optional(),
  dateLost: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date.",
  }),
})

export const foundIdSchema = z.object({
  nameOnId: z.string().min(2, { message: "Name on ID must be at least 2 characters." }),
  idType: z.enum(["NATIONAL_ID", "STUDENT_ID", "KCSE_CERTIFICATE", "DRIVING_LICENSE", "OTHER"]),
  serialNumber: z.string().min(1, { message: "Serial/Registration number is required." }),
  locationFound: z.string().min(3, { message: "Location found must be detailed." }),
  dateFound: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date.",
  }),
  finderName: z.string().min(2, { message: "Your name is required." }),
  finderContact: z.string().min(10, { message: "Your contact is required." }),
  image: z.any()
    .refine((file) => file?.length !== 0, "Image is required.")
    // .refine((file) => file?.size <= 5000000, `Max image size is 5MB.`)
    // .refine(
    //   (file) => ["image/jpeg", "image/png", "image/webp"].includes(file?.type),
    //   "Only .jpg, .png, and .webp formats are supported."
    // )
    .optional(), // Make optional for now in schema, handle check in component if needed
})
