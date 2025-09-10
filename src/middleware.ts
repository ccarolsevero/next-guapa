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

  // Block common attack patterns
  if (pathname) {
    // Block SQL injection attempts (but allow API DELETE methods)
    if (pathname.includes('union') || pathname.includes('select') || pathname.includes('drop') || 
        pathname.includes('insert') || pathname.includes('update')) {
      return new NextResponse('Forbidden', { status: 403 })
    }
    
    // Only block 'delete' in query parameters or non-API paths
    if (pathname.includes('delete') && !pathname.startsWith('/api/')) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Block XSS attempts
    if (pathname.includes('<script') || pathname.includes('javascript:') || 
        pathname.includes('onload=') || pathname.includes('onerror=')) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Block path traversal attempts
    if (pathname.includes('../') || pathname.includes('..\\') || pathname.includes('%2e%2e')) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
