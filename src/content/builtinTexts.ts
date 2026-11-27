import { EXTRA_BUILTIN_TEXTS } from './builtinTextsExtra';
import { LIBRARY_TEXTS } from './library';
import { MEASUREMENT_QUESTIONS } from './measurementQuestions';
/**
 * Uygulamayla gelen özgün Türkçe okuma metinleri ve anlama soruları.
 * Metinler bu proje için yazılmıştır; başka kaynaklardan kopyalanmamıştır.
 * `key` alanı kurs adımlarında ve veritabanı tohumlamada kullanılır.
 */
export interface BuiltinQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface BuiltinText {
  key: string;
  title: string;
  body: string;
  questions: BuiltinQuestion[];
}

export const LEVEL_TEST_KEY = 'builtin-level-test';

const BASE_BUILTIN_TEXTS: BuiltinText[] = [
  {
    key: LEVEL_TEST_KEY,
    title: 'Seviye Tespit Metni: Şehir Kütüphanesi',
    body:
      'Mahallemizdeki kütüphane, yıllardır okurların buluşma noktası olmuştur. Binanın üst katındaki ' +
      'pencereler güneş alır ve sabahları sessizlik içinde kitap seçmek isteyenler için ideal bir ortam sunar. ' +
      'Kütüphanenin gönüllü ekibi, çocuklar için her hafta kısa hikâye saatleri düzenler. Bu etkinliklerde ' +
      'çocuklar kitapları elleriyle dokunarak tanır ve sorular sorarak yeni kelimeler öğrenir. Ayrıca yaşlı ' +
      'okurlar için büyük puntolu kitaplar ayrı bir rafta toplanmıştır. Son yıl yapılan bir anket, ziyaretçilerin ' +
      'çoğunun kütüphaneyi sadece ödünç kitap almak için değil, sakin bir çalışma alanı bulmak için tercih ettiğini ' +
      'gösterdi. Bu nedenle kütüphane saatleri uzatılmış ve çalışma masalarının sayısı artırılmıştır.',
    questions: [
      {
        question: 'Kütüphanenin çocuklar için düzenlediği etkinlik nedir?',
        options: ['Spor turnuvası', 'Haftalık kısa hikâye saati', 'Resim sergisi', 'Satranç kursu'],
        correctIndex: 1,
      },
      {
        question: 'Anket sonucunda kütüphane neyi değiştirdi?',
        options: ['Binanın rengini', 'Ödünç kitap sayısını azalttı', 'Saatlerini uzattı ve masaları artırdı', 'Giriş ücreti koydu'],
        correctIndex: 2,
      },
      {
        question: 'Büyük puntolu kitaplar nerede bulunuyor?',
        options: ['Girişteki vitrinde', 'Ayrı bir rafta', 'Bodrum katta', 'Çocuk bölümünde'],
        correctIndex: 1,
      },
    ],
  },
  {
    key: 'builtin-sea',
    title: 'Denizin Sesi',
    body:
      'Kıyıya vuran dalgalar her gün aynı ritimde gelir gibi görünür, oysa her biri rüzgârın hızına, suyun ' +
      'derinliğine ve dibin şekline göre farklıdır. Kumlu sahilde yürüyen biri bu farkı kolayca fark edebilir. ' +
      'Dalgalar sığ suda yükselip kırılırken köpük bırakır; açık denizde ise uzun ve yavaş kabarmalar halinde ' +
      'ilerler. Balıkçılar bu farkı yüzyıllardır gözlemler ve sabah çıkışlarını havaya bakarak planlar. ' +
      'Deniz kenarında yaşayanlar için dalgaların sesi bir uyku ilacı gibidir; çünkü beyin tekrarlayan sesleri ' +
      'zamanla bir arka plan olarak kabul eder.',
    questions: [
      {
        question: 'Dalgaların farklılığını etkileyen unsurlardan biri değildir?',
        options: ['Rüzgârın hızı', 'Suyun derinliği', 'Dibin şekli', 'Kumun renk tonu'],
        correctIndex: 3,
      },
      {
        question: 'Sığ suda dalgalar nasıl davranır?',
        options: ['Uzun ve yavaş kabarır', 'Yükselip kırılarak köpük bırakır', 'Tamamen durur', 'Geri çekilmez'],
        correctIndex: 1,
      },
      {
        question: 'Metne göre balıkçılar sabah çıkışlarını nasıl planlar?',
        options: ['Haritaya bakarak', 'Havaya bakarak', 'Radyoyu dinleyerek', 'Takvime bakarak'],
        correctIndex: 1,
      },
    ],
  },
  {
    key: 'builtin-city',
    title: 'Sabah Trafiği',
    body:
      'Büyük şehirlerde sabah saatleri bir orkestra gibidir: her ses bir diğerine karışır ama düzenin içinde kendi ' +
      'yerini bulur. Otobüs duraklarında bekleyenler, telefonlarında haberleri okur ya da birkaç dakikalık ' +
      'sessizliğin tadını çıkarır. Trafik ışıkları değiştikçe araçlar bir ileri bir geri kayar. Bu kalabalık ' +
      'düzenin arkasında ise çok sayıda planlama vardır. Ulaşım şirketleri kalkış aralıklarını yolcu yoğunluğuna ' +
      'göre ayarlar. Bisiklet yolları ise son yıllarda daha fazla kişinin işe bisikletle gitmesini sağladı. ' +
      'Yine de her sabah, bir kavşakta kısa bir gecikme herkesin gününü değiştirebilir.',
    questions: [
      {
        question: 'Metinde şehir sabahları neye benzetilmiştir?',
        options: ['Bir fabrikaya', 'Bir orkestraya', 'Bir pazara', 'Bir tiyatroya'],
        correctIndex: 1,
      },
      {
        question: 'Ulaşım şirketleri kalkış aralıklarını neye göre ayarlar?',
        options: ['Hava durumuna', 'Yolcu yoğunluğuna', 'Yakıt fiyatına', 'Şoför sayısına'],
        correctIndex: 1,
      },
      {
        question: 'Bisiklet yollarının etkisi nedir?',
        options: ['Trafik ışıklarını kaldırdı', 'Daha fazla kişinin bisikletle işe gitmesini sağladı', 'Otobüs sayısını azalttı', 'Duraklar kapandı'],
        correctIndex: 1,
      },
    ],
  },
  {
    key: 'builtin-garden',
    title: 'Balkon Bahçesi',
    body:
      'Küçük bir balkonda bile sebze yetiştirmek mümkündür. Önemli olan ışığı iyi kullanmak ve doğru saksıyı seçmektir. ' +
      'Güneş alan bir köşeye yerleştirilen domatesler, yeterli su ve düzenli gübreleme ile ilk meyvelerini birkaç ay ' +
      'içinde verebilir. Marul ve maydanoz gibi bitkiler daha az yer kaplar ve gölgeye karşı daha dayanıklıdır. ' +
      'Sulama konusunda en sık yapılan hata, toprağın üstü kuru görünürken gereğinden fazla su vermektir. ' +
      'Parmağı toprağa birkaç santim sokarak nemi kontrol etmek, bu hatayı büyük ölçüde önler.',
    questions: [
      {
        question: 'Bitkilerin iyi büyümesi için hangisi en önemlidir?',
        options: ['Yüksek sesli müzik', 'Işığı iyi kullanmak', 'Sık sık yer değiştirmek', 'Gece sulamak'],
        correctIndex: 1,
      },
      {
        question: 'Marul ve maydanoz hakkında metin ne söyler?',
        options: ['Çok yer kaplar', 'Gölgeye daha dayanıklıdır', 'Sadece kışın yetişir', 'Güneşi sevmez'],
        correctIndex: 1,
      },
      {
        question: 'En sık yapılan sulama hatası nedir?',
        options: ['Hiç su vermemek', 'Toprağın üstü kuru görünürken fazla su vermek', 'Yapraklara su püskürtmek', 'Sadece sabah sulamak'],
        correctIndex: 1,
      },
    ],
  },
  {
    key: 'builtin-history',
    title: 'Yolların Hikâyesi',
    body:
      'Eski uygarlıklar ticaret yollarıyla birbirine bağlanmıştı. Bu yollar yalnızca mal taşımakla kalmaz, fikirlerin, ' +
      'dillerin ve teknolojilerin de yayılmasını sağlardı. Bir kervan konaklama noktasına vardığında, yolcular hikâye ' +
      'anlatır, haber paylaşır ve yeni bilgiler edinirdi. Bu nedenle bazı konaklama noktaları zamanla büyük kültür ' +
      'merkezlerine dönüştü. Yolların bakımı ise yerel yönetimlerin ve tüccar birliklerinin ortak sorumluluğundaydı. ' +
      'Köprüler onarılır, kuyular temizlenir ve güvenlik için gözetleme kuleleri yapılırdı. Bugün modern otoyollar bu ' +
      'eski yolların izinden gider; çoğu zaman aynı vadileri ve geçitleri kullanarak.',
    questions: [
      {
        question: 'Ticaret yollarının yalnızca mal taşımadığı, neyin de yayıldığı söylenir?',
        options: ['Savaşların', 'Fikirlerin ve dillerin', 'Hastalıkların', 'Vergilerin'],
        correctIndex: 1,
      },
      {
        question: 'Bazı konaklama noktalarının zamanla dönüşmesinin nedeni nedir?',
        options: ['Büyük askerî üsse dönüşmeleri', 'Yolcuların hikâye ve bilgi paylaşması', 'Pazar fiyatlarının düşmesi', 'Yerel nüfusun göçü'],
        correctIndex: 1,
      },
      {
        question: 'Modern otoyollar hangi konuda eski yollara benzer?',
        options: ['Aynı vadileri ve geçitleri kullanır', 'Kervanlarla çalışır', 'Denizden geçer', 'Tamamen yeraltındadır'],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'builtin-science',
    title: 'Uykunun Gücü',
    body:
      'Uyku, beynin gün içinde topladığı bilgileri düzenlediği bir dönemdir. Öğrenilen yeni bir konu, uyku sırasında ' +
      'daha kalıcı hale gelebilir. Araştırmacılar bu süreçte bazı uyku evrelerinin özellikle önemli olduğunu düşünür. ' +
      'Yetersiz uyku ise dikkat süresini kısaltır ve karar vermeyi zorlaştırır. Bu nedenle sınava hazırlanan bir öğrencinin ' +
      'son gecesini uyumadan çalışması, genellikle beklenen faydayı sağlamaz. Düzenli bir uyku saati belirlemek, ' +
      'öğrenmeyi destekleyen en basit alışkanlıklardan biridir. Ayrıca yatmadan önce ekrana uzun süre bakmak, uykuya dalmayı ' +
      'geciktirebilir.',
    questions: [
      {
        question: 'Metne göre uyku sırasında beyinde ne olur?',
        options: ['Bilgiler silinir', 'Gün içinde öğrenilenler düzenlenir', 'Hafıza tamamen durur', 'Dikkat artar'],
        correctIndex: 1,
      },
      {
        question: 'Yetersiz uykunun etkisi nedir?',
        options: ['Dikkat süresini kısaltır', 'Hafızayı güçlendirir', 'Ritmi hızlandırır', 'Hiçbir etkisi yoktur'],
        correctIndex: 0,
      },
      {
        question: 'Yatmadan önce uzun süre ekrana bakmanın etkisi nedir?',
        options: ['Uykuya dalmayı geciktirebilir', 'Uykuyu derinleştirir', 'Gözleri dinlendirir', 'Rüyaları kaldırır'],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'builtin-travel',
    title: 'Dağ Köyü Yolculuğu',
    body:
      'Dağ köylerine giden yollar genellikle dar ve virajlıdır. Yolculuk sırasında manzara her dönüşte değişir: önce ' +
      'sık çam ormanları, sonra geniş bir vadi ve en sonunda taş evlerin sıralandığı köy meydanı. Köyün ana geçimi ' +
      'hayvancılık ve el emeğiyle üretilen peynirdir. Yaz aylarında gelen ziyaretçiler, köyün pazarında yerel ürünleri ' +
      'inceleyebilir. Ancak kış aylarında kar yolu kapatabilir, bu yüzden köy sakinleri stok yapmayı bir gelenek haline ' +
      'getirmiştir. Yolculuğa çıkmadan önce hava durumunu kontrol etmek ve yedek bir plan hazırlamak, bu bölgede özellikle ' +
      'önemlidir.',
    questions: [
      {
        question: 'Köyün ana geçim kaynağı nedir?',
        options: ['Turizm', 'Hayvancılık ve peynir üretimi', 'Madencilik', 'Balıkçılık'],
        correctIndex: 1,
      },
      {
        question: 'Kış aylarında köy sakinleri neden stok yapar?',
        options: ['Pazarlar kapalı olduğu için', 'Kar yolu kapatabildiği için', 'Hayvanlar aç kaldığı için', 'Ziyaretçi gelmediği için'],
        correctIndex: 1,
      },
      {
        question: 'Metne göre yolculuk öncesinde ne yapılmalıdır?',
        options: ['Yalnızca araba yıkatılmalıdır', 'Hava durumu kontrol edilmeli ve yedek plan hazırlanmalıdır', 'Köy ile iletişim kesilmelidir', 'Yol haritası yazılmamalıdır'],
        correctIndex: 1,
      },
    ],
  },
  {
    key: 'builtin-economy',
    title: 'Bütçe Alışkanlığı',
    body:
      'Bütçe yapmak, gelirin ve giderin yazılı bir planla yönetilmesidir. Birçok insan harcamalarını ay sonunda fark eder, ' +
      'oysa küçük ve tekrarlayan harcamalar en çok birikenlerdir. Bu nedenle en etkili yöntem, harcamaları haftalık ' +
      'olarak kategorilere ayırmaktır. Örneğin barınma ve fatura gibi sabit giderler önce ayrılır, kalan tutar ise ' +
      'esnek harcamalara bırakılır. Acil durum birikimi ise beklenmedik bir gider karşısında borca girmeyi engeller. ' +
      'Bütçe disiplini bir kısıtlama değil, seçimleri bilinçli yapma becerisidir.',
    questions: [
      {
        question: 'Metne göre harcamaların en çok birikeni hangisidir?',
        options: ['Büyük ve nadir harcamalar', 'Küçük ve tekrarlayan harcamalar', 'Yıllık vergiler', 'Yatırım kararları'],
        correctIndex: 1,
      },
      {
        question: 'Bütçe yaparken önce neyi ayırmak önerilir?',
        options: ['Eğlence harcamalarını', 'Sabit giderleri', 'Hediye bütçesini', 'Esnek harcamaları'],
        correctIndex: 1,
      },
      {
        question: 'Acil durum birikiminin işlevi nedir?',
        options: ['Faiz kazandırmak', 'Beklenmedik giderde borca girmeyi engellemek', 'Vergiyi azaltmak', 'Harcamayı artırmak'],
        correctIndex: 1,
      },
    ],
  },
  {
    key: 'builtin-philosophy',
    title: 'Sorgulamanın Değeri',
    body:
      'Bir fikri kabul etmeden önce onu sorgulamak, düşünmenin en eski yollarından biridir. Sorgulama, karşıt görüşleri ' +
      'dinlemeyi ve kendi varsayımlarını açıkça görmeyi gerektirir. Bu süreç ilk bakışta yavaş görünebilir, fakat sonuçta ' +
      'daha sağlam bir kanaate ulaşılmasını sağlar. Tartışma ortamları da bu yüzden değerlidir; çünkü farklı bakış açıları ' +
      'birbirini sınar. Sorgulamanın amacı her şeyi reddetmek değil, neyin neden doğru olduğunu anlamaktır. Böylece hem ' +
      'bilgi güvenilir hale gelir hem de insan kendi görüşünü daha özgürce savunabilir.',
    questions: [
      {
        question: 'Metne göre sorgulamanın asıl amacı nedir?',
        options: ['Her şeyi reddetmek', 'Neyin neden doğru olduğunu anlamak', 'Tartışmayı kazanmak', 'Hızlı karar vermek'],
        correctIndex: 1,
      },
      {
        question: 'Sorgulama süreci hakkında metin ne söyler?',
        options: ['Her zaman kısa sürer', 'İlk bakışta yavaş görünebilir', 'Yalnızca yazılı yapılır', 'Karşıt görüşe yer vermez'],
        correctIndex: 1,
      },
      {
        question: 'Tartışma ortamları neden değerlidir?',
        options: ['Herkes aynı şeyi söyler', 'Farklı bakış açıları birbirini sınar', 'Kimse konuşmaz', 'Karar sürecini kısaltır'],
        correctIndex: 1,
      },
    ],
  },
];

/** Ölçüm metinleri 5 soruya tamamlanır; diğer metinler mevcut sorularıyla kalır. */
export const BUILTIN_TEXTS: BuiltinText[] = [...BASE_BUILTIN_TEXTS, ...EXTRA_BUILTIN_TEXTS, ...LIBRARY_TEXTS].map((text) => ({
  ...text,
  questions: [...text.questions, ...(MEASUREMENT_QUESTIONS[text.key] ?? [])],
}));

export function findBuiltinText(key: string): BuiltinText | undefined {
  return BUILTIN_TEXTS.find((t) => t.key === key);
}
