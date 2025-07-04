import { inject, injectable } from 'inversify';
import { eq, and } from 'drizzle-orm';
import { apiTokens, sessions, users } from '../../db/schema';
import { TYPES } from '../../core/di.types';
import type { DbInstance } from '../../db/connection';
import { auth } from '../../auth/config';

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

@injectable()
export class AuthService {
  constructor(@inject(TYPES.Db) private readonly db: DbInstance) {}

  async getAuthFromRequest(request: Request): Promise<AuthSession | null> {
    const headers = request.headers;

    console.log('🔍 Auth request debug:');
    console.log('  - Cookie header present:', !!headers.get('cookie'));
    console.log('  - Auth header present:', !!headers.get('authorization'));

    const authHeader = headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const apiAuth = await this.validateApiToken(token);
      if (apiAuth) {
        console.log('✅ API token auth successful for user:', apiAuth.user.email);
        return apiAuth;
      } else {
        console.log('❌ API token validation failed');
      }
    }

    try {
      const session = await auth.api.getSession({ headers });
      if (session?.user) {
        console.log('✅ Session auth successful for user:', session.user.email);
        return {
          user: session.user as AuthUser,
          session: session.session,
          authType: 'session',
          permissions: ['read', 'write', 'admin'],
        };
      } else {
        console.log('❌ No valid session found');
      }
    } catch (error) {
      console.log('❌ Session auth failed:', error);
    }

    console.log('❌ No valid authentication found');
    return null;
  }

  private async validateApiToken(token: string): Promise<AuthSession | null> {
    try {
      const apiTokenResult = await this.db
        .select({
          apiToken: apiTokens,
          user: users,
        })
        .from(apiTokens)
        .innerJoin(users, eq(apiTokens.userId, users.id))
        .where(eq(apiTokens.token, token))
        .limit(1);

      const result = apiTokenResult[0];
      if (result?.user && result?.apiToken) {
        await this.db
          .update(apiTokens)
          .set({ lastUsedAt: new Date().toISOString() })
          .where(eq(apiTokens.id, result.apiToken.id));

        return {
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
          },
          authType: 'api-token',
          permissions: result.apiToken.permissions || ['read', 'write'],
        };
      }
    } catch (error) {
      console.error('API token validation error:', error);
    }

    return null;
  }

  generateApiToken(): string {
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    return Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  hasPermission(auth: AuthSession, permission: string): boolean {
    if (auth.authType === 'session') {
      return true;
    }
    return auth.permissions?.includes(permission) || false;
  }
}
