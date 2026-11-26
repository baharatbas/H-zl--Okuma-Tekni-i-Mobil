/**
 * Okuma taktikleri: kurstaki taktik derslerinin içeriği. Metinler bu proje için yazılmıştır.
 * Vaatler bilinçli olarak ölçülüdür: araştırmalar hız ile anlama arasında bir denge olduğunu,
 * anlayarak hızlanmanın düzenli okuma ve alıştırmayla kademeli geldiğini gösterir
 * (Rayner ve ark., 2016, Psychological Science in the Public Interest).
 */
import type { ExerciseKey } from '../core/exercises/types';

export const TACTIC_PREFIX = 'tactic:';

export interface Tactic {
  key: string;
  title: string;
  /** Ünite kartında ve ders başında görünen hedef. */
  goal: string;
  steps: string[];
  /** Taktiğin sınırı ya da sık yapılan hata. */
  caution: string;
  /** Derste hemen ardından yapılacak küçük görev. */
  task: string;
  /** Taktiği pekiştiren egzersiz. */
  exercise: ExerciseKey;
}

export const TACTICS: Tactic[] = [
  {
    key: 'preview',
    title: 'Önce göz at',
    goal: 'Okumaya başlamadan metnin haritasını çıkarırsın.',
    steps: ['Başlığı oku ve metnin neyi anlatacağını tahmin et.', 'İlk ve son cümleye bak.', 'Sayılara, özel adlara ve tekrar eden sözcüklere göz gezdir.', 'Kendine bir soru sor, sonra baştan oku.'],
    caution: 'Göz atmak okumanın yerini tutmaz; yalnızca okumaya hazırlar.',
    task: 'Sıradaki metinde okumadan önce konusunu tek cümleyle tahmin et.',
    exercise: 'skim_read',
  },
  {
    key: 'pointer',
    title: 'Rehberle okuma',
    goal: 'Satırı parmak ya da imleçle izleyerek ritmini korursun.',
    steps: ['Parmağını ya da bir kalemi satırın altında tut.', 'Rehberi duraksamadan, sabit bir hızla ilerlet.', 'Gözlerin rehberi izlesin; satır sonunda hızlıca alt satıra geç.', 'Anlaman bozulursa rehberi yavaşlat.'],
    caution: 'Rehber bir tempo aracıdır; anlamadan hızlı kaydırmak kazanç sağlamaz.',
    task: 'Bugün basılı bir paragrafı parmağınla izleyerek oku.',
    exercise: 'zigzag_horizontal',
  },
  {
    key: 'chunking',
    title: 'Kelime gruplarıyla okuma',
    goal: 'Tek tek kelimeler yerine anlam öbeklerini kavramaya çalışırsın.',
    steps: ['Birlikte anlam taşıyan sözcükleri bir grup say: "yağmurlu bir sabah".', 'Her grupta kısa bir duraklama yap.', 'İki kelimelik gruplarla başla, rahatlayınca üçe çık.', 'Hızlı Oku ekranında "Parça" birimini dene.'],
    caution: 'Grup büyüdükçe anlam kaçıyorsa grubu küçült.',
    task: 'Sıradaki egzersizde her bloğu tek bakışta görmeye çalış.',
    exercise: 'word_blocks',
  },
  {
    key: 'regression',
    title: 'Geri dönüşü bilinçli yap',
    goal: 'Alışkanlıkla geri dönmeyi, gerçekten gerektiğinde dönmekten ayırırsın.',
    steps: ['Okurken geri döndüğün anları fark et.', 'Cümleyi anladıysan ilerle.', 'Anlamadıysan çekinmeden dön ve yeniden oku.', 'Okunan satırları bir kâğıtla kapatmayı kolay metinlerde dene.'],
    caution: 'Geri dönmek her zaman hata değildir; anlamayı onarmanın yoludur.',
    task: 'Sıradaki metinde yalnızca anlamadığın yerde geri dön.',
    exercise: 'rsvp_repeat',
  },
  {
    key: 'inner-voice',
    title: 'İç sesle tempo',
    goal: 'İç sesin her kelimeyi ağır ağır söylemesine bağlı kalmamayı denersin.',
    steps: ['Dudaklarını kıpırdatmadan oku.', 'Kolay metinlerde gözlerini iç sesinden biraz önde götür.', 'Bağlaç ve eklerde oyalanma; ana sözcüklere yönel.', 'Zor bir cümlede iç sesinle yavaşlamaktan çekinme.'],
    caution: 'İç sesi tamamen susturmak gerekmez; özellikle zor metinlerde anlamaya yardım eder.',
    task: 'Sıradaki egzersizde sayıları söylemeden, görüntü olarak tutmayı dene.',
    exercise: 'flash_numbers',
  },
  {
    key: 'skim-scan',
    title: 'Göz gezdirme ve tarama',
    goal: 'Ana fikri bulmak ile belirli bilgiyi aramak arasındaki farkı kullanırsın.',
    steps: ['Ana fikir için: başlık, ilk cümleler ve sonuç cümlesine bak.', 'Belirli bilgi için: aradığın sözcüğün biçimini aklında tut.', 'Satırları atlayarak yalnızca o biçimi ara.', 'Bulunca çevresindeki cümleyi dikkatle oku.'],
    caution: 'Sözleşme, ilaç açıklaması gibi metinlerde tarama yetmez; tamamını oku.',
    task: 'Sıradaki egzersizde aradığın kelimenin yalnızca şekline odaklan.',
    exercise: 'scan_search',
  },
  {
    key: 'signals',
    title: 'İşaret sözcükleri',
    goal: 'Bağlaçlardan yazının yönünü önceden sezersin.',
    steps: ['"Ama, oysa, ancak" görünce karşıt bir düşünce bekle.', '"Çünkü" nedeni, "bu yüzden" sonucu haber verir.', '"Örneğin" ardından gelen ayrıntıdır.', '"Kısacası" ana düşünceyi toparlar; burada yavaşla.'],
    caution: 'Tek bir bağlaca bakıp sonuç çıkarma; cümlenin tamamını gör.',
    task: 'Sıradaki metinde karşıtlık bildiren bir sözcük bul.',
    exercise: 'line_scan',
  },
  {
    key: 'recall',
    title: 'Kapat ve hatırla',
    goal: 'Okuduğunu kendi sözlerinle geri çağırarak kalıcı kılarsın.',
    steps: ['Okumadan önce metne bir soru sor.', 'Okurken bu sorunun yanıtını ara.', 'Bitince metne bakmadan üç cümleyle özetle.', 'Takıldığın yeri açıp kontrol et.'],
    caution: 'Metni yeniden bakarak tekrar etmek, hatırlamaya çalışmak kadar sınayıcı değildir.',
    task: 'Sıradaki metinden sonra teste geçmeden üç cümlelik özet kur.',
    exercise: 'synonym_match',
  },
];

export function findTactic(contentRef: string): Tactic | null {
  if (!contentRef.startsWith(TACTIC_PREFIX)) return null;
  const key = contentRef.slice(TACTIC_PREFIX.length);
  return TACTICS.find((tactic) => tactic.key === key) ?? null;
}
