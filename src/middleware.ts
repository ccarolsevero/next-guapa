import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const pathname = request.nextUrl.pathname

  // Verificar autenticação para rotas admin (exceto login)
  if (pathname && pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('employeeToken')
    
    if (!token) {
      // Redirecionar para login se não tiver token
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Security headers for API routes
  if (pathname && pathname.startsWith('/api/')) {
    // Rate limiting headers
    response.headers.set('X-RateLimit-Limit', '100')
    response.headers.set('X-RateLimit-Remaining', '99')
    
    // Additional security for API
    response.headers.set('X-API-Version', '1.0')
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*'
  ],
}
