import {z} from "zod";

export const registerValidator = z.object({
    name: z.string().nonempty("Name fehlt!"),
    email: z.email("Das ist keine E-Mail!").nonempty("E-Mail fehlt!"),
    password: z.string().nonempty("Passwort fehlt!").min(8, {error: "Passwort zu kurz"}),
    confirmPassword: z.string()
}).superRefine(({confirmPassword, password}, ctx) => {
    if (confirmPassword !== password) {
        ctx.addIssue({
            code: "custom",
            message: "Passwort stimmt nicht überein!",
            path: ["confirmPassword"]
        })
    }
})

export type registerType = z.infer<typeof registerValidator>