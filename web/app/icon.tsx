import { ImageResponse } from 'next/og'

export const size        = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#003087',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 7,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Franja roja superior */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: '#E2001A',
          }}
        />
        {/* CE */}
        <div
          style={{
            color: 'white',
            fontSize: 15,
            fontWeight: 900,
            lineHeight: 1,
            marginTop: 2,
            letterSpacing: -0.5,
          }}
        >
          CE
        </div>
        {/* CLM */}
        <div
          style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: 6,
            fontWeight: 700,
            letterSpacing: 2,
            marginTop: 1,
          }}
        >
          CLM
        </div>
      </div>
    ),
    { ...size },
  )
}
