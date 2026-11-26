/**
 * Hazır metinlerin ikinci kısmı. Metinler bu proje için özgün olarak yazılmıştır.
 * Her metnin üç soruluk bir anlama testi vardır.
 */
import type { BuiltinText } from './builtinTexts';

export const EXTRA_BUILTIN_TEXTS: BuiltinText[] = [
  {
    key: 'builtin-space',
    title: 'Gece Gökyüzü',
    body:
      'Şehir ışıklarından uzaklaşan biri, gece gökyüzünde binlerce yıldız görebilir. Bu yıldızların bir kısmı aslında ' +
      'güneşimizden çok daha büyük ve parlak güneşlerdir; sadece çok uzakta oldukları için küçük görünürler. Gökbilimciler ' +
      'yıldızların ışığını inceleyerek onların sıcaklığını ve yaşını tahmin eder. Ay ise gece gökyüzünün en yakın komşusudur ' +
      've evrelerini her gece biraz farklı gösterir. Çıplak gözle yapılan gözlemler bile zamanla insanın doğayla bağını güçlendirir. ' +
      'Bu yüzden birçok kent, gece ışıklarını azaltarak gökyüzünü daha net görmeye çalışmaktadır.',
    questions: [
      {
        question: 'Metne göre bazı yıldızlar neden küçük görünür?',
        options: ['Gerçekten küçük oldukları için', 'Çok uzakta oldukları için', 'Işıkları zayıf olduğu için', 'Bulutlar nedeniyle'],
        correctIndex: 1,
      },
      {
        question: 'Gökbilimciler yıldızların ışığını neden inceler?',
        options: ['Yıldızları boyamak için', 'Sıcaklık ve yaşlarını tahmin etmek için', 'Ay\'ı çekmek için', 'Gece ışıklarını artırmak için'],
        correctIndex: 1,
      },
      {
        question: 'Bazı kentler gece ışıklarını neden azaltır?',
        options: ['Enerji tasarrufu için', 'Gökyüzünü daha net görmek için', 'Yıldızlar sönmesin diye', 'Güneşi beklemek için'],
        correctIndex: 1,
      },
    ],
  },
  {
    key: 'builtin-coffee',
    title: 'Kahvenin Yolculuğu',
    body:
      'Kahve çekirdekleri aslında bir meyvenin içinde yetişir. Hasat edildikten sonra çekirdekler kurutulur, kavrulur ve ' +
      'öğütülür. Kavurma süresi, kahvenin tadını ve kokusunu doğrudan etkiler; kısa süre kavrulan çekirdekler daha asidik, ' +
      'uzun süre kavrulanlar ise daha koyu ve acı bir tat verir. Dünyanın birçok yerinde kahve, sosyal yaşamın bir parçası ' +
      'olmuştur. İnsanlar bir fincan kahve eşliğinde sohbet eder, iş konuşur veya sadece sessizce düşünür. Kahvenin ' +
      'hazırlanma biçimi de bölgeden bölgeye değişir.',
    questions: [
      {
        question: 'Kahve çekirdekleri nerede yetişir?',
        options: ['Toprağın altında', 'Bir meyvenin içinde', 'Ağaç kabuğunda', 'Suyun içinde'],
        correctIndex: 1,
      },
      {
        question: 'Uzun süre kavrulan kahve nasıl bir tat verir?',
        options: ['Daha tatlı', 'Daha koyu ve acı', 'Daha sulu', 'Tatsız'],
        correctIndex: 1,
      },
      {
        question: 'Metne göre kahve neyin parçası olmuştur?',
        options: ['Sağlık tedavisinin', 'Sosyal yaşamın', 'Tarım takviminin', 'Ticaret kurallarının'],
        correctIndex: 1,
      },
    ],
  },
  {
    key: 'builtin-bridges',
    title: 'Eski Köprüler',
    body:
      'Birçok eski köprü, yapıldığı dönemin mühendislik becerisini bugün de gösterir. Taştan örülmüş kemerler, ağırlığı ' +
      'dağıtarak köprünün yüzyıllarca ayakta kalmasını sağlar. Bazı köprülerin ayakları, su akıntısını kırmak için özel ' +
      'olarak tasarlanmıştır. Köprüler yalnızca iki kıyıyı birleştirmez; aynı zamanda ticaret, haberleşme ve kültür alışverişine ' +
      'de zemin hazırlar. Bu yüzden birçok köprünün yanında bir han, bir çeşme ya da bir mescit bulunur. Bugün bu yapılar ' +
      'hem tarihi değerleri hem de yaşayan birer buluşma noktası olarak korunmaya çalışılmaktadır.',
    questions: [
      {
        question: 'Taş kemerlerin köprüye kattığı temel özellik nedir?',
        options: ['Rengini değiştirmek', 'Ağırlığı dağıtıp ayakta kalmasını sağlamak', 'Sesi yankılandırmak', 'Suyu ısıtmak'],
        correctIndex: 1,
      },
      {
        question: 'Bazı köprü ayakları neden özel tasarlanmıştır?',
        options: ['Süs için', 'Su akıntısını kırmak için', 'Gölge oluşturmak için', 'Gemileri durdurmak için'],
        correctIndex: 1,
      },
      {
        question: 'Metne göre köprülerin yanında sık sık neler bulunur?',
        options: ['Fabrikalar', 'Han, çeşme veya mescit', 'Havaalanları', 'Kum tepeleri'],
        correctIndex: 1,
      },
    ],
  },
  {
    key: 'builtin-music',
    title: 'Halk Müziğinin Dili',
    body:
      'Halk müziği, bir toplumun duygularını ve yaşam biçimini nesilden nesile taşıyan canlı bir mirastır. Türküler çoğu ' +
      'zaman yazılmadan, dinleyerek ve söyleyerek öğrenilir. Bu nedenle her kuşak, aynı ezgiye kendi dönemine ait bir anlam ' +
      'katabilir. Halk müziğinde sözler kadar ritim de önemlidir; bağlama, kaval ya da davul gibi çalgılar ezgiye kendine özgü ' +
      'bir hava verir. Düğünlerde, hasat şenliklerinde ve sıradan akşamlarda çalınan bu müzik, insanları bir araya getirir ve ' +
      'ortak bir hafıza oluşturur.',
    questions: [
      {
        question: 'Halk müziği nasıl öğrenilir?',
        options: ['Notalardan okuyarak', 'Dinleyerek ve söyleyerek', 'Kitaplardan çalışarak', 'Sadece okulda'],
        correctIndex: 1,
      },
      {
        question: 'Metne göre halk müziğinde sözlerin yanı sıra neyin önemi vardır?',
        options: ['Ritmin', 'Sahne ışıklarının', 'Kostümün', 'Biletin'],
        correctIndex: 0,
      },
      {
        question: 'Bu müziğin bir toplumda oluşturduğu şey nedir?',
        options: ['Ortak bir hafıza', 'Yeni bir dil', 'Ticari bir sektör', 'Yazılı bir yasa'],
        correctIndex: 0,
      },
    ],
  },
  {
    key: 'builtin-recycling',
    title: 'Geri Dönüşüm',
    body:
      'Geri dönüşüm, kullanılmış malzemelerin yeniden işlenerek yeni ürünlere dönüştürülmesidir. Kâğıt, cam ve metal gibi ' +
      'malzemeler defalarca kullanılabilir. Ancak geri dönüşüm için atıkların ayrı toplanması gerekir. Karışık bir çöp ' +
      'kutusundan ayrıştırılan malzemeler kalitesini kaybeder ve bazen tamamen işe yaramaz hale gelir. Bu nedenle evde ' +
      'yapılan küçük bir ayrım bile büyük bir fark yaratır. Plastik şişelerin etiketlerini çıkarmak ve kutuları ezerek ' +
      'koymak da toplama sürecini kolaylaştırır.',
    questions: [
      {
        question: 'Geri dönüşümün temel fikri nedir?',
        options: ['Malzemeleri yakmak', 'Kullanılmış malzemeleri yeniden işlemek', 'Yeni fabrika kurmak', 'Atığı gömmek'],
        correctIndex: 1,
      },
      {
        question: 'Geri dönüşüm neden atıkların ayrı toplanmasını gerektirir?',
        options: ['Kutular daha pahalı olduğu için', 'Karışan malzemeler kalitesini kaybettiği için', 'Çöpçüler bunu istediği için', 'Yasa gereği her atık ayrılmalı'],
        correctIndex: 1,
      },
      {
        question: 'Metne göre evde yapılabilecek kolay bir katkı nedir?',
        options: ['Atıkları denize atmak', 'Plastik şişelerin etiketlerini çıkarmak', 'Cam kırmak', 'Kâğıtları karıştırmak'],
        correctIndex: 1,
      },
    ],
  },
  {
    key: 'builtin-bees',
    title: 'Arıların Düzeni',
    body:
      'Bir arı kovanı, herkesin görevi belli olan küçük bir kasabaya benzer. İşçi arılar çiçeklerden nektar ve polen toplar, ' +
      'kovanı temizler ve kraliçeyi besler. Kraliçe arı ise kovanın tek üreyen bireyidir. Arılar bulduğu çiçeğin yerini, ' +
      'dans denilen özel bir hareketle diğer arılara anlatır. Dansın yönü ve süresi, kaynağın nerede olduğunu gösterir. ' +
      'Arıların bitkilerin tozlaşmasında oynadığı rol çok önemlidir; birçok meyve ve sebze, bu küçük canlıların emeği ' +
      'sayesinde meyve verir.',
    questions: [
      {
        question: 'Kovandaki tek üreyen birey kimdir?',
        options: ['İşçi arılar', 'Kraliçe arı', 'Erkek arılar', 'Kovan bekçisi'],
        correctIndex: 1,
      },
      {
        question: 'Arılar çiçeğin yerini nasıl anlatır?',
        options: ['Ses çıkararak', 'Dans ederek', 'Koku bırakarak', 'Mektup yazarak'],
        correctIndex: 1,
      },
      {
        question: 'Arıların doğadaki önemli rolü nedir?',
        options: ['Ağaçları kesmek', 'Bitkilerin tozlaşmasına yardım etmek', 'Toprağı sertleştirmek', 'Suyu temizlemek'],
        correctIndex: 1,
      },
    ],
  },
  {
    key: 'builtin-weather',
    title: 'Hava Tahminleri',
    body:
      'Hava tahminleri, atmosferdeki basınç, nem, sıcaklık ve rüzgâr gibi bilgilerin toplanıp analiz edilmesiyle yapılır. ' +
      'Uydular, radar istasyonları ve yer ölçüm merkezleri bu veriyi sürekli olarak gönderir. Bilgisayar modelleri bu bilgileri ' +
      'kullanarak gelecek saatler için olasılıklar hesaplar. Yine de tahminler kesin değildir; özellikle birkaç gün sonrası için ' +
      'belirsizlik artar. Bu nedenle meteorologlar, tahminlerini bir yüzde olasılık olarak verir. İyi bir tahmin, doğru veri ile ' +
      'dikkatli yorumun birlikte çalışmasıyla ortaya çıkar.',
    questions: [
      {
        question: 'Hava tahminleri hangi bilgilerle yapılır?',
        options: ['Sadece gözlem', 'Basınç, nem, sıcaklık ve rüzgâr', 'Yalnızca gökyüzünün rengi', 'Hayvanların davranışı'],
        correctIndex: 1,
      },
      {
        question: 'Metne göre tahminlerin belirsizliği ne zaman artar?',
        options: ['Yarın için', 'Birkaç gün sonrası için', 'Gece saatlerinde', 'Yaz aylarında'],
        correctIndex: 1,
      },
      {
        question: 'Meteorologlar tahminlerini neden yüzde olasılık olarak verir?',
        options: ['Süslü görünmek için', 'Belirsizliği göstermek için', 'Ücret almak için', 'Tahmini kısaltmak için'],
        correctIndex: 1,
      },
    ],
  },
  {
    key: 'builtin-language',
    title: 'Kelimelerin Gücü',
    body:
      'Bir dili zenginleştiren şey, yalnızca yeni kelimeler değil, aynı anlama gelen farklı kelimelerin varlığıdır. Eş anlamlı ' +
      'sözcükler, cümleye ince bir ton ve nüans katar. Bir durumu "hızlı" yerine "çabuk" ya da "süratli" diye anlatmak, ' +
      'dinleyicinin zihninde farklı bir tablo oluşturur. Okurken de kelime dağarcığı geniş olan biri, metni daha az ' +
      'zorlanarak anlar. Çünkü tanıdığı kelimeleri tek tek çözmek yerine, cümleyi bütün olarak kavrayabilir. Düzenli okuma, ' +
      'bu dağarcığı en doğal biçimde genişletir.',
    questions: [
      {
        question: 'Bir dili zenginleştiren şey metne göre nedir?',
        options: ['Yalnızca yeni kelimeler', 'Eş anlamlı kelimelerin varlığı', 'Kısa cümleler', 'Sözlük sayfaları'],
        correctIndex: 1,
      },
      {
        question: 'Geniş bir kelime dağarcığı okurken ne sağlar?',
        options: ['Metni yavaş okumayı', 'Cümleyi bütün olarak kavramayı', 'Metni ezberlemeyi', 'Sesli okumayı'],
        correctIndex: 1,
      },
      {
        question: 'Metne göre dağarcığı genişletmenin en doğal yolu nedir?',
        options: ['Ansiklopedi ezberlemek', 'Düzenli okumak', 'Yalnızca dinlemek', 'Yabancı dil öğrenmek'],
        correctIndex: 1,
      },
    ],
  },
  {
    key: 'builtin-chess',
    title: 'Satranç Tahtası',
    body:
      'Satranç, iki oyuncunun karşılıklı olarak taşlarını hareket ettirdiği eski bir stratejik oyundur. Her taşın kendine özgü ' +
      'bir hareket şekli vardır; at taşı L biçiminde ilerlerken fil çaprazlamasına gider. Oyunun amacı rakibin şahını ' +
      'etkisiz hale getirmektir. Açılış hamleleri genellikle merkezi kontrol etmeye odaklanır. Oyun ilerledikçe planlama ' +
      've dikkat daha da önem kazanır. Satranç oynamak, karar verme ve öngörü becerilerini geliştirdiği için birçok okulda ' +
      'eğitsel bir araç olarak kullanılmaktadır.',
    questions: [
      {
        question: 'Satrançta oyunun amacı nedir?',
        options: ['Taşları toplamak', 'Rakibin şahını etkisiz hale getirmek', 'Tahtayı temizlemek', 'En çok hamle yapmak'],
        correctIndex: 1,
      },
      {
        question: 'Metne göre at taşı nasıl ilerler?',
        options: ['Düz çizgide', 'L biçiminde', 'Yalnızca geriye', 'Çapraz ve uzun'],
        correctIndex: 1,
      },
      {
        question: 'Satranç neden eğitsel bir araç olarak kullanılır?',
        options: ['Tahta pahalı olduğu için', 'Karar verme ve öngörü becerisini geliştirdiği için', 'Hızlı kazanç sağladığı için', 'Yazma becerisini artırdığı için'],
        correctIndex: 1,
      },
    ],
  },
  {
    key: 'builtin-bread',
    title: 'Ekmek Yapımı',
    body:
      'Ekmek, en eski gıdalardan biridir ve yapımı sadece birkaç temel malzemeye dayanır: un, su, tuz ve maya. Hamurun ' +
      'iyi kabarması için yeterince yoğrulması ve dinlendirilmesi gerekir. Maya, şekeri parçalayarak gaz üretir ve hamurun ' +
      'kabarmasını sağlar. Fırına verilmeden önce hamur bir süre yeniden dinlendirilir. Pişme sırasında ekmeğin üst kısmı ' +
      'kahverengiye döner, bu da ekmeğe hoş bir koku ve tat verir. Sabırla hazırlanan ekmek, hem sofranın değerini artırır hem de ' +
      'insana emeğin kıymetini hatırlatır.',
    questions: [
      {
        question: 'Ekmek yapımında temel malzemelerden biri hangisidir?',
        options: ['Süt', 'Maya', 'Yumurta', 'Bal'],
        correctIndex: 1,
      },
      {
        question: 'Maya hamurda ne işe yarar?',
        options: ['Rengi değiştirir', 'Şekeri parçalayarak gaz üretip hamuru kabartır', 'Tuzu eritir', 'Hamuru soğutur'],
        correctIndex: 1,
      },
      {
        question: 'Ekmeğin üst kısmı pişerken neden kahverengi olur?',
        options: ['Boyası olduğu için', 'Hoş bir koku ve tat oluşturduğu için', 'Fırın kapanınca olur', 'Tuzdan dolayı'],
        correctIndex: 1,
      },
    ],
  },
  {
    key: 'builtin-time',
    title: 'Zamanı Yönetmek',
    body:
      'Zaman, herkes için eşit miktarda sunulan ama farklı biçimlerde kullanılan bir kaynaktır. Günü planlamanın en basit ' +
      'yolu, önemli işleri sabah saatlerine yerleştirmektir; çünkü dikkat genellikle gün içinde azalır. Büyük bir işi küçük ' +
      'parçalara bölmek, başlamayı kolaylaştırır. Dikkat dağıtıcı şeyleri azaltmak da verimi artırır. Her gün kısa bir ' +
      'değerlendirme yapmak, neyin işe yaradığını ve neyin değiştirilmesi gerektiğini görmeyi sağlar. Zamanı yönetmek, aslında ' +
      'kendi önceliklerini bilmekle başlar.',
    questions: [
      {
        question: 'Metne göre önemli işler için en uygun zaman hangisidir?',
        options: ['Gece geç saatler', 'Sabah saatleri', 'Öğle tatili', 'Akşam yemeği sonrası'],
        correctIndex: 1,
      },
      {
        question: 'Büyük bir işe başlamayı kolaylaştıran yöntem nedir?',
        options: ['Hepsini bir anda yapmak', 'İşi küçük parçalara bölmek', 'Ertelemek', 'Başkasına bırakmak'],
        correctIndex: 1,
      },
      {
        question: 'Zamanı yönetmenin temeli metne göre nedir?',
        options: ['Daha çok çalışmak', 'Kendi önceliklerini bilmek', 'Telefonu kullanmak', 'Uyumamak'],
        correctIndex: 1,
      },
    ],
  },
];
