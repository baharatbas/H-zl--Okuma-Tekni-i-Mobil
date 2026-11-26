import type { SqlDb } from './types';
import { MIGRATIONS } from './migrations';

/** Bekleyen migrasyonları sırayla uygular. Dönen değer: bu çağrıda uygulanan sürüm sayısı. */
export function migrate(db: SqlDb, now: () => string = () => new Date().toISOString()): number {
  db.execSync('PRAGMA foreign_keys = ON;');
  // schema_version tablosu ilk migrasyonda oluşturulur; önce varlığını garanti et.
  db.execSync(
    'CREATE TABLE IF NOT EXISTS schema_version (version INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL);',
  );
  const row = db.getFirstSync<{ version: number | null }>('SELECT MAX(version) AS version FROM schema_version');
  const current = row?.version ?? 0;

  let applied = 0;
  for (const migration of MIGRATIONS) {
    if (migration.version <= current) continue;
    db.withTransactionSync(() => {
      for (const statement of migration.statements) db.execSync(statement);
      db.runSync('INSERT INTO schema_version (version, name, applied_at) VALUES (?, ?, ?)', [
        migration.version,
        migration.name,
        now(),
      ]);
    });
    applied++;
  }
  return applied;
}

export function currentSchemaVersion(db: SqlDb): number {
  const row = db.getFirstSync<{ version: number | null }>('SELECT MAX(version) AS version FROM schema_version');
  return row?.version ?? 0;
}
