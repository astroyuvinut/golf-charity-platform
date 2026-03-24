import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const buildId = process.env.NEXT_BUILD_ID || 'unknown'
    const environment = process.env.NODE_ENV || 'unknown'

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      buildId,
      environment,
      uptime: process.uptime(),
    })
  } catch {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Health check failed' },
      { status: 500 }
    )
  }
}
