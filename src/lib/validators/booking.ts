import { z } from "zod";

export const addBookingValidator = z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    items: z.array(
        z.object({
            id: z.string(),
            quantity: z.number().min(1),
        })
    ),
}).superRefine((data, ctx) => {
    if (data.endDate < data.startDate){
        ctx.addIssue({
            path: ["startDate", "endDate"],
            code: "custom",
            message: "End Datum darf nicht vor Start Datum sein!"
        })
    }
});

export type bookingInputType = z.input<typeof addBookingValidator>
export type bookingOutputType = z.output<typeof addBookingValidator>