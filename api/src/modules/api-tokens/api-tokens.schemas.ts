import { t } from 'elysia';
import { createInsertSchema, createSelectSchema } from 'drizzle-typebox';
import { apiTokens } from '../../db/schema';

// Generate schemas from database tables
export const CreateApiTokenSchema = t.Object({
  name: t.String({ minLength: 1, maxLength: 100 }),
  permissions: t.Optional(t.Array(t.String())),
  expiresAt: t.Optional(t.String()),
});

export const UpdateApiTokenSchema = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
});

export const ApiTokenSelectSchema = t.Object({
  id: t.String(),
  userId: t.String(),
  name: t.String(),
  permissions: t.Union([t.Array(t.String()), t.Null()]),
  lastUsedAt: t.Union([t.String(), t.Null()]),
  expiresAt: t.Union([t.String(), t.Null()]),
  createdAt: t.String(),
  updatedAt: t.String(),
});

// Additional schemas that don't directly map to database tables
export const TokenIdSchema = t.Object({
  tokenId: t.String(),
});

export const CreateTokenResponseSchema = t.Object({
  token: ApiTokenSelectSchema,
  tokenValue: t.String(),
  message: t.String(),
});

export const ErrorResponseSchema = t.Object({
  error: t.String(),
});
