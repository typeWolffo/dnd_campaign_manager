import { Elysia, t, type Context } from 'elysia';
import { db } from '../db/connection';
import { apiTokens } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { generateApiToken, getAuthFromRequest } from '../lib/auth-middleware';

const CreateTokenSchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 100 }),
  permissions: t.Optional(t.Array(t.String())),
  expiresAt: t.Optional(t.String()),
});

const UpdateTokenSchema = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
});

export const apiTokensRouter = new Elysia({ prefix: "/api-tokens" })
  .derive(async ({ request }: Context) => {
    const authSession = await getAuthFromRequest(request);
    return { auth: authSession };
  })

  // Get all user's API tokens
  .get("/", async ({ auth }) => {
    if (!auth?.user) {
      throw new Error("Unauthorized");
    }

    const tokens = await db
      .select({
        id: apiTokens.id,
        name: apiTokens.name,
        permissions: apiTokens.permissions,
        lastUsedAt: apiTokens.lastUsedAt,
        expiresAt: apiTokens.expiresAt,
        createdAt: apiTokens.createdAt,
        // Don't return the actual token for security
      })
      .from(apiTokens)
      .where(eq(apiTokens.userId, auth.user.id))
      .orderBy(desc(apiTokens.createdAt));

    return { tokens };
  })

  // Create new API token
  .post("/", async ({ auth, body }) => {
    if (!auth?.user) {
      throw new Error("Unauthorized");
    }

    const token = generateApiToken();

    const newToken = await db
      .insert(apiTokens)
      .values({
        userId: auth.user.id,
        token,
        name: body.name,
        permissions: body.permissions || ['read', 'write'],
        expiresAt: body.expiresAt || null,
      })
      .returning({
        id: apiTokens.id,
        name: apiTokens.name,
        permissions: apiTokens.permissions,
        expiresAt: apiTokens.expiresAt,
        createdAt: apiTokens.createdAt,
      });

    return {
      token: newToken[0],
      // Return the actual token value only once during creation
      tokenValue: token,
      message: "API token created successfully. Save this token - it won't be shown again!",
    };
  }, {
    body: CreateTokenSchema,
  })

    // Update API token (name only)
  .patch("/:tokenId", async ({ auth, params: { tokenId }, body }) => {
    if (!auth?.user) {
      throw new Error("Unauthorized");
    }

    const updatedToken = await db
      .update(apiTokens)
      .set({
        name: body.name,
        updatedAt: new Date().toISOString(),
      })
      .where(and(
        eq(apiTokens.id, tokenId),
        eq(apiTokens.userId, auth.user.id)
      ))
      .returning({
        id: apiTokens.id,
        name: apiTokens.name,
        permissions: apiTokens.permissions,
        lastUsedAt: apiTokens.lastUsedAt,
        expiresAt: apiTokens.expiresAt,
        createdAt: apiTokens.createdAt,
      });

    if (updatedToken.length === 0) {
      throw new Error("Token not found");
    }

    return { token: updatedToken[0] };
  }, {
    params: t.Object({ tokenId: t.String() }),
    body: UpdateTokenSchema,
  })

  // Delete API token
  .delete("/:tokenId", async ({ auth, params: { tokenId } }) => {
    if (!auth?.user) {
      throw new Error("Unauthorized");
    }

    const deleted = await db
      .delete(apiTokens)
      .where(and(
        eq(apiTokens.id, tokenId),
        eq(apiTokens.userId, auth.user.id)
      ))
      .returning({ id: apiTokens.id });

    if (deleted.length === 0) {
      throw new Error("Token not found");
    }

    return { message: "API token deleted successfully" };
  }, {
    params: t.Object({ tokenId: t.String() }),
  })

  // Revoke all API tokens for user
  .delete("/", async ({ auth }) => {
    if (!auth?.user) {
      throw new Error("Unauthorized");
    }

    const deleted = await db
      .delete(apiTokens)
      .where(eq(apiTokens.userId, auth.user.id))
      .returning({ id: apiTokens.id });

    return {
      message: `${deleted.length} API token(s) revoked successfully`,
      revokedCount: deleted.length
    };
  });
