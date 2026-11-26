# Hızlı Okuma

Türkçe, anlayarak hızlı okuma eğitimi veren Expo (React Native + TypeScript) uygulaması. iOS ve Android.
Tüm veriler cihazda SQLite'ta tutulur; sunucu ve hesap yoktur.

## Kurulum

Gereksinimler: Node.js 20+ ve npm. iOS için Xcode, Android için Android Studio (ya da EAS Build).

```bash
npm install
```

Bağımlılıkları Expo SDK ile uyumlu tutmak için paket eklerken `npx expo install <paket>` kullanın.

## Çalıştırma

```bash
npm run start      # geliştirme sunucusu (QR ile Expo Go veya dev build)
npm run ios        # iOS simülatör (macOS + Xcode)
npm run android    # Android emülatör
npm run web        # yalnızca önizleme; SQLite ve bildirimler web'de tam çalışmaz
```

Expo Go yalnızca paketlediği native modülleri içerir. Bu projedeki tüm native modüller (expo-sqlite, expo-notifications, expo-haptics, reanimated) Expo Go'da çalışır; yine de dağıtıma yakın test için bir development build önerilir:

```bash
npx expo run:ios       # yerel build (Xcode gerekir)
npx expo run:android   # yerel build (Android SDK gerekir)
```

## Kalite kontrolleri

```bash
npm test           # birim + veritabanı entegrasyon testleri (Jest, gerçek SQLite)
npm run typecheck  # tsc --noEmit
npx eslint .       # lint
npx expo-doctor    # bağımlılık ve yapılandırma kontrolü
```

## Proje yapısı

```
src/
  app/                   Expo Router ekranları (yalnızca UI ve yönlendirme)
    _layout.tsx          kök navigasyon, veritabanı açılışı, tema
    index.tsx            seviye yoksa /welcome, varsa /(tabs)
    welcome.tsx          ilk açılış
    level-test.tsx       seviye tespiti (ReadingTest bileşeni)
    settings.tsx         tema, erişilebilirlik, hatırlatıcı, kurs yönetimi
    (tabs)/              Ana Sayfa, Kurs, Egzersiz, Kütüphane, İlerleme
    exercise/[key].tsx   egzersiz: ayar → oyun → sonuç
    reader/[id].tsx      Hızlı Oku (kelime / parça / blok, akıllı & serbest mod)
    test/[id].tsx        metin testi (WPM + anlama oranı)
    library/[id].tsx     metin detayı
    library/edit.tsx     metin ekle/düzenle, manuel soru ekleme
  core/                  SAF mantık (UI ve DB'den bağımsız, birim testli)
    metrics.ts           WPM, anlama oranı, doğruluk
    levels.ts            seviye belirleme ve seviye parametreleri
    course.ts            kişisel kurs üretimi ve kilit açma
    reader.ts            Hızlı Oku zamanlaması (kelime/parça/blok)
    testScoring.ts       okuma testi değerlendirmesi
    streak.ts            günlük hedef ve seri
    exercises/           her egzersiz için üretim (generate) + değerlendirme (summarize)
    settings.ts          uygulama ayarları ve varsayılanları
    rng.ts               tekrar üretilebilir rastgelelik (testler için)
  db/
    client.ts            veritabanını açar, migrasyon + tohumlama çalıştırır
    migrations.ts        sürümlü şema migrasyonları (schema_version)
    migrate.ts           migrasyon çalıştırıcısı
    seed.ts              yerleşik egzersiz/metin/test kayıtları (idempotent)
  repositories/          TÜM veri erişimi burada (ekranlar SQL çağırmaz)
  store/appStore.ts      Zustand: oturum içi durum (ayarlar, seviye)
  services/              haptics, bildirimler, etkinlik kaydı, kurs yönlendirme
  components/            ortak UI, grafik (react-native-svg), oyunlar, ReadingTest
  theme/                 açık/koyu tema, dokunma alanı ve yazı ölçeği
  i18n/                  Türkçe sözlük ve çeviri fonksiyonu t('anahtar')
  content/builtinTexts.ts  uygulamayla gelen özgün metinler ve sorular
  __tests__/             birim testleri ve veritabanı entegrasyon testi
```

Mimari kural: ekranlar yalnızca `repositories()` ve `core/` fonksiyonlarını çağırır. Bu sayede
ileride bir backend eklendiğinde repository arayüzlerini uzak uygulamalarla değiştirmek yeterlidir.

## Veri yapısı (SQLite, şema sürüm 1)

| Tablo | Amaç |
|---|---|
| `schema_version` | uygulanan migrasyonlar |
| `user_profile` | seviye, öğrenme modu (`smart`/`free`), ayarlar (JSON) |
| `courses`, `course_lessons` | kurs ve adımları (egzersiz → okuma → test); `is_completed`, `unlock_at` |
| `exercises`, `exercise_sessions` | egzersiz tanımları ve oturum sonuçları (skor, doğruluk, süre, hız, zorluk) |
| `library_texts` | yerleşik (`source='builtin'`, `key`) ve kullanıcı metinleri |
| `reading_sessions` | Hızlı Oku oturumları (WPM, süre, kelime sayısı) |
| `tests`, `test_questions`, `test_results` | seviye / okuma / özel testler, sorular ve sonuçlar |
| `daily_goals`, `streaks` | günlük hedef dakikaları ve seri |

### Migrasyon ekleme

`src/db/migrations.ts` içindeki listenin sonuna yeni bir sürüm ekleyin (`version: 2`, ...).
Mevcut sürümler değiştirilmez. `migrate()` yalnızca henüz uygulanmamış sürümleri, her biri
bir işlem içinde çalıştırır.

## Yeni egzersiz ekleme

1. `src/core/exercises/<ad>.ts`: `generate…` (tur üretimi) ve `summarize…` (değerlendirme) fonksiyonlarını yazın; birim testi ekleyin.
2. `src/core/exercises/types.ts` içindeki `ExerciseKey`'e anahtarı ekleyin.
3. `src/core/exercises/registry.ts` içine ad, açıklama, hedef ve varsayılan ayarları ekleyin.
4. `src/components/exercises/` altında (attention, perception, reading) oyunu `GameShell` düzeniyle yazın ve `games.tsx` içindeki `ExerciseGame` seçicisine bağlayın.
5. İsteğe bağlı: `src/core/course.ts` içinde kurs ünitelerine ekleyin.

## Notlar ve sınırlar

- **Göz takibi egzersizleri göz hareketini ölçmez.** Görsel dikkat ve hız çalışmasıdır; uygulama bunu böyle adlandırır.
- Seviye belirleme: etkin hız = WPM × anlama oranı. Anlama oranı %70'in altındaysa seviye bir kademe düşer (`core/levels.ts`).
- Akıllı modda Hızlı Oku hızı seviyeye göre önerilir; metin önerisi henüz yoktur.
- Hatırlatıcı yerel bildirimdir; izin reddedilirse ayarlarda uyarı gösterilir.
- Metinler özgün olarak yazılmıştır; "Net Hızlı Okuma" adı, logosu veya görselleri kullanılmaz.
- Yeni dil eklemek için `src/i18n/tr.ts` ile aynı yapıda bir sözlük ekleyip `src/i18n/index.ts` içindeki `locales` tablosuna kaydedin.

## İki çalışma yolu: kişisel gelişim ve sınava hazırlık

İlk açılışta (ya da Ayarlar'dan) seçilir. Tasarım aynıdır, içerik değişir.

- **Sınava hazırlık** (LGS, TYT/YKS, KPSS/ALES): 8 paragraf soru tipi. Kursta her tip için okuma egzersizi → teknik dersi → süreli soru.
- LGS 4 şıklı, diğerleri 5 şıklı gösterilir.
- Soru başına süre hedefleri (`src/core/exam/types.ts`) uygulamanın çalışma hedefidir; **resmî sınav süresi değildir**.
- Sorular ve teknikler `src/content/exam/` içindedir ve özgündür. Yeni soru eklemek için `questions.ts` dosyasına ekleyin; testler şık ve cevap tutarlılığını denetler.
- Denemeler `paragraph_attempts` tablosunda tutulur (şema sürüm 2).

## Kurs ilerlemesi

Kurstaki bir egzersiz adımı, 5 zorluk seviyesinin hepsi en az 60 puanla geçilince tamamlanır ve sıradaki adım açılır. Egzersiz sekmesinden oynanan oturumlar kurs adımına sayılmaz.

Genel kursta temel ünitelerin ardından taktik üniteleri gelir; kurs toplam 25 ünitedir (taktik dersi → egzersiz → okuma → test); içerik `src/content/tactics.ts` dosyasındadır. Süren kurslar, tamamlanan adımlar korunarak yeni derslerle uzatılır.

## Günlük antrenman

Ana sayfada her gün 5 görev vardır: görsel dikkat, kelime tanıma, okuma akıcılığı, anlama testi ve hafıza (20/20/30/30/20 XP). Plan `src/core/dailyPlan.ts` içinde üretilir ve `daily_tasks` tablosunda saklanır (şema sürümü 7). Egzersiz zorluğu son iki puana, metin uzunluğu son anlama oranına göre değişir; önceki günün egzersiz ve metinleri tekrar edilmez.

## Kelime oyunları

`word_find`, `phrase_group`, `missing_word`, `sentence_finish`, `word_memory`, `typo_find`, `word_hunt`, `real_or_fake`, `true_false`, `maze_read`, `word_chain`: mantık `src/core/exercises/wordGames.ts`, içerik `src/content/wordGames.ts`, ekranlar `src/components/exercises/words.tsx`. Bu çalışmalar genel okuma hızını ya da zekâyı artırdığı iddiasıyla sunulmaz.

## Ek egzersizler

Her kategoriye eklenen çalışmalar: `diagonal_jump`, `pacer_read`, `column_flow`, `stroop`, `odd_one`, `corsi`, `main_idea`, `sentence_order`, `scan_answer`, `antonym`, `category_odd`, `connector`. Mantık `src/core/exercises/moreGames.ts`, ekranlar `src/components/exercises/more.tsx`. Görsel dikkat çalışmalarının okuma hızını artırdığına dair kanıt karışıktır; uygulama böyle bir iddiada bulunmaz.

## Ölçüm sistemi

- Okuma hızı = kelime sayısı ÷ okuma süresi (sn) × 60; süre soruları kapsamaz. Sayım: boşlukla ayrılan, en az bir harf ya da rakam içeren parçalar.
- Etkin hız = hız × anlama oranı. Sınav yolunda anlama, kişisel gelişimde etkin hız öne çıkar.
- Seviye testi, uzunluk ve basit okunabilirlik ölçüsü yakın üç farklı metin kullanır (yaklaşık eşdeğerlik; metinler kalibre edilmemiştir). Her metinde 3 soru vardır.
- 600 üstü / 40 altı kelime/dk, hızlı geçip soruları kaçırma ve daha önce okunmuş metin ölçümleri işaretlenir (`test_results.flags`, şema 8) ve grafiğe alınmaz. Kurallar `src/core/assessment.ts` içindedir.

## Dört kullanıcı grubu

Öğrenci (`exam`), çalışan (`work`), kitap okuru (`books`) ve genel (`self`). Her grubun kursu, günlük antrenman havuzu, metin konuları, önerilen egzersizleri ve öne çıkan ölçüsü ayrıdır: `src/core/segments.ts`, `src/core/segmentCourse.ts`. Grup değişince kurs yeniden oluşturulur.

## İlk açılış

Hoş geldin → hedef → günlük süre (5/10/15/20 dk) → 3 metinli başlangıç testi → program. Seviye ve ölçümler test tamamen bitince kaydedilir; yarıda bırakılırsa akış yeniden açılır. Seçimler `user_profile.settings_json` içindedir, hesap gerekmez. Süre, günlük antrenmanın görev sayısını belirler (2/5/7/9).

## Premium

Beş sekmenin üstünde premium kartı görünür; `useIsPremium()` doğruysa gizlenir. Satın alma henüz bağlı değildir ve fiyatlar örnektir (`src/components/Premium.tsx`). RevenueCat eklenince `src/store/premiumStore.ts` içindeki `setPremium` yetki durumuna göre çağrılmalı, fiyatlar mağazadan okunmalıdır. RevenueCat yerel modül içerdiği için geliştirme derlemesi gerekir ve satın alma verisi sunucuya gider; gizlilik metni buna göre güncellenmelidir.

## Kalıcı veri

- Tüm kullanıcı verisi cihazdaki SQLite veritabanındadır (`hizlioku.db`): profil, ad, profil fotoğrafı (`profile_photo`), ayarlar, kurs ilerlemesi, test / okuma / egzersiz / paragraf sonuçları, günlük hedef ve seri.
- Şema sürümü 6. Taktik dersi, alıştırmasının 5 seviyesi geçilince onunla birlikte tamamlanır. Kütüphanede 70 hazır metin vardır (ek metinler `src/content/library/`); liste, metin gövdelerini yüklemeyen tek bir sorguyla gelir. Kullanıcı bir metni sildiğinde metin yalnızca gizlenir (`deleted_at`); geçmiş sonuçlar korunur.
- Okuma hızı grafiği yalnızca testlerden hesaplanır: kelime sayısı ÷ okuma süresi (sorular hariç). 20–1200 kelime/dk dışındaki ölçümler grafiğe alınmaz.
- Uygulama silinirse cihazdaki veriler de silinir (sunucu ve yedekleme yoktur).
