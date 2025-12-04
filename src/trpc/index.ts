import {adminProcedure, privateProcedure, publicProcedure, router} from "@/trpc/trpc";
import {db} from "@/lib/db";
import bcrypt from "bcryptjs";
import {registerValidator} from "@/lib/validators/register";
import {itemValidator} from "@/lib/validators/item";
import {z} from "zod";
import {addBookingValidator} from "@/lib/validators/booking";
import {TRPCError} from "@trpc/server";
import {BookingStatus} from "@/types";

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
        }),
    getAllItems: privateProcedure
        .query(async () => {
            return db.item.findMany();
        }),
    addItem: adminProcedure
        .input(itemValidator)
        .mutation(async ({input}) => {

            const availableStock = input.availableStock ?? input.totalStock;

            await db.item.create({
                data: {
                    ...input,
                    availableStock,
                }
            })

            return { status: "OK" }
        }),
    deleteItem: adminProcedure
        .input(z.string())
        .mutation(async ({input}) => {

            await db.item.delete({
                where: { id: input }
            })

            return { status: "OK" }
        }),
    getAllBookings: adminProcedure
        .query(async () => {
            return db.booking.findMany({
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    user: true,
                    items: {
                        include: {
                            item: true
                        }
                    }
                }
            });
        }),
    addBooking: privateProcedure
        .input(addBookingValidator)
        .mutation(async ({ input, ctx }) => {
            const {startDate, endDate, items: requestedItems} = input;
            const userId = ctx.user.id;

            const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
            const durationInDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

            return db.$transaction(async (tx) => {
                let totalRentalCost = 0;
                const bookingItemsData = [];

                for (const reqItem of requestedItems) {
                    const dbItem = await tx.item.findUnique({
                        where: {id: reqItem.id},
                    });

                    if (!dbItem) {
                        throw new TRPCError({
                            code: "NOT_FOUND",
                            message: `Item with ID ${reqItem.id} not found`,
                        });
                    }

                    if (dbItem.availableStock < reqItem.quantity) {
                        throw new TRPCError({
                            code: "CONFLICT",
                            message: `Not enough stock for item: ${dbItem.name}. Requested: ${reqItem.quantity}, Available: ${dbItem.availableStock}`,
                        });
                    }

                    const itemTotal = dbItem.pricePerDay * reqItem.quantity * durationInDays;
                    totalRentalCost += itemTotal;

                    bookingItemsData.push({
                        itemId: dbItem.id,
                        quantity: reqItem.quantity,
                        originalQuantity: reqItem.quantity,
                        pricePerDay: dbItem.pricePerDay,
                        replacementCost: dbItem.replacementCost,
                    });
                }

                const newBooking = await tx.booking.create({
                    data: {
                        userId: userId,
                        startDate: startDate,
                        endDate: endDate,
                        status: "WARTEN",
                        totalRentalCost: totalRentalCost,
                        items: {
                            create: bookingItemsData,
                        },
                    },
                });

                return {status: "OK", bookingId: newBooking.id};
            });
        }),

    getUserBookings: privateProcedure
        .query(async ({ ctx }) => {
            return db.booking.findMany({
                where: {
                    userId: ctx.user.id
                },
                orderBy: { createdAt: 'desc' },
                include: {
                    items: {
                        include: { item: true }
                    }
                }
            });
        }),

    updateBookingStatus: adminProcedure
        .input(z.object({
            id: z.string(),
            status: z.enum(BookingStatus)
        }))
        .mutation(async ({ input }) => {
            const { id, status: newStatus } = input;

            return db.$transaction(async (tx) => {
                const booking = await tx.booking.findUnique({
                    where: {id},
                    include: {items: true}
                });

                if (!booking) {
                    throw new TRPCError({code: "NOT_FOUND", message: "Booking not found"});
                }

                const oldStatus = booking.status;

                const holdingStockStatuses = ["AKZEPTIERT", "AKTIV"];

                const wasHoldingStock = holdingStockStatuses.includes(oldStatus);
                const willHoldStock = holdingStockStatuses.includes(newStatus) || oldStatus === "WARTEN";

                if (wasHoldingStock && !willHoldStock) {
                    for (const bookingItem of booking.items) {
                        await tx.item.update({
                            where: {id: bookingItem.itemId},
                            data: {
                                availableStock: {increment: bookingItem.quantity}
                            }
                        });
                    }
                }

                if (!wasHoldingStock && willHoldStock) {
                    for (const bookingItem of booking.items) {
                        const currentItem = await tx.item.findUnique({where: {id: bookingItem.itemId}});

                        if (!currentItem || currentItem.availableStock < bookingItem.quantity) {
                            throw new TRPCError({
                                code: "CONFLICT",
                                message: `Cannot revert status. Item '${currentItem?.name}' is now out of stock.`
                            });
                        }

                        await tx.item.update({
                            where: {id: bookingItem.itemId},
                            data: {
                                availableStock: {decrement: bookingItem.quantity}
                            }
                        });
                    }
                }

                await tx.booking.update({
                    where: {id},
                    data: {status: newStatus}
                });

                return {status: "OK", newStatus};
            });
        }),
    completeReturn: adminProcedure
        .input(z.object({
            bookingId: z.string(),
            finalBillAmount: z.number(),
            adminNotes: z.string(),
            brokenItems: z.array(z.object({
                itemId: z.string(),
                name: z.string(),
                count: z.number(),
                cost: z.number()
            }))
        }))
        .mutation(async ({ input }) => {
            const { bookingId, finalBillAmount, adminNotes, brokenItems } = input;

            return db.$transaction(async (tx) => {
                const booking = await tx.booking.findUnique({
                    where: {id: bookingId},
                    include: {items: true}
                });

                if (!booking) {
                    throw new TRPCError({code: "NOT_FOUND", message: "Booking not found"});
                }

                if (booking.status === "FERTIG") {
                    throw new TRPCError({code: "CONFLICT", message: "Booking is already completed"});
                }

                for (const rentedItem of booking.items) {
                    const brokenRecord = brokenItems.find(b => b.itemId === rentedItem.itemId);
                    const brokenCount = brokenRecord ? brokenRecord.count : 0;

                    const healthyCount = rentedItem.quantity - brokenCount;

                    if (healthyCount < 0) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: `Reported broken count for item ${rentedItem.itemId} exceeds rented quantity.`
                        });
                    }

                    await tx.item.update({
                        where: {id: rentedItem.itemId},
                        data: {
                            availableStock: {increment: healthyCount},
                            totalStock: {decrement: brokenCount}
                        }
                    });
                }

                if (brokenItems.length > 0) {
                    await tx.brokenItemRecord.createMany({
                        data: brokenItems.map(item => ({
                            bookingId: booking.id,
                            itemId: item.itemId,
                            name: item.name,
                            count: item.count,
                            cost: item.cost
                        }))
                    });
                }

                await tx.booking.update({
                    where: {id: bookingId},
                    data: {
                        status: "FERTIG",
                        finalBillAmount: finalBillAmount,
                        adminNotes: adminNotes,
                    }
                });

                return {status: "OK"};
            });
        }),

    getAllUsers: adminProcedure
        .query(async () => {
            return db.user.findMany({
                orderBy: { name: 'asc' },
                // We don't need to return passwords
                select: { id: true, name: true, email: true, role: true, image: true }
            });
        }),

    updateUserRole: adminProcedure
        .input(z.object({
            userId: z.string(),
            role: z.enum(["USER", "ADMIN"])
        }))
        .mutation(async ({ input, ctx }) => {
            const { userId, role } = input;

            if (ctx.user.id === userId) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You cannot change your own role." });
            }

            await db.user.update({
                where: { id: userId },
                data: { role }
            });

            return { status: "OK", newRole: role };
        }),

    deleteUser: adminProcedure
        .input(z.object({ userId: z.string() }))
        .mutation(async ({ input, ctx }) => {
            const { userId } = input;

            // Safety: Prevent deleting yourself
            if (ctx.user.id === userId) {
                throw new TRPCError({ code: "FORBIDDEN", message: "You cannot delete your own account." });
            }

            await db.user.delete({
                where: { id: userId }
            });

            return { status: "OK" };
        }),
})

export type AppRouter = typeof appRouter