/**
 * Testlerde gerçek SQLite davranışı için node:sqlite'ı expo-sqlite arayüzüne uyarlar.
 * Yalnızca testlerde kullanılır; uygulama kodu expo-sqlite'ı kullanır.
 */
import { DatabaseSync } from 'node:sqlite';
import type { SqlDb } from '../../db/types';

export function openMemoryDb(): SqlDb {
  const raw = new DatabaseSync(':memory:');
  const adapter: SqlDb = {
    execSync(source) {
      raw.exec(source);
    },
    runSync(source, params = []) {
      const res = raw.prepare(source).run(...(params as any[]));
      return { lastInsertRowId: Number(res.lastInsertRowid), changes: Number(res.changes) };
    },
    getAllSync<T>(source: string, params: (string | number | null)[] = []) {
      return raw.prepare(source).all(...(params as any[])) as T[];
    },
    getFirstSync<T>(source: string, params: (string | number | null)[] = []) {
      return (raw.prepare(source).get(...(params as any[])) as T | undefined) ?? null;
    },
    withTransactionSync(task) {
      raw.exec('BEGIN');
      try {
        task();
        raw.exec('COMMIT');
      } catch (e) {
        raw.exec('ROLLBACK');
        throw e;
      }
    },
  };
  return adapter;
}
