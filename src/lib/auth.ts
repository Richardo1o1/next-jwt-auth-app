import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { User } from '@/lib/definitions';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN;
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_TOKEN_EXPIRES_IN;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET || !ACCESS_TOKEN_EXPIRES_IN 
     || !REFRESH_TOKEN_EXPIRES_IN) {
  throw new Error('Missing JWT secret or expiration in environment variables');
}

const getSecretKey = (secret: string) => new TextEncoder().encode(secret);

export async function signTokens(user: Pick<User, 'id' | 'role'>) {
  const payload = { userId: user.id, role: user.role };

  const accessToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRES_IN!)
    .sign(getSecretKey(ACCESS_TOKEN_SECRET!));

  const refreshToken = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRES_IN!)
    .sign(getSecretKey(ACCESS_TOKEN_SECRET!));

  return { accessToken, refreshToken };
}
 
/**
 * 验证 Token 并返回其 payload
 * 这个函数现在是异步的，因为 jwtVerify 是异步的
 */
export async function verifyToken<T extends JWTPayload>(token: string, secret: 'access' | 'refresh'): Promise<T | null> {
  const secretKey = secret === 'access' ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET;
  try {
    const { payload } = await jwtVerify<T>(token, getSecretKey(secretKey!));
    return payload;
  } catch (error) {
    console.error(`Token verification failed for ${secret} token:`, error);
    return null;
  }
}