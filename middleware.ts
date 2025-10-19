import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 認証が不要なパス
const PUBLIC_PATHS = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const { pathname } = request.nextUrl;

  // 現在のパスが公開パスの場合はスキップ
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // トークンがない場合はログインページへリダイレクト
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}