import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';
import type { JWTPayload } from 'jose';

interface DecodedTokenPayload extends JWTPayload {
  userId: string;
  role: string;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('access_token')?.value;

  // 如果访问的是登录页或认证API，直接放行
  const isAuthPage = pathname.startsWith('/login');
  if (isAuthPage) {
    return NextResponse.next();
  }
  
  // 需要保护的路由
  const protectedRoutes = ['/dashboard', '/api/data'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // 使用 await 调用异步的 verifyToken
    const decoded = await verifyToken<DecodedTokenPayload>(accessToken, 'access');

    if (!decoded) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('access_token');
      return response;
    }

    // 将解码后的用户信息添加到请求头中，以便 API 路由使用
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-User-Id', decoded.userId);
    requestHeaders.set('X-User-Role', decoded.role);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};