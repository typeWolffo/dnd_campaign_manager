import { inject, injectable } from 'inversify';
import { TYPES } from '../../core/di.types';
import { ApiTokensRepository, type CreateApiTokenData, type UpdateApiTokenData, type ApiTokenWithoutSecret } from './api-tokens.repository';
import { AuthService } from '../auth/auth.service';

export interface CreateTokenRequest {
  name: string;
  permissions?: string[];
  expiresAt?: string;
}

export interface CreateTokenResponse {
  token: ApiTokenWithoutSecret;
  tokenValue: string;
  message: string;
}

export interface UpdateTokenRequest {
  name?: string;
}

@injectable()
export class ApiTokensService {
  constructor(
    @inject(TYPES.ApiTokensRepository) private readonly apiTokensRepository: ApiTokensRepository,
    @inject(TYPES.AuthService) private readonly authService: AuthService
  ) {}

  async getUserTokens(userId: string): Promise<ApiTokenWithoutSecret[]> {
    return await this.apiTokensRepository.findByUserId(userId);
  }

  async createToken(userId: string, request: CreateTokenRequest): Promise<CreateTokenResponse> {
    const tokenValue = this.authService.generateApiToken();

    const createData: CreateApiTokenData = {
      userId,
      token: tokenValue,
      name: request.name,
      permissions: request.permissions || ['read', 'write'],
      expiresAt: request.expiresAt || null,
    };

    const result = await this.apiTokensRepository.create(createData);

    return {
      token: result.token,
      tokenValue: result.tokenValue,
      message: "API token created successfully. Save this token - it won't be shown again!",
    };
  }

  async updateToken(tokenId: string, userId: string, request: UpdateTokenRequest): Promise<ApiTokenWithoutSecret> {
    const updatedToken = await this.apiTokensRepository.update(tokenId, userId, request);

    if (!updatedToken) {
      throw new Error('Token not found');
    }

    return updatedToken;
  }

  async deleteToken(tokenId: string, userId: string): Promise<{ message: string }> {
    const deleted = await this.apiTokensRepository.delete(tokenId, userId);

    if (!deleted) {
      throw new Error('Token not found');
    }

    return { message: 'API token deleted successfully' };
  }

  async revokeAllTokens(userId: string): Promise<{ message: string; revokedCount: number }> {
    const revokedCount = await this.apiTokensRepository.deleteAllByUserId(userId);

    return {
      message: `${revokedCount} API token(s) revoked successfully`,
      revokedCount,
    };
  }
}
