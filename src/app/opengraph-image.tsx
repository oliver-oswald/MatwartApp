import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Matwart App Dashboard'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 60,
                    background: '#530467',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontFamily: 'sans-serif',
                }}
            >
                <svg
                    width="150"
                    height="150"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginBottom: 20 }}
                >
                    <path d="M3.5 21 14 3" />
                    <path d="M20.5 21 10 3" />
                    <path d="M15.5 21 12 15l-3.5 6" />
                    <path d="M2 21h20" />
                </svg>

                <div style={{ fontWeight: 'bold', letterSpacing: '-0.05em' }}>
                    Matwart App
                </div>

                <div style={{ fontSize: 30, marginTop: 20, opacity: 0.8 }}>
                    Einfach. Schnell. Online.
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}