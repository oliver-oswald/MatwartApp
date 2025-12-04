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