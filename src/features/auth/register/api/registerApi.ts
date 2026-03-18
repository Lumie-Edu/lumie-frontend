import { authClient } from '@/src/shared/api/base';
import { RegisterRequest, LoginResponse } from '@/entities/session';

export async function registerApi(
  request: RegisterRequest,
  tenantSlug?: string
): Promise<LoginResponse> {
  return authClient.post<LoginResponse>(
    '/v1/register',
    request,
    { skipAuth: true },
    tenantSlug
  );
}
