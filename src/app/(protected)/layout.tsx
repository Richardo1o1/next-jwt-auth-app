"use server";

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth'; 
//import { validRefreshTokens } from '@/lib/db'; // 我们需要检查 refresh token 的有效性
import type { JWTPayload } from 'jose';
import { SessionProvider } from '@/providers/session-provider';

interface DecodedTokenPayload extends JWTPayload {
  userId: string;
  username: string;
  role: string;
}

// 这是一个异步的服务器组件
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;

  // 获取当前请求的路径，以便刷新后能跳回来
  const headersList = await headers();
  const pathname = headersList.get('X-pathname');
  const redirectUrl = pathname || '/';
  
  // 1. 初始尝试验证 Access Token
  const decodedAccessToken = accessToken 
    ? await verifyToken<DecodedTokenPayload>(accessToken, 'access') 
    : null;
  
  if (!decodedAccessToken && refreshToken ) {
      
    // 重定向到我们的刷新页面 encodeURIComponent
    return redirect(`/refreshing?redirectTo=${redirectUrl}`);
  }

  // 3. 如果经过所有尝试后，依然没有有效的用户信息，则最终重定向
  if (!decodedAccessToken) {
    redirect('/login');
  }

  // 4. 成功获取用户信息，渲染布局和子页面
  const user = {
    id: decodedAccessToken.userId,
    username: decodedAccessToken.username,
    role: decodedAccessToken.role,
  };

  return (
    <SessionProvider user={user}>
      <div className="min-h-screen bg-white">
        <header className="bg-blue-600 text-white shadow-md p-4">
          <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-xl font-bold">My Protected App</h1>
              <div className="text-right">
                  <p className="text-sm">Welcome, User {user.id}</p>
                  <p className="text-xs font-semibold">ROLE: {user.role.toUpperCase()}</p>
              </div>
          </div>
        </header>
        <main className="p-4">{children}</main>
      </div>
    </SessionProvider>
  );
}