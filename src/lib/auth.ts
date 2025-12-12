import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret');
const JWT_ALG = 'HS256';

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function comparePasswords(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword);
}

export async function createSession(userId: string, role: string, name: string, email: string) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const sessionPayload = { userId, role, name, email, exp: Math.floor(expiresAt.getTime() / 1000) };
  
  const session = await new SignJWT(sessionPayload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  cookies().set('token', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function getSession() {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as { userId: string; role: string; name: string; email: string; iat: number; exp: number };
    } catch (error) {
        console.error("Failed to verify session:", error);
        // Clear invalid cookie
        cookieStore.delete('token');
        return null;
    }
}

export function deleteSession() {
  cookies().delete('token');
}
