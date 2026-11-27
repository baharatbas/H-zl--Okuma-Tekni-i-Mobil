/** Soru bankasının 3. partisi (özgün). */
import { buildBatch, Choice } from './bankBuilder';

const MAIN: Choice[] = [
  ['Bir haritada en kısa görünen yol, yürüyen için en kolay yol olmayabilir. Yokuşlar, kalabalık ve gölge hesaba katılınca seçim değişir.', 'En iyi seçenek, yalnız tek ölçüte bakılarak belirlenemez.', 'Haritalar yolları yanlış gösterir.', 'Kısa yollar hep yokuşludur.', 'Yürümek yerine araç kullanılmalıdır.', 'Gölge en önemli ölçüttür.', 'Örnek, tek ölçütün yanıltabileceğini anlatıyor.'],
  ['Çocuğa her istediği hemen verildiğinde beklemeyi öğrenemez. Beklemeyi öğrenemeyen, emek isteyen işlerde çabuk vazgeçer.', 'Beklemeyi öğrenmek sebat için gereklidir.', 'Çocukların istekleri hiç karşılanmamalıdır.', 'Emek isteyen işler çocuklara uygun değildir.', 'Vazgeçmek her zaman yanlıştır.', 'Hediyeler çocukları mutsuz eder.', 'Beklemek ile vazgeçmemek arasında bağ kuruluyor.'],
  ['Eski bir fotoğrafa bakınca yalnız görüntüyü değil, o günün kokusunu ve sesini de hatırlarız. Küçük bir kare, koca bir günü geri çağırabilir.', 'Fotoğraflar anıları canlandıran güçlü ipuçlarıdır.', 'Eski fotoğraflar net değildir.', 'Her gün fotoğraf çekilmelidir.', 'Kokular fotoğrafta görünür.', 'Anılar zamanla hiç silinmez.', 'Son cümle ana düşünceyi toparlıyor.'],
  ['Kalabalığın alkışladığı fikir her zaman doğru değildir. Doğruluk, kaç kişinin inandığıyla değil, dayandığı kanıtla ölçülür.', 'Bir fikrin doğruluğunu kanıtı belirler.', 'Kalabalıklar hep yanılır.', 'Alkış kanıt sayılır.', 'Fikirler oylanmalıdır.', 'Az kişinin inandığı doğrudur.', '"...değil, ... ile ölçülür" yapısı ana yargıyı verir.'],
  ['İyi bir hikâye anlatıcısı her ayrıntıyı söylemez. Dinleyicinin hayaline bıraktığı boşluklar anlatıyı daha canlı kılar.', 'Anlatımda bırakılan boşluklar dinleyiciyi katılmaya çağırır.', 'Hikâyeler kısa olmalıdır.', 'Ayrıntı vermek yasaktır.', 'Dinleyiciler hayal kurmaz.', 'Anlatıcı konuyu unutmalıdır.', 'Boşlukların anlatıyı canlandırdığı söyleniyor.'],
  ['Suyu musluktan akarken gördüğümüz için onu sınırsız sanırız. Oysa barajlar kuraklıkta hızla boşalır.', 'Su sınırlı bir kaynaktır ve öyle davranılmalıdır.', 'Musluklar sık bozulur.', 'Barajlar gereksizdir.', 'Kuraklık hiç yaşanmaz.', 'Su yalnız barajda bulunur.', '"Oysa" yanlış sanıyı düzeltiyor.'],
  ['Bir dili konuşurken hata yapmaktan korkan kişi susar. Susan kişi ise dili kullanma fırsatını kaçırır ve yavaş ilerler.', 'Hata korkusu dil öğrenmeyi yavaşlatır.', 'Hata yapmadan konuşulmalıdır.', 'Susmak en iyi öğrenme yoludur.', 'Dil yalnız yazarak öğrenilir.', 'Hatalar hiç düzeltilmemelidir.', 'Korku, susma ve yavaşlama zinciri kuruluyor.'],
  ['Her sabah aynı yoldan işe giden biri, yeni açılan dükkânı haftalarca fark etmeyebilir. Alışılmış güzergâhta göz yolu değil, aklındakini izler.', 'Alışılmış işlerde çevreye dikkat azalabilir.', 'İşe farklı yoldan gidilmelidir.', 'Yeni dükkânlar görünmez yerdedir.', 'Göz yalnız yeni şeyleri görür.', 'Sabahları dikkat artar.', 'Örnek, alışkanlıkta dikkatin azaldığını gösteriyor.'],
];
const TOPIC: Choice[] = [
  ['Sünger ilk bakışta bitkiye benzer. Oysa suyu süzerek beslenen bir deniz hayvanıdır. Bir yere tutunup yaşamını orada geçirir.', 'Süngerin Şaşırtıcı Yaşamı', 'Deniz Bitkileri', 'Temizlik Malzemeleri', 'Balık Avcılığı', 'Su Arıtma Tesisleri', 'Parça süngeri tanıtıyor.'],
  ['Takvim, zamanı gün, ay ve yıl olarak bölmemizi sağlar. Farklı toplumlar Ay’ı ya da Güneş’i esas alan takvimler kullanmıştır.', 'Takvimin Dayandığı Ölçüler', 'Saat Yapımı', 'Ay Tutulmaları', 'Tarım Aletleri', 'Yılbaşı Eğlenceleri', 'Takvim türleri anlatılıyor.'],
  ['Köprüler yalnız iki yakayı birleştirmez. Ticareti kolaylaştırır, insanları buluşturur, kentin büyüme yönünü bile değiştirir.', 'Köprülerin Kent Yaşamına Etkisi', 'Köprü Boyama Teknikleri', 'Nehir Balıkları', 'Eski Ticaret Malları', 'Deniz Ulaşımı', 'Köprünün etkileri sıralanıyor.'],
  ['Uykudayken beden onarılır, zihin gün içinde öğrenilenleri düzenler. Az uyuyan kişi bu fırsattan eksik yararlanır.', 'Uykunun Onarıcı İşlevi', 'Rüya Yorumları', 'Yatak Seçimi', 'Gece Vardiyası Ücretleri', 'Sabah Sporu', 'Uykunun yararı konu ediliyor.'],
  ['Baharatlar yemeğe koku ve tat verir. Geçmişte bazıları o kadar değerliydi ki uzak ülkelerden zorlu yolculuklarla getirilirdi.', 'Baharatın Tadı ve Değeri', 'Mutfak Gereçleri', 'Gemi Yapımı', 'Sebze Yetiştirme', 'Yemek Süsleme', 'Tat ve tarihsel değer anlatılıyor.'],
  ['Kumbaraya atılan her bozuk para küçük görünür. Aylar sonra açıldığında ise beklenmedik bir miktar çıkar.', 'Küçük Birikimlerin Gücü', 'Madeni Para Basımı', 'Kumbara Süsleme', 'Banka Binaları', 'Alışveriş Merkezleri', 'Birikimin büyümesi anlatılıyor.'],
  ['Pusula iğnesi yerin manyetik alanı sayesinde yön gösterir. Denizciler bu araçla açık denizde rotalarını bulabilmiştir.', 'Pusulanın Yol Göstericiliği', 'Mıknatıs Oyunları', 'Balıkçı Ağları', 'Deniz Fenerinin Boyası', 'Harita Satışı', 'Pusulanın işlevi anlatılıyor.'],
  ['Şiirde ses yinelemeleri ve ölçü, dizelere ezgi kazandırır. Bu yüzden bazı şiirler bir kez duyulunca akılda kalır.', 'Şiirde Ses ve Ahenk', 'Romanın Bölümleri', 'Kitap Kapakları', 'Müzik Aletleri Yapımı', 'Ezber Yarışmaları', 'Ahenk unsurları konu ediliyor.'],
];
const DETAIL: Choice[] = [
  ['Kitap takası cumartesi parkta yapılacak. Herkes en çok beş kitap getirebilecek. Yıpranmış kitaplar kabul edilmeyecek. Yağmurda etkinlik kültür evine alınacak.', 'Etkinliğin başlangıç saatine', 'Yapılacağı yere', 'Getirilebilecek sayıya', 'Kabul edilmeyen kitaplara', 'Yağmur durumuna', 'Parçada saat bilgisi verilmiyor.'],
  ['Yeni kütüphanede sessiz çalışma odası var. Bilgisayarlar ücretsiz kullanılabiliyor. Giriş kartı bir fotoğrafla alınıyor. Kafeteryada yalnız içecek satılıyor.', 'Kütüphanedeki kitap sayısına', 'Çalışma odasına', 'Bilgisayar kullanımına', 'Kart alma koşuluna', 'Kafeterya hizmetine', 'Kitap sayısından söz edilmiyor.'],
  ['Bisiklet turu meydandan başlayacak. Parkur on iki kilometre. Kask takmak zorunlu. Bitirenlere su ve madalya verilecek.', 'Katılım için yaş sınırına', 'Başlangıç yerine', 'Parkurun uzunluğuna', 'Kask zorunluluğuna', 'Bitirenlere verilenlere', 'Yaş sınırı belirtilmiyor.'],
  ['Mahalle bostanında domates ve biber yetiştiriliyor. Her aileye küçük bir parsel ayrılmış. Aletler ortak kullanılıyor. Ürünün bir kısmı aşevine veriliyor.', 'Bostanın ne zaman kurulduğuna', 'Yetiştirilen ürünlere', 'Parsel paylaşımına', 'Alet kullanımına', 'Ürünün bağışlanmasına', 'Kuruluş zamanı anlatılmıyor.'],
  ['Satranç kulübü haftada iki gün toplanıyor. Yeni başlayanlara ayrı masa kuruluyor. Takımlar okulda bulunuyor. Yıl sonunda turnuva düzenleniyor.', 'Kulüpteki üye sayısına', 'Toplanma sıklığına', 'Yeni başlayanlara sağlanana', 'Takımların bulunduğu yere', 'Yıl sonu etkinliğine', 'Üye sayısı verilmiyor.'],
  ['Tarihi çeşme geçen ay onarıldı. Taşlar aslına uygun yenilendi. Su yeniden akmaya başladı. Yanına bilgi levhası konuldu.', 'Onarımın maliyetine', 'Onarım zamanına', 'Taşların yenilenme biçimine', 'Suyun akmasına', 'Bilgi levhasına', 'Maliyetten söz edilmiyor.'],
  ['Yaz okulu temmuzda başlayacak. Dersler öğleden önce yapılacak. Servis yalnız merkez mahallelerden kalkacak. Öğle yemeği verilmeyecek.', 'Derslerin hangi konularda olacağına', 'Başlangıç ayına', 'Ders zamanına', 'Servis güzergâhına', 'Yemek durumuna', 'Ders konuları belirtilmiyor.'],
  ['Hayvan barınağında kırk köpek bulunuyor. Gönüllüler hafta sonu gezdirme yapıyor. Mama bağışı kabul ediliyor. Sahiplendirme için görüşme şart.', 'Barınağın açıldığı yıla', 'Köpek sayısına', 'Gönüllülerin yaptığı işe', 'Bağış durumuna', 'Sahiplendirme koşuluna', 'Açılış yılı verilmiyor.'],
];
const INFERENCE: Choice[] = [
  ['Ahmet sabah evden çıkarken kalın montunu giydi, eldivenlerini de cebine koydu.', 'Havanın soğuk olmasını bekliyor.', 'Yaz tatiline gidiyor.', 'Montunu satacaktır.', 'Hava çok sıcaktır.', 'Evden hiç çıkmayacaktır.', 'Kalın giysi soğuk beklentisini gösterir.'],
  ['Sinema salonunda ışıklar yandığı halde seyircilerin çoğu bir süre yerinden kalkmadı.', 'Film seyircileri etkilemiş görünüyor.', 'Film henüz başlamamıştır.', 'Salonun kapıları yoktur.', 'Seyirciler filmi izlememiştir.', 'Işıklar bozulmuştur.', 'Kalkmamaları etkilendiklerini düşündürür.'],
  ['Bakkal, dondurma dolabını mart ayında temizleyip fişe taktı.', 'Dondurma satışının yakında başlayacağını düşünüyor.', 'Dolabı hurdaya verecektir.', 'Kış yeni başlamaktadır.', 'Dondurma satmayacaktır.', 'Dükkânı kapatmaktadır.', 'Hazırlık yaklaşan satış dönemini gösterir.'],
  ['Defne’nin masasında yarım kalmış bir resim, kapağı açık boyalar ve hâlâ ıslak bir fırça vardı.', 'Defne resme kısa süre önce ara vermiştir.', 'Resim yıllar önce bırakılmıştır.', 'Defne boya kullanmaz.', 'Resim tamamlanmıştır.', 'Masa hiç kullanılmamıştır.', 'Islak fırça yakın zamanı gösterir.'],
  ['Her yıl dolu olan otelde bu temmuzda pek çok oda boştu; kıyıdaki yol onarımı ise sürüyordu.', 'Yol çalışması ziyaretçileri etkilemiş olabilir.', 'Otel yeni açılmıştır.', 'Temmuzda kimse tatil yapmaz.', 'Odalar yıkılmıştır.', 'Yol onarımı bitmiştir.', 'Olağan dışı boşluk ile onarım birlikte veriliyor.'],
  ['Öğretmen, konuyu anlatırken öğrencilerin kaşlarının çatıldığını görünce tahtaya yeni bir örnek çizdi.', 'Konunun anlaşılmadığını düşünmüştür.', 'Dersi bitirmek istemiştir.', 'Öğrenciler sınav olmaktadır.', 'Tahta silinmiştir.', 'Konu çok kolaydır.', 'Kaş çatma sonrası örnek vermesi bunu gösterir.'],
  ['Marketin önüne sabah erkenden su damacanaları yığılmıştı; haberlerde ertesi gün su kesintisi olacağı söyleniyordu.', 'Market su talebinin artacağını öngörmüştür.', 'Kesinti iptal edilmiştir.', 'Damacanalar boştur ve atılacaktır.', 'Market su satmamaktadır.', 'İnsanlar suya ihtiyaç duymayacaktır.', 'Kesinti haberi ile stok ilişkilidir.'],
  ['Selim, ödünç aldığı kitabın arasına kendi küçük ayracını koymuş, sayfaların köşesini kıvırmamıştı.', 'Selim kitaba zarar vermemeye özen göstermiştir.', 'Selim kitabı okumamıştır.', 'Kitap Selim’indir.', 'Selim kitapları sevmez.', 'Kitabın sayfaları yırtıktır.', 'Ayraç kullanması özeni gösterir.'],
];
const COMPLETION: Choice[] = [
  ['Bir fidan dikmek birkaç dakika sürer. ____ Bu yüzden ağaç yetiştirmek sabır işidir.', 'Ama gölge verecek hale gelmesi yıllar alır.', 'Çünkü fidanlar hiç büyümez.', 'Üstelik dikmek de yıllar sürer.', 'Bu nedenle ağaç dikilmemelidir.', 'Fidanlar marketten alınır.', '"Sabır" uzun süreyi gerektirir.'],
  ['Müzede eserlere dokunmak yasaktır. ____ Küçük izler zamanla birikip onarılamaz hasara dönüşür.', 'Çünkü elimizdeki yağ ve nem yüzeye geçer.', 'Oysa dokunmak eserleri güçlendirir.', 'Bu yüzden müzeler geç açılır.', 'Eserler her yıl değiştirilir.', 'Ziyaretçiler fotoğraf çeker.', '"Çünkü" yasağın nedenini açıklar.'],
  ['Yazar ilk taslağında aklına gelen her şeyi kâğıda döker. ____ Fazlalıklar ayıklanınca metin berraklaşır.', 'Asıl çalışma ise düzeltirken başlar.', 'Bu yüzden ikinci kez okumaz.', 'Taslak doğrudan basılır.', 'Kâğıtlar çok pahalıdır.', 'Yazar yazmayı bırakır.', 'Ayıklama düzeltme aşamasını gerektirir.'],
  ['Kalabalık bir odada herkes aynı anda konuşursa kimse anlaşılmaz. ____ Böylece her düşünce duyulma fırsatı bulur.', 'Bu nedenle sırayla söz almak gerekir.', 'Bu yüzden herkes daha çok bağırmalıdır.', 'Odalar küçültülmelidir.', 'Kimse konuşmamalıdır ve tartışma bitmelidir.', 'Sandalyeler artırılmalıdır.', '"Her düşünce duyulur" sırayla konuşmayı gerektirir.'],
  ['Yeni bir yemeği ilk kez tadan çocuk yüzünü buruşturabilir. ____ Zamanla o tada alışabilir.', 'Ancak birkaç kez daha sunmakta yarar vardır.', 'Bu yüzden o yemek bir daha pişirilmemelidir.', 'Çocuklar hiçbir tada alışmaz.', 'Tabaklar renkli olmalıdır.', 'Yemek soğuk yenmelidir.', '"Zamanla alışır" yeniden sunmayı gerektirir.'],
  ['Yön levhaları kısa ve sade yazılır. ____ Uzun cümleler bu hızda okunamaz.', 'Çünkü sürücünün bakacak yalnızca birkaç saniyesi vardır.', 'Oysa sürücüler levhaları ezbere bilir.', 'Bu yüzden levhalar hikâye anlatır.', 'Levhalar geceleri kaldırılır.', 'Yollar her zaman boştur.', 'Neden olarak sürenin kısalığı gerekir.'],
  ['Bir takım yenildiğinde suçu tek kişide aramak kolaydır. ____ Böylece aynı eksik bir sonraki maçta yinelenmez.', 'Oysa oyunun neresinde aksadığını birlikte incelemek gerekir.', 'Bu yüzden o oyuncu hemen gönderilmelidir.', 'Yenilgi hiç konuşulmamalıdır.', 'Maçlar iptal edilmelidir.', 'Formalar değiştirilmelidir.', '"Eksik yinelenmez" inceleme gerektirir.'],
  ['Güneş enerjisi panelleri bulutlu günde de elektrik üretir. ____ Bu yüzden depolama ya da ek kaynak planlanır.', 'Fakat üretim açık havaya göre belirgin biçimde azalır.', 'Üstelik geceleri daha çok üretir.', 'Bulutlar panelleri yok eder.', 'Paneller yalnız kışın çalışır.', 'Elektrik hiç depolanamaz.', 'Ek kaynak ihtiyacı üretim azalmasından doğar.'],
];
const FLOW: [string, string, string, string, string][] = [
  ['Zeytinyağı soğuk ve karanlık yerde saklanmalıdır.', 'Işık yağın tadını zamanla bozar.', 'Sıcaklık da bu bozulmayı hızlandırır.', 'Kapağı sıkı kapatmak havayla teması azaltır.', 'Cam şişe üreten fabrikalar çok enerji harcar.'],
  ['Yürüyüş grubu pazar sabahları buluşuyor.', 'Rota her hafta farklı seçiliyor.', 'Yeni katılanlar için tempo yavaş tutuluyor.', 'Yürüyüş sonunda kısa bir esneme yapılıyor.', 'Spor ayakkabı fiyatları geçen yıl arttı.'],
  ['Kirpiler geceleri beslenir.', 'Böcek ve salyangoz yiyerek bahçeye yarar sağlar.', 'Tehlike anında top gibi büzülürler.', 'Kışı uykuda geçirmeleri enerji tasarrufu sağlar.', 'Bahçe hortumları farklı uzunlukta satılır.'],
  ['Sözlü sunumda giriş dikkati toplar.', 'Gelişme bölümü düşünceyi örneklerle destekler.', 'Sonuçta ana fikir kısaca yinelenir.', 'Süreyi önceden prova etmek taşmayı önler.', 'Projeksiyon cihazının ilk modelleri ağırdı.'],
  ['Pamuklu kumaş teri emer.', 'Bu nedenle sıcak havalarda rahatlık verir.', 'Yıkandığında kolay temizlenir.', 'Ancak geç kuruması dezavantaj olabilir.', 'Terziler ölçü almak için mezura kullanır.'],
  ['Okul gazetesi ayda bir çıkıyor.', 'Haberleri öğrenciler yazıyor.', 'Bir öğretmen yazıları gözden geçiriyor.', 'Basılan sayılar sınıflara dağıtılıyor.', 'Matbaa mürekkebi zor çıkar.'],
  ['Yağmur suyu toplamak şebeke suyunu korur.', 'Çatıdan gelen su bir depoda biriktirilir.', 'Bu su bahçe sulamada kullanılabilir.', 'Deponun kapalı olması sivrisinek üremesini önler.', 'Çatı kiremitleri farklı renklerde üretilir.'],
  ['Bellek oyunları dikkat ister.', 'Oyuncu kartların yerini aklında tutmaya çalışır.', 'Her açılan çift yeni bir ipucu verir.', 'Odaklanan oyuncu daha az hata yapar.', 'Kart destesi kutuları genellikle kartondur.'],
];
const STRUCTURE: [passage: string, answer: string][] = [
  ['Pazar yerinde kıpkırmızı domatesler, parlak mor patlıcanlar ve yeşil biber yığınları tezgâhları doldurmuştu.', 'Betimleme'],
  ['Efe merdivenleri ikişer ikişer çıktı, kapıyı çaldı, açan olmayınca anahtarı paspasın altında aradı.', 'Öyküleme'],
  ['Ekosistem, belli bir alandaki canlılar ile cansız çevrenin birbirini etkilediği bütündür.', 'Açıklama'],
  ['Bazıları sınavların kaldırılmasını istiyor. Bence sorun sınavın kendisi değil, tek sınava yüklenen aşırı anlamdır.', 'Tartışma'],
  ['İhtiyarın yüzü derin çizgilerle doluydu; beyaz kaşları gözlerinin üstüne sarkıyor, elleri nasırdan sertleşmiş görünüyordu.', 'Betimleme'],
  ['Vapur iskeleden ayrılırken Naz güverteye koştu. El salladı, sonra çantasından simidini çıkarıp martılara attı.', 'Öyküleme'],
  ['Erozyon, toprağın üst tabakasının su ve rüzgâr gibi etkenlerle aşınıp taşınmasıdır.', 'Açıklama'],
  ['Kitap okumanın modasının geçtiği öne sürülüyor. Oysa uzun bir düşünceyi sabırla izlemek hâlâ en iyi kitapla öğreniliyor.', 'Tartışma'],
];
const ORDER_SETS: [string, string, string, string][] = [
  ['Sabah erkenden balıkçı ağlarını teknesine yükledi.', 'Limandan ayrılıp bildiği avlanma yerine gitti.', 'Orada ağlarını denize bırakıp bir süre bekledi.', 'Bekleyişin sonunda dolu ağlarla limana döndü.'],
  ['Okulda bir atık pil kampanyası başlatılacağı açıklandı.', 'Açıklamanın ardından her kata toplama kutuları yerleştirildi.', 'Kutular birkaç hafta içinde pillerle doldu.', 'Dolan kutular geri dönüşüm merkezine teslim edildi.'],
  ['Ressam önce tuvaline kalemle hafif bir taslak çizdi.', 'Taslağın üzerine geniş fırçayla zemin renklerini sürdü.', 'Zemin kuruyunca ayrıntıları ince fırçayla işledi.', 'Ayrıntılar da bitince tablonun köşesine imzasını attı.'],
  ['Küçük kız bahçede yaralı bir kuş buldu.', 'Onu özenle bir kutuya koyup eve getirdi.', 'Evde birkaç gün boyunca kuşa su ve yem verdi.', 'İyileşen kuş sonunda pencereden uçup gitti.'],
  ['Toplantı için önce bir tarih belirlendi.', 'Belirlenen tarih üyelere duyuruldu.', 'Duyuruyu alan üyeler gündem önerilerini gönderdi.', 'Gelen öneriler birleştirilip gündem hazırlandı.'],
  ['Kışın sonunda dağdaki karlar erimeye başladı.', 'Eriyen karlar derelerin suyunu hızla yükseltti.', 'Yükselen su aşağıdaki tarlalara doğru taştı.', 'Taşkın çekildiğinde tarlalarda ince bir çamur kaldı.'],
  ['Mert yemek yapmak için önce tarifi dikkatle okudu.', 'Sonra tarifte yazan malzemeleri tezgâha dizdi.', 'Dizdiği malzemeleri sırasıyla tencereye ekledi.', 'Pişen yemeği en sonunda sofraya taşıdı.'],
  ['Şirket yeni ürünü için küçük bir deneme grubu kurdu.', 'Gruptakiler ürünü iki hafta boyunca kullandı.', 'Süre sonunda gözlemlerini yazılı olarak bildirdi.', 'Bildirimlere göre ürünün tasarımı değiştirildi.'],
];

export const BANK_3 = buildBatch(
  { main: MAIN, topic: TOPIC, detail: DETAIL, inference: INFERENCE, completion: COMPLETION, flow: FLOW, structure: STRUCTURE, order: ORDER_SETS },
  14,
);
