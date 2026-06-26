import { ImageResponse } from 'next/og'

export const size        = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
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
          borderRadius: 36,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 18,
            background: '#E2001A',
          }}
        />
        <div
          style={{
            color: 'white',
            fontSize: 82,
            fontWeight: 900,
            lineHeight: 1,
            marginTop: 8,
            letterSpacing: -3,
          }}
        >
          CE
        </div>
        <div
          style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 10,
            marginTop: 4,
          }}
        >
          CLM
        </div>
      </div>
    ),
    { ...size },
  )
}
