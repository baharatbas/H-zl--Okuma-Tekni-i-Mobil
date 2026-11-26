import { create } from 'zustand';
import { repositories } from '../repositories';
import { AppSettings, DEFAULT_SETTINGS, LearningMode } from '../core/settings';
import type { Level } from '../core/levels';
import { isTrackMismatch } from '../core/exam/course';

/**
 * Global uygulama durumu (Zustand). Kalıcı veriler repository katmanından okunur ve yazılır;
 * store yalnızca oturum içi önbellek ve arayüz durumunu tutar.
 */
interface AppState {
  ready: boolean;
  error: string | null;
  level: Level | null;
  mode: LearningMode;
  settings: AppSettings;
  /** Profil fotoğrafı (data adresi); veritabanından okunur. */
  photo: string | null;
  setPhoto: (photo: { mime: string; base64: string } | null) => void;
  hydrate: () => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  setLevel: (level: Level) => void;
  setMode: (mode: LearningMode) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  error: null,
  level: null,
  mode: 'smart',
  settings: { ...DEFAULT_SETTINGS },
  photo: null,

  setPhoto(photo) {
    const profile = repositories().profile;
    profile.setPhoto(photo);
    set({ photo: profile.getPhoto() });
  },

  hydrate() {
    try {
      const repos = repositories();
      const profile = repos.profile.get();
      // Kurs seçili yola uymuyorsa ve henüz ilerleme yoksa sessizce doğru kursla değiştirilir.
      const course = repos.course.getActive();
      if (course && profile.level && isTrackMismatch(course.lessons, profile.settings.purpose === 'exam') && !course.lessons.some((l) => l.isCompleted)) {
        repos.course.start(profile.level);
      }
      set({
        ready: true,
        error: null,
        level: profile.level,
        mode: profile.mode,
        settings: profile.settings,
        photo: repos.profile.getPhoto(),
      });
    } catch (e) {
      set({ ready: true, error: e instanceof Error ? e.message : String(e) });
    }
  },

  updateSettings(patch) {
    const saved = repositories().profile.saveSettings(patch);
    set({ settings: saved });
  },

  setLevel(level) {
    repositories().profile.setLevel(level);
    set({ level });
  },

  setMode(mode) {
    repositories().profile.setMode(mode);
    set({ mode });
  },
}));

export const getSettings = () => useAppStore.getState().settings;
