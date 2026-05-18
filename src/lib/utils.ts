import { AppRouter } from "@/trpc";
import { inferRouterOutputs } from "@trpc/server";

type OverbookedItem = {
  id: string;
  name: string;
  booked: number;
  available: number;
  overflow: number;
};

type RouterOutputs = inferRouterOutputs<AppRouter>;
type Booking = RouterOutputs["getAllBookings"][number];

export function absoluteUrl(path: string) {
    if (typeof window !== "undefined") return path;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}${path}`;
    return `http://localhost:${process.env.PORT ?? 3000}${path}`;
}

export function getStatusColor(status: string) {
    switch (status) {
        case 'WARTEN': return 'warning';
        case 'AKZEPTIERT': return 'success'; // Or 'primary' depending on flow
        case 'AKTIV': return 'primary';
        case 'FERTIG': return 'default';
        case 'ABGELEHNT': return 'danger';
        default: return 'default';
    }
}

export function getOverbookedItems(
  pendingBookings: Booking[]
): {
  items: OverbookedItem[];
} {
  const bookedMap = new Map<
    string,
    {
      id: string;
      name: string;
      available: number;
      booked: number;
    }
  >();

  for (const booking of pendingBookings) {
    for (const bookingItem of booking.items) {
      const itemId = bookingItem.item.id;

      const existing = bookedMap.get(itemId);

      if (existing) {
        existing.booked += bookingItem.quantity;
      } else {
        bookedMap.set(itemId, {
          id: itemId,
          name: bookingItem.item.name,
          available: bookingItem.item.availableStock,
          booked: bookingItem.quantity,
        });
      }
    }
  }

  const overbookedItems: OverbookedItem[] = [];

  for (const [, item] of bookedMap) {
    if (item.booked > item.available) {
      overbookedItems.push({
        id: item.id,
        name: item.name,
        booked: item.booked,
        available: item.available,
        overflow: item.booked - item.available,
      });
    }
  }

  return {
    items: overbookedItems,
  };
}