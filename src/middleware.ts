import { NextResponse, type NextRequest } from 'next/server'

// Middleware simplificado — não bloqueia rotas do lado servidor
// A autenticação é verificada no lado cliente (useEffect nas páginas)
export async function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
