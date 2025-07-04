import Elysia from 'elysia';
import { AuthService } from '../../modules/auth/auth.service';

export const createAuthPlugin = (authService: AuthService) =>
  new Elysia({
    name: 'auth-plugin',
    seed: process.env.NODE_ENV,
  })
    .macro({
      auth: {
        async resolve({ status, request }) {
          const authSession = await authService.getAuthFromRequest(request);

          if (!authSession) return status(401);

          return {
            user: authSession.user,
            session: authSession.session,
            authType: authSession.authType,
            permissions: authSession.permissions,
          };
        },
      },
    });
