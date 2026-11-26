import type { SqlDb } from '../db/types';
import { Level, isLevel } from '../core/levels';
import { AppSettings, DEFAULT_SETTINGS, LearningMode, parseSettings } from '../core/settings';
import { localDateString } from '../core/streak';

export interface Profile {
  level: Level | null;
  mode: LearningMode;
  settings: AppSettings;
  createdAt: string | null;
}

export interface ProfileRepository {
  get(): Profile;
  ensure(): void;
  setLevel(level: Level): void;
  setMode(mode: LearningMode): void;
  saveSettings(patch: Partial<AppSettings>): AppSettings;
  /** Fotoğraf `data:` adresi olarak döner; yoksa null. */
  getPhoto(): string | null;
  setPhoto(photo: { mime: string; base64: string } | null): void;
}

export function createProfileRepository(db: SqlDb): ProfileRepository {
  return {
    getPhoto() {
      const row = db.getFirstSync<{ mime: string; data: string }>('SELECT mime, data FROM profile_photo WHERE id = 1');
      return row ? `data:${row.mime};base64,${row.data}` : null;
    },

    setPhoto(photo) {
      if (!photo) {
        db.runSync('DELETE FROM profile_photo WHERE id = 1');
        return;
      }
      db.runSync('INSERT OR REPLACE INTO profile_photo (id, mime, data, updated_at) VALUES (1, ?, ?, ?)', [photo.mime, photo.base64, new Date().toISOString()]);
    },

    ensure() {
      db.runSync(
        `INSERT OR IGNORE INTO user_profile (id, level, created_at, mode, settings_json)
         VALUES (1, NULL, ?, 'smart', ?)`,
        [new Date().toISOString(), JSON.stringify(DEFAULT_SETTINGS)],
      );
    },

    get() {
      this.ensure();
      const row = db.getFirstSync<{
        level: string | null;
        mode: LearningMode;
        settings_json: string;
        created_at: string;
      }>('SELECT level, mode, settings_json, created_at FROM user_profile WHERE id = 1');
      return {
        level: row && isLevel(row.level) ? row.level : null,
        mode: row?.mode ?? 'smart',
        settings: parseSettings(row?.settings_json),
        createdAt: row?.created_at ?? null,
      };
    },

    setLevel(level) {
      this.ensure();
      db.runSync('UPDATE user_profile SET level = ? WHERE id = 1', [level]);
    },

    setMode(mode) {
      this.ensure();
      db.runSync('UPDATE user_profile SET mode = ? WHERE id = 1', [mode]);
    },

    saveSettings(patch) {
      const merged = { ...this.get().settings, ...patch };
      db.runSync('UPDATE user_profile SET settings_json = ? WHERE id = 1', [JSON.stringify(merged)]);
      return merged;
    },
  };
}

/** Bugünün yerel tarihi; repository'ler tarih hesabını buradan alır. */
export function today(): string {
  return localDateString();
}
