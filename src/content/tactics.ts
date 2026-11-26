/**
 * Okuma taktikleri: kurstaki taktik derslerinin içeriği. Metinler bu proje için yazılmıştır.
 * Vaatler bilinçli olarak ölçülüdür: araştırmalar hız ile anlama arasında bir denge olduğunu,
 * anlayarak hızlanmanın düzenli okuma ve alıştırmayla kademeli geldiğini gösterir
 * (Rayner ve ark., 2016, Psychological Science in the Public Interest).
 * Kendini sınama ve aralıklı tekrar: Dunlosky ve ark., 2013. Çıkarım öğretimi: Elleman, 2011 ve
 * Rice & Wijekumar, 2024 meta-analizleri. Kâğıt-ekran farkı: Delgado ve ark., 2018.
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
  {
    key: 'purpose',
    title: 'Amaca göre hız',
    goal: 'Okuma hızını metne ve amacına göre ayarlarsın.',
    steps: ['Okumadan önce "Bu metinden ne istiyorum?" diye sor.', 'Genel fikir için hızlı, ayrıntı için yavaş oku.', 'Zor bölümde hızını düşür.', 'Tanıdık bölümde yeniden hızlan.'],
    caution: 'Her metni aynı hızda okumaya çalışma.',
    task: 'Sıradaki metin için okumadan önce amacını söyle.',
    exercise: 'true_false',
  },
  {
    key: 'question',
    title: 'Soru sorarak oku',
    goal: 'Metne soru yönelterek dikkatini yönlendirirsin.',
    steps: ['Başlığı bir soruya çevir.', 'Okurken yanıtı ara.', 'Yanıtı bulunca kendi sözlerinle söyle.', 'Yeni bir soru doğuyorsa onu da not et.'],
    caution: 'Sorun yanlış çıkarsa değiştir; metni soruya uydurma.',
    task: 'Sıradaki başlığı "neden" ya da "nasıl" sorusuna çevir.',
    exercise: 'scan_answer',
  },
  {
    key: 'main-idea',
    title: 'Ana fikri bul',
    goal: 'Ayrıntılardan ana düşünceyi ayırırsın.',
    steps: ['Her paragraftan sonra dur.', '"Yazar en çok ne demek istiyor?" diye sor.', 'Örnekleri ana fikirden ayır.', 'Tek cümlelik bir başlık öner.'],
    caution: 'Paragrafta geçen bir örneği ana fikir sanma.',
    task: 'Sıradaki metne kendi başlığını koy.',
    exercise: 'main_idea',
  },
  {
    key: 'inference',
    title: 'Çıkarım yap',
    goal: 'Açıkça yazılmayanı ipuçlarından sezersin.',
    steps: ['Metindeki ipuçlarını topla.', 'Bildiklerinle birleştir.', '"Bundan ne sonuç çıkar?" diye sor.', 'Her çıkarımı metindeki bir cümleye dayandır.'],
    caution: 'Metinde dayanağı olmayan yorum çıkarım sayılmaz.',
    task: 'Sıradaki metinde yazılmayan bir sonuç bul ve dayanağını göster.',
    exercise: 'sentence_finish',
  },
  {
    key: 'structure',
    title: 'Metnin yapısını gör',
    goal: 'Neden-sonuç, karşılaştırma ve sıralamayı fark edersin.',
    steps: ['İlk paragrafta metnin nasıl ilerlediğine bak.', 'Sıralama mı, karşılaştırma mı, neden-sonuç mu?', 'Geçiş sözcüklerini izle.', 'Yapıyı küçük bir şema gibi aklında tut.'],
    caution: 'Bir metinde birden fazla yapı bulunabilir.',
    task: 'Sıradaki metnin yapısını tek sözcükle adlandır.',
    exercise: 'sentence_order',
  },
  {
    key: 'vocab',
    title: 'Bağlamdan anlam çıkar',
    goal: 'Bilmediğin sözcüğü çevresinden tahmin edersin.',
    steps: ['Sözcüğün geçtiği cümleyi baştan oku.', 'Önceki ve sonraki cümleye bak.', 'Yerine uyabilecek bir sözcük dene.', 'Önemliyse sözlükten kontrol et.'],
    caution: 'Tahmin kesin bilgi değildir; kritik sözcüğü doğrula.',
    task: 'Bugün bir yeni sözcüğün anlamını önce tahmin et.',
    exercise: 'missing_word',
  },
  {
    key: 'monitor',
    title: 'Anlamanı izle',
    goal: 'Koptuğun anı fark edip onarırsın.',
    steps: ['Paragraf sonunda "Anladım mı?" diye sor.', 'Anlamadıysan nerede koptuğunu bul.', 'O bölümü yavaşça yeniden oku.', 'Gerekirse kendi örneğini kur.'],
    caution: 'Gözün ilerlemesi anladığın anlamına gelmez.',
    task: 'Sıradaki metinde her paragraftan sonra bir kez dur.',
    exercise: 'maze_read',
  },
  {
    key: 'self-explain',
    title: 'Kendine anlat',
    goal: 'Okuduğunu kendine açıklayarak boşlukları görürsün.',
    steps: ['Bir bölüm oku ve metni kapat.', 'Sanki birine anlatıyormuş gibi açıkla.', 'Takıldığın yeri işaretle.', 'O yeri açıp yeniden oku.'],
    caution: 'Cümleleri ezbere yinelemek açıklamak değildir.',
    task: 'Sıradaki metni iki cümleyle birine anlatır gibi söyle.',
    exercise: 'pacer_read',
  },
  {
    key: 'why',
    title: '"Neden?" diye sor',
    goal: 'Bilgiyi nedenleriyle ilişkilendirirsin.',
    steps: ['Önemli bir bilgi seç.', '"Bu neden böyle?" diye sor.', 'Yanıtı metinde ya da bildiklerinde ara.', 'Yeni bilgiyi eski bilgine bağla.'],
    caution: 'Yanıtı bilmiyorsan uydurma; araştırılacak soru olarak bırak.',
    task: 'Sıradaki metinden bir bilgi için "neden" sorusu sor.',
    exercise: 'connector',
  },
  {
    key: 'self-test',
    title: 'Kendini sına',
    goal: 'Tekrar okumak yerine hatırlamayı denersin.',
    steps: ['Metni bir kez dikkatle oku.', 'Kapat ve aklında kalanları yaz.', 'Kendine üç soru sor.', 'Yanlışlarını metinden kontrol et.'],
    caution: 'Zorlanman normaldir; hatırlama çabası öğrenmenin parçasıdır.',
    task: 'Sıradaki metinden sonra bakmadan üç bilgi say.',
    exercise: 'word_memory',
  },
  {
    key: 'spacing',
    title: 'Aralıklı tekrar',
    goal: 'Bilgiye aralıklarla dönerek kalıcılığını artırırsın.',
    steps: ['Okuduğun gün kısa bir özet çıkar.', 'Ertesi gün bakmadan hatırlamayı dene.', 'Birkaç gün sonra yeniden dene.', 'Zorlandığın kısma daha sık dön.'],
    caution: 'Tek oturumda art arda tekrar, aralıklı tekrarın yerini tutmaz.',
    task: 'Dün okuduğun bir metni bakmadan özetle.',
    exercise: 'corsi',
  },
  {
    key: 'focus',
    title: 'Odağını koru',
    goal: 'Dikkat dağıtıcıları azaltarak okursun.',
    steps: ['Telefonun bildirimlerini kapat.', 'Kısa bir süre ve hedef belirle.', 'Aklına gelen işleri bir kâğıda not et.', 'Süre bitince kısa mola ver.'],
    caution: 'Yorgunken uzun oturum yerine kısa oturum seç.',
    task: 'Sıradaki okumada tek bir şeye odaklan.',
    exercise: 'stroop',
  },
  {
    key: 'screen',
    title: 'Ekranda okurken',
    goal: 'Ekranda dikkatli okuma alışkanlığı kurarsın.',
    steps: ['Yazı boyutunu rahat göreceğin kadar büyüt.', 'Uzun metinde hızla kaydırıp geçme.', 'Bölüm sonlarında durup özetle.', 'Önemli ve uzun metinlerde basılı kopyayı düşün.'],
    caution: 'Araştırmalar kâğıtta küçük bir anlama üstünlüğü bildiriyor; etki küçük ve metne göre değişiyor.',
    task: 'Sıradaki metinde yarıda durup ne okuduğunu söyle.',
    exercise: 'column_flow',
  },
];

export function findTactic(contentRef: string): Tactic | null {
  if (!contentRef.startsWith(TACTIC_PREFIX)) return null;
  const key = contentRef.slice(TACTIC_PREFIX.length);
  return TACTICS.find((tactic) => tactic.key === key) ?? null;
}
