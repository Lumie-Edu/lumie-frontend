import { authClient } from '@/src/shared/api/base';
import { OwnerRegisterRequest, LoginResponse } from '@/entities/session';

export async function registerOwnerApi(request: OwnerRegisterRequest): Promise<LoginResponse> {
  return authClient.post<LoginResponse>('/v1/auth/register/owner', request, { skipAuth: true });
}
