import { inject, injectable } from 'inversify';
import { eq, and, desc } from 'drizzle-orm';
import { apiTokens, type ApiToken, type NewApiToken } from '../../db/schema';
import { TYPES } from '../../core/di.types';
import type { DbInstance } from '../../db/connection';

export interface CreateApiTokenData {
  userId: string;
  token: string;
  name: string;
  permissions?: string[];
  expiresAt?: string | null;
}

export interface UpdateApiTokenData {
  name?: string;
}

export interface ApiTokenWithoutSecret extends Omit<ApiToken, 'token'> {}

@injectable()
export class ApiTokensRepository {
  constructor(@inject(TYPES.Db) private readonly db: DbInstance) {}

  async findByUserId(userId: string): Promise<ApiTokenWithoutSecret[]> {
    return await this.db
      .select({
        id: apiTokens.id,
        userId: apiTokens.userId,
        name: apiTokens.name,
        permissions: apiTokens.permissions,
        lastUsedAt: apiTokens.lastUsedAt,
        expiresAt: apiTokens.expiresAt,
        createdAt: apiTokens.createdAt,
        updatedAt: apiTokens.updatedAt,
      })
      .from(apiTokens)
      .where(eq(apiTokens.userId, userId))
      .orderBy(desc(apiTokens.createdAt));
  }

  async create(data: CreateApiTokenData): Promise<{ token: ApiTokenWithoutSecret; tokenValue: string }> {
    const [newToken] = await this.db
      .insert(apiTokens)
      .values({
        userId: data.userId,
        token: data.token,
        name: data.name,
        permissions: data.permissions || ['read', 'write'],
        expiresAt: data.expiresAt || null,
      })
      .returning({
        id: apiTokens.id,
        userId: apiTokens.userId,
        name: apiTokens.name,
        permissions: apiTokens.permissions,
        expiresAt: apiTokens.expiresAt,
        createdAt: apiTokens.createdAt,
        updatedAt: apiTokens.updatedAt,
        lastUsedAt: apiTokens.lastUsedAt,
      });

    return {
      token: newToken,
      tokenValue: data.token,
    };
  }

  async update(tokenId: string, userId: string, data: UpdateApiTokenData): Promise<ApiTokenWithoutSecret | null> {
    const [updatedToken] = await this.db
      .update(apiTokens)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(and(
        eq(apiTokens.id, tokenId),
        eq(apiTokens.userId, userId)
      ))
      .returning({
        id: apiTokens.id,
        userId: apiTokens.userId,
        name: apiTokens.name,
        permissions: apiTokens.permissions,
        lastUsedAt: apiTokens.lastUsedAt,
        expiresAt: apiTokens.expiresAt,
        createdAt: apiTokens.createdAt,
        updatedAt: apiTokens.updatedAt,
      });

    return updatedToken || null;
  }

  async delete(tokenId: string, userId: string): Promise<boolean> {
    const [deleted] = await this.db
      .delete(apiTokens)
      .where(and(
        eq(apiTokens.id, tokenId),
        eq(apiTokens.userId, userId)
      ))
      .returning({ id: apiTokens.id });

    return !!deleted;
  }

  async deleteAllByUserId(userId: string): Promise<number> {
    const deleted = await this.db
      .delete(apiTokens)
      .where(eq(apiTokens.userId, userId))
      .returning({ id: apiTokens.id });

    return deleted.length;
  }
}
