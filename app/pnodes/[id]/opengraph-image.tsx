import { ImageResponse } from 'next/og'
import { apiClient } from '@/lib/api'

export const runtime = 'edge'

export const alt = 'XDOrb pNode Analytics'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image({ params }: { params: { id: string } }) {
  const { id } = params
  
  // Fetch node data
  const response = await fetch(`${process.env.API_BASE || 'http://localhost:9000/api'}/pnodes/${id}`, {
    headers: process.env.API_KEY ? { 'Authorization': `Bearer ${process.env.API_KEY}` } : undefined
  }).then(res => res.json())
  
  const node = response.data

  if (!node) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: 'black',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          XDOrb Analytics
        </div>
      ),
      { ...size }
    )
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px',
          fontFamily: 'sans-serif',
          color: 'white',
          position: 'relative',
        }}
      >
        {/* Background Grid Pattern */}
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.3,
        }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
            <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
                fontWeight: 'bold'
            }}>
                X
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e2e8f0' }}>XDOrb Analytics</div>
                <div style={{ fontSize: '20px', color: '#94a3b8' }}>Real-time pNode Monitor</div>
            </div>
        </div>

        {/* Main Content */}
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            flex: 1, 
            justifyContent: 'center',
            gap: '20px'
        }}>
            <div style={{ fontSize: '64px', fontWeight: 'bold', background: 'linear-gradient(to right, #60a5fa, #c084fc)', backgroundClip: 'text', color: 'transparent' }}>
                {node.name || 'Unknown Node'}
            </div>
            <div style={{ fontSize: '24px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ opacity: 0.7 }}>{node.location}</span>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#64748b' }} />
                <span style={{ fontFamily: 'monospace' }}>v{node.version || '0.0.0'}</span>
            </div>
        </div>

        {/* Metrics Grid */}
        <div style={{ 
            display: 'flex', 
            gap: '20px', 
            marginTop: 'auto',
            background: 'rgba(255,255,255,0.05)',
            padding: '30px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '8px' }}>XDN Score</span>
                <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#fbbf24' }}>{node.xdnScore?.toFixed(0) || 'N/A'}</span>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '8px' }}>Uptime</span>
                <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#4ade80' }}>
                    {node.uptime ? `${(node.uptime / (3600*24)).toFixed(1)}d` : '0d'}
                </span>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '8px' }}>Latency</span>
                <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#60a5fa' }}>{node.latency}ms</span>
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '8px' }}>Status</span>
                <span style={{ 
                    fontSize: '36px', 
                    fontWeight: 'bold', 
                    color: node.status === 'active' ? '#4ade80' : '#ef4444',
                    textTransform: 'capitalize'
                }}>
                    {node.status}
                </span>
            </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
