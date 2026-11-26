import type { ExerciseKey } from './types';

/** Her egzersiz için kısa, uygulanabilir bir okuma ipucu. */
export const EXERCISE_TIPS: Record<ExerciseKey, string> = {
  tracking: 'Gözünü noktaya sabitle, başını hareket ettirme. Hareketi çevresel olarak izlemeye çalış.',
  zigzag_horizontal: 'Ortadaki noktaya odaklan; kenarları sadece görüş alanınla algıla.',
  zigzag_vertical: 'Ritmi bozmadan dikey geçişleri takip et; her hedefi bir öncekinin devamı say.',
  star_hunter: 'Tüm yıldızı tek tek saymak yerine renk kümelerini bir bakışta gör.',
  peripheral_letters: 'Merkezdeki artıdan ayrılmadan çevreyi hisset. Tahmin etmekten çekinme.',
  flash_numbers: 'Sayıyı parça parça değil, bütün olarak gör; bir sonraki sayıya hazırlan.',
  word_blocks: 'Kelimeleri tek tek değil, anlamlı gruplar halinde yakala (örn. "güneş ve deniz" bir birimdir).',
  scan_search: 'Sol üstten başlayıp satır satır, sistemli tara. Gözün hedef harfe kendiliğinden kaysın.',
  skim_read: 'İlk ve son cümleleri, başlıkları ve kalın vurguları takip et; ayrıntıya girme.',
  synonym_match: 'Kelimeyi duyduğunda önce anlamını söyle, sonra şıklara bak. Tepki süresini düşür.',
  line_scan: 'Her satırın ilk birkaç kelimesine bak; hedef kelime genelde satırın ortasında olur.',
  schulte: 'Gözünü tablonun ortasında tut; sayıları başını oynatmadan, çevresel görüşünle ara.',
  rsvp_repeat: 'Kelimeleri akan bir ritim gibi oku; geri dönüp yeniden bakmadan akışta kal.',
  word_find: 'Sözcüğün başına ve sonuna birlikte bak; benzerler genelde sonda ayrılır.',
  phrase_group: 'Her grubu kafanda bir resme çevir; sözcükleri tek tek sayma.',
  missing_word: 'Şıklara bakmadan önce boşluğa kendi tahminini yap.',
  sentence_finish: '"Bu yüzden, oysa, çünkü" gibi sözcükler cümlenin yönünü gösterir.',
  word_memory: 'Kelimeleri birbirine bağlayan kısa bir hikâye kurmayı dene.',
  typo_find: 'Anlamı tahmin edip geçme; kelimenin harflerine de bak.',
  word_hunt: 'Önce kelimenin ilk harfini tara, sonra komşu harflere bak.',
  real_or_fake: 'Sözcüğün tamamını tek parça olarak gör; harf harf heceleme.',
  true_false: 'Son sözcüğe kadar oku; anlam çoğu zaman sonda değişir.',
  maze_read: 'Boşluktan önceki cümlenin ne anlattığını aklında tut.',
  word_chain: 'Önce tanıdık bir sözcüğü yakala; sınırlar ardından ortaya çıkar.',
};
