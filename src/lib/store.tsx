import React, { createContext, useContext, useState, useEffect } from 'react';
import { Item, Booking, BookingStatus, BrokenItemRecord } from '../types';
import { MOCK_ITEMS } from '@/constants';

interface StoreContextType {
    items: Item[];
    bookings: Booking[];
    addItem: (item: Item) => void;
    deleteItem: (itemId: string) => void;
    addBooking: (booking: Omit<Booking, 'id' | 'status' | 'createdAt' | 'finalBillAmount'>) => void;
    updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
    completeReturn: (bookingId: string, brokenItems: BrokenItemRecord[], finalBill: number, adminNotes: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) throw new Error('useStore must be used within a StoreProvider');
    return context;
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // -- Data State --
    const [items, setItems] = useState<Item[]>(() => {
        const saved = localStorage.getItem('bb_items');
        return saved ? JSON.parse(saved) : MOCK_ITEMS;
    });

    const [bookings, setBookings] = useState<Booking[]>(() => {
        const saved = localStorage.getItem('bb_bookings');
        return saved ? JSON.parse(saved) : [];
    });

    // -- Persistence --
    useEffect(() => {
        localStorage.setItem('bb_items', JSON.stringify(items));
    }, [items]);

    useEffect(() => {
        localStorage.setItem('bb_bookings', JSON.stringify(bookings));
    }, [bookings]);

    // -- Actions --
    const addItem = (newItem: Item) => {
        setItems(prev => [...prev, newItem]);
    };

    const deleteItem = (itemId: string) => {
        setItems(prev => prev.filter(i => i.id !== itemId));
    };

    const updateStock = (bookingItems: any[], multiplier: number) => {
        setItems(currentItems => currentItems.map(invItem => {
            const bookedItem = bookingItems.find((bi: any) => bi.id === invItem.id);
            if (bookedItem) {
                const change = bookedItem.quantity * multiplier;
                const newAvailable = Math.min(invItem.totalStock, Math.max(0, invItem.availableStock + change));
                return { ...invItem, availableStock: newAvailable };
            }
            return invItem;
        }));
    };

    const addBooking = (newBookingData: Omit<Booking, 'id' | 'status' | 'createdAt'>) => {
        const newBooking: Booking = {
            ...newBookingData,
            id: Date.now().toString(),
            status: BookingStatus.PENDING,
            createdAt: Date.now(),
        };
        setBookings(prev => [newBooking, ...prev]);
    };

    const updateBookingStatus = (bookingId: string, status: BookingStatus) => {
        setBookings(prev => prev.map(b => {
            if (b.id !== bookingId) return b;

            const oldStatus = b.status;
            if (status === BookingStatus.APPROVED && oldStatus === BookingStatus.PENDING) {
                updateStock(b.items, -1);
            } else if (status === BookingStatus.CANCELLED && oldStatus === BookingStatus.APPROVED) {
                updateStock(b.items, 1);
            }

            return { ...b, status };
        }));
    };

    const completeReturn = (bookingId: string, brokenItems: BrokenItemRecord[], finalBill: number, adminNotes: string) => {
        setBookings(prev => prev.map(b => {
            if (b.id !== bookingId) return b;
            updateStock(b.items, 1);
            return {
                ...b,
                status: BookingStatus.COMPLETED,
                brokenItems,
                finalBillAmount: finalBill,
                adminNotes
            };
        }));
    };

    return (
        <StoreContext.Provider value={{ items, bookings, addItem, deleteItem, addBooking, updateBookingStatus, completeReturn }}>
            {children}
        </StoreContext.Provider>
    );
};
