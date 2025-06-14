import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';
import type { JWTPayload } from 'jose';

interface DecodedTokenPayload extends JWTPayload {
  userId: string;
  username: string;
  role: string;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('access_token')?.value;

  // 检查是否为 API 路由
  const isApiRoute = pathname.startsWith('/api/');
  
  // 公共页面（如登录页）直接放行
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // --- API 路由保护逻辑 ---
  if (isApiRoute) {
    if (!accessToken) {
      // API 请求没有 token，直接返回 401
      return new NextResponse(JSON.stringify({ message: 'Authentication required.' }), { status: 401 });
    }

    // 对 API 请求进行严格验证
    const decoded = await verifyToken<DecodedTokenPayload>(accessToken, 'access');

    if (!decoded) {
      // API 请求的 token 无效或过期，返回 401
      // 这是给客户端 fetcher 的信号，让它去尝试刷新
      return new NextResponse(JSON.stringify({ message: 'Access token expired or invalid.' }), { status: 401 });
    }
    
    // API 请求验证通过，将用户信息加入请求头并放行
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-User-Id', decoded.userId);
    requestHeaders.set('X-User-Name', decoded.username);
    requestHeaders.set('X-User-Role', decoded.role);
    requestHeaders.set('X-pathname', request.nextUrl.pathname);

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // --- 页面路由保护逻辑 ---
  // 对于页面访问，我们只做最基本的检查：是否存在 token
  if (!accessToken) {
    // 如果连 token 都没有，直接重定向到登录页
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 如果 token 存在（即使已过期），我们选择放行
  // 让下游的 (protected)/layout.tsx 服务器组件去处理完整的验证和刷新逻辑
  // 同时将当前路径放到 header 中
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('X-pathname', request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders }});
}

export const config = {
  // 匹配所有非静态文件路径
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};