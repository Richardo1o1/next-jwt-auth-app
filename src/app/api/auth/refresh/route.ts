import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, signAccessToken } from '@/lib/auth';
//import { validRefreshTokens } from '@/lib/db';
import { serialize } from 'cookie';
import type { JWTPayload } from 'jose';

interface DecodedRefreshTokenPayload extends JWTPayload {
  userId: string;
  username: string;
  role: string;
}

export async function POST(request: NextRequest) {
  // 1. 从 HttpOnly Cookie 中获取 Refresh Token
  const refreshToken = request.cookies.get('refresh_token')?.value;
  console.log("1. refresh api: get token", refreshToken);

  if (!refreshToken) {
    return NextResponse.json({ message: 'Refresh token not found.' }, { status: 401 });
  }

  // 2. 验证 Refresh Token 的签名和时效
  const decodedToken = await verifyToken<DecodedRefreshTokenPayload>(refreshToken, 'refresh');
  console.log("2. refresh api: verifyToken", decodedToken);

  if (!decodedToken) {
    // 如果 token 无效或过期，要求重新登录
    return NextResponse.json({ message: 'Invalid or expired refresh token.' }, { status: 401 });
  }

  // console.log("3. refresh api: verify db Token", validRefreshTokens);
  // // 3. (重要安全步骤) 检查 Refresh Token 是否在我们的有效列表中（数据库中）
  // // 这可以防止已登出或被吊销的 token 再次被使用
  // if (!validRefreshTokens.has(refreshToken) || validRefreshTokens.get(refreshToken) !== decodedToken.userId) {
  //   // 如果 token 不在有效列表，说明它可能已被盗用或用户已登出
  //   // 为了安全，我们不仅要拒绝请求，最好还能将该用户的所有 refresh token 都吊销
  //   console.warn(`Attempted use of a revoked or invalid refresh token for user: ${decodedToken.userId}`);
  //   return NextResponse.json({ message: 'Refresh token has been revoked.' }, { status: 401 });
  // }

  // --- 所有检查通过，签发一个新的 Access Token ---
  
  // 4. 生成新的 Access Token
  const newAccessToken = await signAccessToken({
    userId: decodedToken.userId,
    username: decodedToken.username,
    role: decodedToken.role,
  });

  // 5. 将新的 Access Token 作为 HttpOnly Cookie 发送给客户端
  const response = NextResponse.json({ message: 'Token refreshed successfully.' }, { status: 200 });

  response.headers.append('Set-Cookie', serialize('access_token', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 15 // 15分钟
  }));

  // **可选的“令牌旋转（Token Rotation）”**:
  // 为了更高的安全性，你可以在这里同时生成一个新的 Refresh Token，
  // 让旧的失效，然后把新的 Refresh Token 也发送给客户端。
  // 这会增加一些客户端逻辑的复杂度，但能有效防止 Refresh Token 被盗用。
  // 本次实现为简化起见，暂不包含此步骤。

  return response;
}