import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/auth/middleware'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/auth/callback') {
    return Response.json({ status: 'auth callback handled elsewhere' })
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
