export type EnvironmentType = 'pre' | 'test' | 'prod';

export interface ColumnDefinition {
  name: string;
  type: string;
  isPrimary?: boolean;
  nullable: boolean;
  comment: string;
  defaultValue?: string | null;
}

export interface TableSchema {
  name: string;
  comment: string;
  estimatedRows: number;
  columns: ColumnDefinition[];
}

export interface DatabaseEnv {
  id: string;
  name: string;
  code: string;
  env: EnvironmentType;
  host: string;
  port: number;
  databaseName: string;
  pingMs: number;
  description: string;
  tables: TableSchema[];
}

export interface QueryTab {
  id: string;
  title: string;
  sql: string;
  isModified?: boolean;
  isExecuting?: boolean;
  lastExecutedAt?: string;
}

export interface QueryResult {
  status: 'success' | 'error';
  columns: string[];
  rows: Record<string, any>[];
  durationMs: number;
  internalMs: number;
  gatewayMs: number;
  totalCount?: number;
  affectedRows?: number;
  error?: string;
  executedSql: string;
  timestamp: string;
  hospitalName: string;
  hospitalCode: string;
}

export interface QueryHistoryItem {
  id: string;
  hospitalId: string;
  hospitalName: string;
  hospitalCode: string;
  sql: string;
  durationMs: number;
  internalMs: number;
  gatewayMs: number;
  rowCount: number;
  timestamp: string;
  status: 'success' | 'error';
  errorMsg?: string;
}

export interface QuerySnippet {
  id: string;
  title: string;
  category: '基础表查询' | '字典维护' | '性能与排查' | '统计汇总';
  sql: string;
  description: string;
}

export interface QueryParams {
  maxRows: number;
  timeoutMs: number;
  queryCount: boolean;
}
