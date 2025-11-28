import { z } from "zod";

export const addBookingValidator = z.object({
    startDate: z.date(),
    endDate: z.date(),
    items: z.array(
        z.object({
            id: z.string(),
            quantity: z.number().min(1),
        })
    ),
});

export type bookingType = z.infer<typeof addBookingValidator>