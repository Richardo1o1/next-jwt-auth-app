import { NextRequest, NextResponse } from 'next/server';
import { users, validRefreshTokens } from '@/lib/db';
import { comparePasswords } from '@/lib/password';
import { signTokens } from '@/lib/auth';
import { serialize } from 'cookie';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
  }

  const user = users.find((u) => u.username === username);
  if (!user) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  const isPasswordValid = await comparePasswords(password, user.passwordHash);
  if (!isPasswordValid) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  const { accessToken, refreshToken } = await signTokens(user);

  // 在数据库中存储 Refresh Token
  validRefreshTokens.set(refreshToken, user.id);

  const response = NextResponse.json({ message: 'Login successful', user: { id: user.id, username: user.username, role: user.role } }, { status: 200 });

  response.headers.append('Set-Cookie', serialize('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 15 // 15分钟
  }));

  response.headers.append('Set-Cookie', serialize('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    path: '/api/auth/refresh', // 仅在此路径发送
    maxAge: 60 * 60 * 24 * 7 // 7天
  }));

  console.log("return OK");
  return response;
}