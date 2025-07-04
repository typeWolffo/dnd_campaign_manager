import Elysia, { t } from 'elysia';
import { ApiTokensService, type CreateTokenRequest, type UpdateTokenRequest } from './api-tokens.service';
import { AuthService } from '../auth/auth.service';
import { createAuthPlugin } from '../../core/auth/auth.plugin';
import {
  CreateApiTokenSchema,
  UpdateApiTokenSchema,
  TokenIdSchema,
  ApiTokenSelectSchema,
  CreateTokenResponseSchema,
  ErrorResponseSchema
} from './api-tokens.schemas';

export const createApiTokensController = (apiTokensService: ApiTokensService, authService: AuthService) =>
  new Elysia({ prefix: '/api-tokens', name: 'api-tokens-controller' })
    .use(createAuthPlugin(authService))
    .get('/', async ({ user }) => {
      const tokens = await apiTokensService.getUserTokens(user.id);
      return { tokens };
    }, {
      auth: true,
      response: {
        200: t.Object({
          tokens: t.Array(ApiTokenSelectSchema)
        }),
        401: ErrorResponseSchema
      },
      detail: {
        tags: ['API Tokens'],
        summary: 'Get user API tokens',
        description: 'Get all API tokens for the authenticated user'
      }
    })
    .post('/', async ({ user, body }) => {
      return await apiTokensService.createToken(user.id, body);
    }, {
      auth: true,
      body: CreateApiTokenSchema,
      response: {
        200: CreateTokenResponseSchema,
        401: ErrorResponseSchema
      },
      detail: {
        tags: ['API Tokens'],
        summary: 'Create API token',
        description: 'Create a new API token'
      }
    })
    .patch('/:tokenId', async ({ user, params: { tokenId }, body }) => {
      const token = await apiTokensService.updateToken(tokenId, user.id, body);
      return { token };
    }, {
      auth: true,
      params: TokenIdSchema,
      body: UpdateApiTokenSchema,
      response: {
        200: t.Object({ token: ApiTokenSelectSchema }),
        401: ErrorResponseSchema,
        404: ErrorResponseSchema
      },
      detail: {
        tags: ['API Tokens'],
        summary: 'Update API token',
        description: 'Update an existing API token (name only)'
      }
    })
    .delete('/:tokenId', async ({ user, params: { tokenId } }) => {
      return await apiTokensService.deleteToken(tokenId, user.id);
    }, {
      auth: true,
      params: TokenIdSchema,
      response: {
        200: t.Object({ message: t.String() }),
        401: ErrorResponseSchema,
        404: ErrorResponseSchema
      },
      detail: {
        tags: ['API Tokens'],
        summary: 'Delete API token',
        description: 'Delete a specific API token'
      }
    })
    .delete('/', async ({ user }) => {
      return await apiTokensService.revokeAllTokens(user.id);
    }, {
      auth: true,
      response: {
        200: t.Object({
          message: t.String(),
          revokedCount: t.Number()
        }),
        401: ErrorResponseSchema
      },
      detail: {
        tags: ['API Tokens'],
        summary: 'Revoke all tokens',
        description: 'Revoke all API tokens for the authenticated user'
      }
    });
