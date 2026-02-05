import { z } from 'zod';

// Cell Style Schema
export const cellStyleSchema = z.object({
  backgroundColor: z.string().nullable().optional(),
  textColor: z.string().nullable().optional(),
  fontFamily: z.string().nullable().optional(),
  fontSize: z.number().nullable().optional(),
  bold: z.boolean().nullable().optional(),
  italic: z.boolean().nullable().optional(),
  underline: z.boolean().nullable().optional(),
  horizontalAlign: z.enum(['left', 'center', 'right']).nullable().optional(),
  verticalAlign: z.enum(['top', 'middle', 'bottom']).nullable().optional(),
  numberFormat: z.string().nullable().optional(),
});

export type CellStyle = z.infer<typeof cellStyleSchema>;

// Cell Data Schema
export const cellDataSchema = z.object({
  value: z.string().nullable().optional(),
  displayValue: z.string().nullable().optional(),
  formula: z.string().nullable().optional(),
  style: cellStyleSchema.nullable().optional(),
});

export type CellData = z.infer<typeof cellDataSchema>;

// Permission Schema
export const spreadsheetPermissionSchema = z.enum(['PRIVATE', 'VIEW_ONLY', 'EDITABLE']);
export type SpreadsheetPermission = z.infer<typeof spreadsheetPermissionSchema>;

// Spreadsheet Schema
export const spreadsheetSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  rowCount: z.number(),
  columnCount: z.number(),
  ownerId: z.number(),
  permission: spreadsheetPermissionSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Spreadsheet = z.infer<typeof spreadsheetSchema>;

// Spreadsheet Detail Schema (includes cells)
export const spreadsheetDetailSchema = spreadsheetSchema.extend({
  columnWidths: z.record(z.string(), z.number()).optional(),
  rowHeights: z.record(z.string(), z.number()).optional(),
  cells: z.record(z.string(), cellDataSchema).optional(),
});

export type SpreadsheetDetail = z.infer<typeof spreadsheetDetailSchema>;

// Cell Lock Schema
export const cellLockSchema = z.object({
  spreadsheetId: z.string(),
  cellAddress: z.string(),
  userId: z.string(),
  userName: z.string(),
  userColor: z.string(),
  acquiredAt: z.string(),
  expiresAt: z.string(),
});

export type CellLock = z.infer<typeof cellLockSchema>;

// Active User Schema
export const activeUserSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  color: z.string(),
  sessionId: z.string(),
});

export type ActiveUser = z.infer<typeof activeUserSchema>;

// Create Spreadsheet Input
export const createSpreadsheetSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다.').max(200, '이름은 200자를 초과할 수 없습니다.'),
  description: z.string().max(500, '설명은 500자를 초과할 수 없습니다.').optional(),
  rowCount: z.number().min(1).max(1000).optional(),
  columnCount: z.number().min(1).max(100).optional(),
  permission: spreadsheetPermissionSchema.optional(),
});

export type CreateSpreadsheetInput = z.infer<typeof createSpreadsheetSchema>;

// Update Spreadsheet Input
export const updateSpreadsheetSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  permission: spreadsheetPermissionSchema.optional(),
});

export type UpdateSpreadsheetInput = z.infer<typeof updateSpreadsheetSchema>;

// Update Cell Input
export const updateCellSchema = z.object({
  address: z.string().regex(/^[A-Z]+[0-9]+$/, '유효하지 않은 셀 주소입니다.'),
  value: z.string().nullable().optional(),
  formula: z.string().nullable().optional(),
  style: cellStyleSchema.nullable().optional(),
});

export type UpdateCellInput = z.infer<typeof updateCellSchema>;

// WebSocket Message Types
export type WebSocketMessageType =
  | 'CELL_LOCK_ACQUIRED'
  | 'CELL_LOCK_DENIED'
  | 'CELL_UPDATED'
  | 'CELL_UNLOCKED'
  | 'USER_JOINED'
  | 'USER_LEFT'
  | 'ERROR';

export interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType;
  payload: T;
}
