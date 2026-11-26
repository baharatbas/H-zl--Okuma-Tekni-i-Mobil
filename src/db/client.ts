import * as SQLite from 'expo-sqlite';
import type { SqlDb } from './types';
import { migrate } from './migrate';
import { seedBuiltins } from './seed';

const DB_NAME = 'hizlioku.db';
let instance: SqlDb | null = null;

/**
 * Veritabanını açar, migrasyonları uygular ve yerleşik içeriği tohumlar.
 * Uygulama açılışında bir kez çağrılır; sonraki çağrılar aynı bağlantıyı döner.
 */
export function getDb(): SqlDb {
  if (instance) return instance;
  const db = SQLite.openDatabaseSync(DB_NAME);
  instance = db as unknown as SqlDb;
  migrate(instance);
  seedBuiltins(instance);
  return instance;
}
