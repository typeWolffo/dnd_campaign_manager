import { Context } from 'elysia';
import { auth } from '../auth/config';
import { db } from '../db/connection';
import { apiTokens, users } from '../db/schema';
import { eq, and, or, isNull, gt } from 'drizzle-orm';
import crypto from 'crypto';

export interface AuthUser {
  id: string;
  name: string | null;
  email: string;
}

export interface AuthSession {
  user: AuthUser;
  session?: any;
  authType: 'session' | 'api-token';
  permissions?: string[];
}

export async function getAuthFromRequest(request: Request): Promise<AuthSession | null> {
  const headers = request.headers;

  // Try Bearer token first
  const authHeader = headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const apiAuth = await validateApiToken(token);
    if (apiAuth) {
      return apiAuth;
    }
  }

  // Fallback to session auth
  try {
    const session = await auth.api.getSession({ headers });
    if (session?.user) {
      return {
        user: session.user as AuthUser,
        session: session.session,
        authType: 'session',
        permissions: ['read', 'write', 'admin'], // Full permissions for session auth
      };
    }
  } catch (error) {
    console.log('Session auth failed:', error);
  }

  return null;
}

export async function validateApiToken(token: string): Promise<AuthSession | null> {
  try {
    const result = await db
      .select({
        userId: apiTokens.userId,
        permissions: apiTokens.permissions,
        expiresAt: apiTokens.expiresAt,
        tokenId: apiTokens.id,
        userName: users.name,
        userEmail: users.email,
      })
      .from(apiTokens)
      .innerJoin(users, eq(users.id, apiTokens.userId))
      .where(
        and(
          eq(apiTokens.token, token),
          or(
            isNull(apiTokens.expiresAt),
            gt(apiTokens.expiresAt, new Date())
          )
        )
      )
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const tokenData = result[0];

    // Update last used timestamp
    await db
      .update(apiTokens)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiTokens.id, tokenData.tokenId));

    return {
      user: {
        id: tokenData.userId,
        name: tokenData.userName,
        email: tokenData.userEmail,
      },
      authType: 'api-token',
      permissions: tokenData.permissions || ['read', 'write'],
    };
  } catch (error) {
    console.error('API token validation failed:', error);
    return null;
  }
}

export function generateApiToken(): string {
  // Generate secure random token
  return 'dnd_' + crypto.randomBytes(32).toString('hex');
}

export function hasPermission(auth: AuthSession, permission: string): boolean {
  if (auth.authType === 'session') {
    return true; // Session auth has all permissions
  }

  return auth.permissions?.includes(permission) || false;
}
