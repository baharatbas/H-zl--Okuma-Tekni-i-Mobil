/** expo-sqlite'ın senkron API'sinin kullanılan kısmı. Repository'ler yalnızca bu arayüze bağlıdır. */
export type SqlValue = string | number | null;

export interface SqlDb {
  execSync(source: string): void;
  runSync(source: string, params?: SqlValue[]): { lastInsertRowId: number; changes: number };
  getAllSync<T>(source: string, params?: SqlValue[]): T[];
  getFirstSync<T>(source: string, params?: SqlValue[]): T | null;
  withTransactionSync(task: () => void): void;
}
