import { z } from 'zod';

export const permissionSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string().nullable().optional(),
});

export type Permission = z.infer<typeof permissionSchema>;

export interface PermissionsByCategory {
  category: string;
  permissions: Permission[];
}

export type AccessLevel = 'NONE' | 'READ' | 'WRITE';

export interface PositionPermissionEntry {
  permissionCode: string;
  accessLevel: AccessLevel;
}
