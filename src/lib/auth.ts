import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { User } from '@/lib/definitions';

const ACCESS_TOKEN_SECRET_KEY = process.env.JWT_ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET_KEY = process.env.JWT_REFRESH_TOKEN_SECRET!;
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN!;
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN!;

if (!ACCESS_TOKEN_SECRET_KEY || !REFRESH_TOKEN_SECRET_KEY || !ACCESS_TOKEN_EXPIRES_IN || !REFRESH_TOKEN_EXPIRES_IN) {
  throw new Error('Missing JWT secret or expiration in environment variables');
}

const getSecretKey = (secret: string) => new TextEncoder().encode(secret);

/**
 * 【新增】只签发一个新的 Access Token.
 */
export async function signAccessToken(payload: { userId: string; username:string; role: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRES_IN)
    .sign(getSecretKey(ACCESS_TOKEN_SECRET_KEY));
}


/**
 * 为指定用户生成 Access Token 和 Refresh Token
 */
export async function signTokens(user: Pick<User, 'id' | 'role'| 'username'>) {
  const payload = { userId: user.id, username: user.username, role: user.role };

  const accessToken = await signAccessToken(payload); // 复用上面的新函数

  const refreshToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRES_IN)
    .sign(getSecretKey(REFRESH_TOKEN_SECRET_KEY));

  return { accessToken, refreshToken };
}

/**
 * 验证 Token 并返回其 payload
 */
export async function verifyToken<T extends JWTPayload>(token: string, secret: 'access' | 'refresh'): Promise<T | null> {
  const secretKeyString = secret === 'access' ? ACCESS_TOKEN_SECRET_KEY : REFRESH_TOKEN_SECRET_KEY;
  try {
    const { payload } = await jwtVerify<T>(token, getSecretKey(secretKeyString));
    return payload;
  } catch (error) {
    console.log("verify token error:",error);
    return null;
  }
}