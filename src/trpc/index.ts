import {publicProcedure, router} from "@/trpc/trpc";
import {db} from "@/lib/db";
import bcrypt from "bcryptjs";
import {registerValidator} from "@/lib/validators/register";

export const appRouter = router({
    registerNewUser: publicProcedure
        .input(registerValidator)
        .mutation(async ({input}) => {
            const {name, email, password} = input;

            const hashedPassword = await bcrypt.hash(password, 10);

            await db.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                },
            });

            return { status: "OK" };
        })
})

export type AppRouter = typeof appRouter