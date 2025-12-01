import { z } from "zod";
import {Categories} from "@prisma/enums";

export const itemFormSchema = z.object({
    name: z.string().min(1, "Name ist erforderlich"),
    category: z.enum(Categories),
    description: z.string().min(1, "Beschreibung ist erforderlich"),
    pricePerDay: z.number().min(0.1, "Preis muss positiv sein"),
    totalStock: z.number().min(1, "Mindestens 1 Stück"),
});

export const itemValidator = itemFormSchema.extend({
    availableStock: z.number().optional(),
    replacementCost: z.number(),
    imageUrl: z.url(),
});

export type ItemFormData = z.infer<typeof itemFormSchema>;