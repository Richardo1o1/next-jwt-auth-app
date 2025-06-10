import { NextRequest, NextResponse } from 'next/server';
import { validRefreshTokens } from '@/lib/db';
import { serialize } from 'cookie';

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refresh_token')?.value;
  if (refreshToken) {
    // 从数据库中移除 Refresh Token
    validRefreshTokens.delete(refreshToken);
  }

  const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });

  // 清除 Cookie
  response.headers.append('Set-Cookie', serialize('access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    path: '/',
    expires: new Date(0) // 设置为过去的时间使其立即过期
  }));

  response.headers.append('Set-Cookie', serialize('refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    path: '/api/auth/refresh',
    expires: new Date(0)
  }));
  
  return response;
}