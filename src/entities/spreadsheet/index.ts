// Schema & Types
export {
  type Spreadsheet,
  type SpreadsheetDetail,
  type SpreadsheetPermission,
  type CellData,
  type CellStyle,
  type CellLock,
  type ActiveUser,
  type CreateSpreadsheetInput,
  type UpdateSpreadsheetInput,
  type UpdateCellInput,
  type WebSocketMessage,
  type WebSocketMessageType,
  spreadsheetSchema,
  spreadsheetDetailSchema,
  spreadsheetPermissionSchema,
  cellDataSchema,
  cellStyleSchema,
  cellLockSchema,
  activeUserSchema,
  createSpreadsheetSchema,
  updateSpreadsheetSchema,
  updateCellSchema,
} from './model/schema';

// Store
export {
  useSpreadsheetStore,
  useSpreadsheet,
  useCells,
  useCellLocks,
  useActiveUsers,
  useSelectedCell,
  useEditingCell,
  useIsConnected,
  useCell,
  useCellLock,
} from './model/store';

// API Queries
export {
  useSpreadsheets,
  useSpreadsheet as useSpreadsheetQuery,
  useSpreadsheetDetail,
  useCreateSpreadsheet,
  useUpdateSpreadsheet,
  useDeleteSpreadsheet,
  useUpdateCell,
  SPREADSHEET_QUERY_KEYS,
} from './api/queries';

// WebSocket
export {
  SpreadsheetWebSocketClient,
  getSpreadsheetWebSocketClient,
  type SpreadsheetWebSocketHandlers,
} from './api/websocket';
