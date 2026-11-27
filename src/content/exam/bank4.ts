/** Soru bankasının 4. partisi (özgün). */
import { buildBatch, Choice } from './bankBuilder';

const MAIN: Choice[] = [
  ['Bir saati kurmayı unutursanız durur; arkadaşlık da böyledir. Aranmayan, sorulmayan bağlar sessizce zayıflar.', 'Arkadaşlık ilgi gösterildikçe sürer.', 'Saatler düzenli kurulmalıdır.', 'Arkadaşlıklar hiç bitmez.', 'Sessizlik dostluğu güçlendirir.', 'Eski arkadaşlar aranmamalıdır.', 'Benzetme, ilgisizliğin bağı zayıflattığını anlatıyor.'],
  ['Tarih yalnız savaş ve hükümdar adlarından oluşmaz. İnsanların ne yediği, nasıl ısındığı, çocuklarına hangi masalları anlattığı da tarihtir.', 'Gündelik yaşam da tarihin bir parçasıdır.', 'Savaşlar tarihte yer almamalıdır.', 'Masallar gerçek olayları anlatır.', 'Eskiden herkes aynı yemeği yerdi.', 'Hükümdarlar önemsizdir.', 'İkinci cümle tarihin kapsamını genişletiyor.'],
  ['Her şeyi aklında tutmaya çalışan kişi yorulur. Yapılacakları kâğıda döken ise zihnini asıl işe ayırabilir.', 'Yazıya dökmek zihni rahatlatıp işe odaklanmayı sağlar.', 'Güçlü bellek gereksizdir.', 'Kâğıt kullanmak israftır.', 'Yapılacak işler azaltılmalıdır.', 'Yorgunluk yazmaktan doğar.', 'İki durum karşılaştırılıp yazmanın yararı veriliyor.'],
  ['Müzik dinlemekle müzik yapmak aynı şey değildir. Çalan kişi sesin nasıl kurulduğunu içeriden tanır ve dinlediğinde daha çok şey duyar.', 'Müzik yapmak dinleme deneyimini zenginleştirir.', 'Dinlemek yararsızdır.', 'Herkes çalgı çalmalıdır.', 'Çalanlar müzik dinlemez.', 'Ses kurmak çok kolaydır.', 'Son cümle yapmanın dinlemeye katkısını söylüyor.'],
  ['Bilmediğimiz bir yerde soru sormaktan çekinirsek saatlerce dolaşabiliriz. Kısa bir soru çoğu zaman uzun bir aramayı önler.', 'Soru sormak zaman ve emek kazandırır.', 'Bilinmeyen yerlere gidilmemelidir.', 'Dolaşmak soru sormaktan iyidir.', 'Sorular uzun olmalıdır.', 'Herkes yolu yanlış tarif eder.', 'Son cümle ana düşünceyi özetliyor.'],
  ['Başkasının başarısını yalnız sonuçtan görürüz. Arkasındaki denemeleri bilmediğimiz için kendi emeğimiz bize yetersiz gelir.', 'Görünmeyen emeği hesaba katmamak yanlış karşılaştırmaya yol açar.', 'Başarı şansa bağlıdır.', 'Başkalarıyla hiç konuşulmamalıdır.', 'Sonuçlar emekten bağımsızdır.', 'Denemeler gizlenmelidir.', 'Görünmeyen çabanın karşılaştırmayı çarpıttığı anlatılıyor.'],
  ['Ağaçların yaşı gövdelerindeki halkalardan okunabilir. Dar halka zorlu bir yılı, geniş halka bol yağışı düşündürür. Ağaç yaşadıklarını içine yazar.', 'Ağaç halkaları geçmiş koşulların izini taşır.', 'Her ağaç aynı hızda büyür.', 'Yağış ağaçlara zarar verir.', 'Halkalar yalnız süs içindir.', 'Ağaçlar yazı yazabilir.', 'Son cümle benzetmeyle ana fikri veriyor.'],
  ['Oyun oynayan çocuk kural koymayı, sıra beklemeyi ve kaybetmeyi dener. Bunları ders anlatır gibi öğretmek çok daha güçtür.', 'Oyun, toplumsal becerileri yaşayarak öğretir.', 'Dersler kaldırılmalıdır.', 'Kaybetmek çocuklara zarar verir.', 'Oyunlarda kural olmaz.', 'Sıra beklemek oyunu bozar.', 'Oyunun öğretici yönü vurgulanıyor.'],
  ['Bir kentin adını değiştirmek haritada birkaç saniyelik iştir. Oysa insanlar yıllarca eski adı kullanmayı sürdürebilir.', 'Alışılmış adlar resmî değişiklikten daha yavaş değişir.', 'Haritalar güncellenmez.', 'Kent adları hiç değişmemelidir.', 'İnsanlar yeni adları öğrenemez.', 'Adlar önemsizdir.', '"Oysa" ile alışkanlığın kalıcılığı vurgulanıyor.'],
  ['Hızlı ulaşan haber çoğu zaman eksiktir. Ayrıntılar geldikçe ilk anlatılanın yanlış olduğu da ortaya çıkabilir.', 'İlk haberlere temkinli yaklaşılmalıdır.', 'Haberler geç yayımlanmalıdır.', 'Ayrıntılar gereksizdir.', 'Her haber yanlıştır.', 'Hızlı haber her zaman daha doğrudur.', 'Eksiklik ve yanlışlık olasılığı temkin gerektirir.'],
];
const TOPIC: Choice[] = [
  ['Yarasalar gece uçarken ses çıkarır ve yankıyı dinler. Böylece karanlıkta engelleri ve avlarını fark eder.', 'Yarasaların Sesle Yön Bulması', 'Gece Böcekleri', 'Mağara Oluşumu', 'İnsan İşitmesi', 'Kuş Tüyleri', 'Yankıyla algılama anlatılıyor.'],
  ['Eski çağlarda insanlar zamanı gölgenin boyundan anlardı. Güneş saatleri bu gözleme dayanılarak yapıldı.', 'Güneş Saatinin Doğuşu', 'Kol Saati Modası', 'Güneş Tutulması', 'Gölge Oyunu', 'Takvim Satışı', 'Gölge ile zaman ölçümü anlatılıyor.'],
  ['Mantar ne bitki ne hayvandır. Kendi besinini üretemez; çürüyen maddeleri parçalayarak beslenir.', 'Mantarların Farklı Yaşam Biçimi', 'Yemeklik Sebzeler', 'Orman Yangınları', 'Hayvan Beslenmesi', 'Toprak Satışı', 'Mantarın ayrı niteliği anlatılıyor.'],
  ['Posta güvercinleri uzak yerlerden yuvalarına dönebilir. Bu yetenek yüzyıllarca haber iletmekte kullanıldı.', 'Haber Taşıyan Güvercinler', 'Kuş Yemi Üretimi', 'Telefonun İcadı', 'Şehir Meydanları', 'Kuş Kafesleri', 'Güvercinle haberleşme konu ediliyor.'],
  ['Bambu çok hızlı büyür ve hafif olmasına karşın dayanıklıdır. Bu yüzden yapı ve eşya yapımında kullanılır.', 'Bambunun Kullanışlı Özellikleri', 'Panda Yaşamı', 'Mobilya Mağazaları', 'Yağmur Ormanı İklimi', 'Kâğıt Fiyatları', 'Özellikler ve kullanım anlatılıyor.'],
  ['Sıcak hava soğuk havadan hafiftir ve yükselir. Sıcak hava balonları bu ilkeye dayanarak göğe çıkar.', 'Balonların Yükselme İlkesi', 'Uçak Biletleri', 'Rüzgâr Türbinleri', 'Kış Giysileri', 'Gökyüzünün Rengi', 'İlke ve uygulaması anlatılıyor.'],
  ['Sinemanın ilk yıllarında filmler sessizdi. Gösterim sırasında salonda bir müzisyen canlı çalardı.', 'Sessiz Film Döneminde Müzik', 'Kamera Üretimi', 'Opera Salonları', 'Film Afişleri', 'Ses Kayıt Stüdyoları', 'Sessiz sinema ve canlı müzik.'],
  ['Kış uykusuna yatan hayvanların kalp atışı yavaşlar. Böylece depoladıkları enerjiyle aylarca yaşayabilirler.', 'Kış Uykusunda Enerji Tasarrufu', 'Kar Yağışı', 'Hayvanat Bahçeleri', 'Yaz Göçleri', 'Beslenme Çantası', 'Enerji tasarrufu anlatılıyor.'],
  ['Sokak adları bazen orada eskiden yapılan işi anlatır. Demirciler, bakırcılar adı bugün de yaşar.', 'Sokak Adlarında Eski Meslekler', 'Yol Onarımı', 'Maden Çıkarma', 'Posta Kodları', 'Apartman Yönetimi', 'Adların mesleklerden gelmesi anlatılıyor.'],
  ['Cam, kumun yüksek sıcaklıkta eritilmesiyle elde edilir. Kırık camlar yeniden eritilip tekrar tekrar kullanılabilir.', 'Camın Üretimi ve Yeniden Kullanımı', 'Kumsal Temizliği', 'Pencere Boyaları', 'Şişe Koleksiyonu', 'Isınma Giderleri', 'Üretim ve geri dönüşüm.'],
];
const DETAIL: Choice[] = [
  ['Köy okulunda yeni bir kütüphane açıldı. Kitaplar mezunlarca bağışlandı. Raflar marangoz bir veli tarafından yapıldı. Öğle arasında açık olacak.', 'Bağışlanan kitap sayısına', 'Açılan yere', 'Kitapların kaynağına', 'Rafları yapana', 'Açık olacağı zamana', 'Parçada kitap sayısı verilmiyor.'],
  ['Kooperatif kadın üreticilerce kuruldu. Reçel ve erişte satılıyor. Ürünler cam kavanozda sunuluyor. Satışlar internetten de yapılıyor.', 'Kooperatifin yıllık kazancına', 'Kimlerin kurduğuna', 'Satılan ürünlere', 'Sunum biçimine', 'Satış yoluna', 'Kazanç bilgisi yer almıyor.'],
  ['Gözlemevi açık gecelerde ziyarete açılıyor. Teleskop sırası kayıtla alınıyor. Bir rehber gökyüzünü anlatıyor. Sıcak giyinmek öneriliyor.', 'Teleskobun büyütme gücüne', 'Ziyaret koşuluna', 'Sıra alma yöntemine', 'Rehber anlatımına', 'Giyim önerisine', 'Teleskop özellikleri anlatılmıyor.'],
  ['Eski değirmen kafeye dönüştürüldü. Taş duvarlar korundu. Menüde yöresel yemekler var. Pazartesi hizmet verilmiyor.', 'Dönüştürme işini kimin yaptığına', 'Yapının yeni işlevine', 'Korunan bölüme', 'Menüye', 'Kapalı güne', 'Kimin yaptığı söylenmiyor.'],
  ['Atölyede seramik dersleri veriliyor. Gruplar en çok sekiz kişilik. Malzeme ücrete dahil. Ürünler fırınlandıktan bir hafta sonra teslim ediliyor.', 'Ders ücretinin miktarına', 'Verilen eğitime', 'Grup büyüklüğüne', 'Malzeme durumuna', 'Teslim süresine', 'Miktar belirtilmiyor.'],
  ['Sahil yolunda yeni bisiklet park yerleri yapıldı. Her birine altı bisiklet sığıyor. Yanlarında tamir pompası bulunuyor. Kullanım ücretsiz.', 'Kaç park yeri yapıldığına', 'Yapıldıkları yere', 'Kapasitelerine', 'Yanlarındaki araca', 'Ücret durumuna', 'Toplam sayı verilmiyor.'],
  ['Şiir dinletisi cuma akşamı yapılacak. Genç şairler kendi eserlerini okuyacak. Aralarda bağlama çalınacak. Giriş serbest.', 'Dinletinin yapılacağı salona', 'Zamanına', 'Okuyacak kişilere', 'Ara müziğine', 'Giriş durumuna', 'Parçada dinletinin yapılacağı salon belirtilmiyor.'],
  ['Belediye ağaç budamasını şubatta yapacak. Çalışma ana caddeden başlayacak. Kesilen dallar yakacak olarak dağıtılacak. Araç sahipleri uyarılacak.', 'Kaç ağacın budanacağına', 'Budama ayına', 'Başlanacak yere', 'Dalların kullanımına', 'Yapılacak uyarıya', 'Parçada budanacak ağaçların sayısı verilmiyor.'],
  ['Dil kafesinde her salı İngilizce konuşuluyor. Katılım için üyelik gerekmiyor. Masalarda konu kartları var. Gönüllü bir öğretmen yardımcı oluyor.', 'Buluşmanın ne kadar sürdüğüne', 'Konuşulan güne ve dile', 'Üyelik koşuluna', 'Masadaki materyale', 'Öğretmen desteğine', 'Parçada buluşmanın ne kadar sürdüğü belirtilmiyor.'],
  ['Hastane bahçesine dinlenme alanı kuruldu. Banklar gölgelik altında. Küçük bir süs havuzu var. Sigara içmek yasak.', 'Alanın ne zaman açıldığına', 'Kurulduğu yere', 'Bankların konumuna', 'Havuza', 'Yasağa', 'Açılış zamanı verilmiyor.'],
];
const INFERENCE: Choice[] = [
  ['Esra her akşam balkondaki domates fidelerinin yapraklarını tek tek kontrol ediyor.', 'Esra bitkilerine özen gösteriyor.', 'Esra domates sevmiyor.', 'Fideler kurumuş ve atılmıştır.', 'Balkonda bitki yoktur.', 'Esra bitkileri satmıştır.', 'Düzenli kontrol özeni gösterir.'],
  ['Konser biletleri satışa çıktıktan on dakika sonra gişeye “tükendi” yazısı asıldı.', 'Konsere talep çok yüksektir.', 'Konser iptal edilmiştir.', 'Biletler satışa çıkmamıştır.', 'Salon boş kalacaktır.', 'Gişe bozulmuştur.', 'Hızlı tükenme yüksek talebi gösterir.'],
  ['Dedem gazeteyi okurken artık kollarını iyice uzatıyor.', 'Yakını görmede güçlük çekiyor olabilir.', 'Gazeteyi sevmiyor.', 'Kolları ağrımıyor.', 'Uzağı hiç göremiyor.', 'Okumayı bırakmıştır.', 'Uzak tutma yakın görme sorununa işaret edebilir.'],
  ['Parktaki banklar yeni boyanmış, her birinin üzerine kâğıt yapıştırılmıştı.', 'İnsanların henüz oturmaması istenmektedir.', 'Banklar satılıktır.', 'Park kapatılmıştır.', 'Boya çoktan kurumuştur.', 'Banklar kaldırılacaktır.', 'Yeni boya ve uyarı kâğıdı bunu düşündürür.'],
  ['Nil, üç gündür telefonunu şarja takmadığı halde pili hâlâ yarıdan fazlaydı.', 'Telefonu az kullanmış olabilir.', 'Telefon bozuktur ve açılmaz.', 'Nil sürekli video izlemiştir.', 'Pil tamamen bitmiştir.', 'Nil telefon almamıştır.', 'Az tüketim az kullanımı düşündürür.'],
  ['Fırının rafları akşam altıda boşalmıştı; usta ertesi gün için daha çok un istedi.', 'Üretimi artırmayı düşünüyor.', 'Fırını kapatacaktır.', 'Ekmekler hiç satılmamıştır.', 'Un stoku fazladır.', 'Usta işten ayrılacaktır.', 'Tükenme ve ek un üretim artışını gösterir.'],
  ['Toplantı odasının kapısında “Sessiz olun, sınav var” yazıyordu.', 'İçeride o sırada sınav yapılmaktadır.', 'Toplantı iptal edilmiştir ve oda boştur.', 'Oda tamir edilmektedir.', 'Sınav gelecek yıldır.', 'İçeride konser vardır.', 'Yazı doğrudan sınavı bildiriyor.'],
  ['Baran sözlüğün kenarları yıpranmış sayfalarına bakarak gülümsedi; üzerinde yıllar önceki notları duruyordu.', 'Sözlük uzun süre kullanılmıştır.', 'Sözlük yeni alınmıştır.', 'Hiç açılmamıştır.', 'Notlar başkasına aittir ve silinmiştir.', 'Baran sözlük kullanmaz.', 'Yıpranma ve eski notlar uzun kullanımı gösterir.'],
  ['Kafede garson, yağmur başlayınca dışarıdaki minderleri hızla içeri taşıdı.', 'Minderlerin ıslanmasını önlemek istiyor.', 'Kafe kapanıyordur ve satılacaktır.', 'Minderler yenidir.', 'Hava güneşlidir.', 'Müşteriler minder istemiştir.', 'Yağmurda taşıma koruma amaçlıdır.'],
  ['Sınıfın penceresindeki fasulye fidesi ışığa doğru eğilmişti.', 'Bitki ışık yönüne doğru büyüyor.', 'Fide susuz kalmıştır.', 'Pencere hiç ışık almaz.', 'Fide plastiktir.', 'Bitki karanlığı arar.', 'Işığa eğilme yönelimi gösterir.'],
];
const COMPLETION: Choice[] = [
  ['Mevsimlik meyveler dalında olgunlaşır. ____ Bu yüzden zamanında yenen meyve daha lezzetli olur.', 'Uzun yol beklemeden sofraya ulaşır.', 'Hep yeşilken toplanıp aylarca bekletilir.', 'Meyveler tatsızdır.', 'Dalları budanmaz.', 'Fiyatları sabittir.', 'Lezzet için kısa yol bilgisi gerekir.'],
  ['Bir sorunu büyük bir bütün olarak görmek gözümüzü korkutur. ____ Böylece nereden başlayacağımız belli olur.', 'Onu küçük parçalara ayırmak işimizi kolaylaştırır.', 'Bu yüzden sorunu yok saymalıyız.', 'Korku sorunu çözer.', 'Büyük sorunlar çözülemez.', 'Başkasını beklemek gerekir.', '"Nereden başlanacağı" parçalamayı gerektirir.'],
  ['Eski radyolar ısınmadan ses vermezdi. ____ Dinleyici düğmeyi çevirip biraz beklerdi.', 'Çünkü içlerindeki lambaların ısınması gerekirdi.', 'Oysa hemen çalışırlardı.', 'Bu yüzden radyo hiç dinlenmezdi.', 'Radyolar küçüktü.', 'Düğmeleri yoktu.', 'Beklemenin nedeni açıklanmalı.'],
  ['Spor salonunda ağırlığı birden artırmak sakatlığa yol açabilir. ____ Beden de yeni yüke uyum sağlar.', 'Yükü haftalara yayarak artırmak daha güvenlidir.', 'Bu nedenle hep en ağır olanla başlanmalı.', 'Spor yapmak zararlıdır.', 'Ağırlıklar renklidir.', 'Dinlenme gerekmez.', 'Uyum aşamalı artış ister.'],
  ['Bir belgesel yalnız görüntü göstermez. ____ Bu yüzden izlerken anlatıcının seçimlerini de düşünmek gerekir.', 'Neyin gösterileceğine birisi karar verir.', 'Her şeyi olduğu gibi ve eksiksiz verir.', 'Belgeseller sessizdir.', 'Kamera kendiliğinden çalışır.', 'İzleyici seçim yapamaz.', 'Seçimleri düşünme gereği buradan doğar.'],
  ['Kâğıda yazılan not elde kalır. ____ Yine de yedeği olmayan kâğıt kaybolduğunda geri gelmez.', 'Pil ya da bağlantı istemeden okunabilir.', 'Kendiliğinden kopyalanır.', 'Suya karşı dayanıklıdır.', 'Arama düğmesi vardır.', 'Hiç yer kaplamaz.', '"Yine de" öncesinde bir üstünlük gerekir.'],
  ['Arkadaşım yemek tarifini anlatırken ölçüleri “göz kararı” diye geçti. ____ İlk denememde hamur cıvık oldu.', 'Ne kadar un koyacağımı bilemedim.', 'Tarifte her ölçü yazılıydı.', 'Hamur yapmaktan vazgeçtim.', 'Fırın çalışmıyordu.', 'Unu fazlasıyla ölçtüm ve tarttım.', 'Belirsiz ölçü sonucu doğurur.'],
  ['Kalabalık şehirlerde herkes özel araç kullanırsa yollar tıkanır. ____ Bu nedenle toplu taşıma desteklenmelidir.', 'Tek bir otobüs onlarca aracın yerini tutabilir.', 'Özel araçlar yer kaplamaz.', 'Yollar sınırsız genişler.', 'Otobüsler yolcu almaz.', 'Trafik geceleri artar.', 'Toplu taşıma gerekçesi gerekir.'],
  ['İlk kez sahneye çıkan oyuncunun sesi titreyebilir. ____ Provalar bu yüzden önemlidir.', 'Tekrar ettikçe heyecan yönetilebilir hale gelir.', 'Heyecan hiçbir zaman azalmaz.', 'Oyuncular prova yapmaz.', 'Sahne ışıkları söndürülmelidir.', 'Seyirci alınmamalıdır.', 'Provanın önemi gerekçelendirilmeli.'],
  ['Arıların dilinde dans vardır. ____ Diğer arılar bu hareketleri izleyip yola çıkar.', 'Besin bulan arı yönü ve uzaklığı hareketleriyle bildirir.', 'Arılar hiç haberleşmez.', 'Dans yalnız eğlence içindir.', 'Kovanlar karanlıktır.', 'Bal kışın tüketilir.', 'Sonraki cümle bilgi aktarımını gerektiriyor.'],
];
const FLOW: [string, string, string, string, string][] = [
  ['Seraler bitkileri soğuktan korur.', 'Cam ya da naylon örtü güneş ısısını içeride tutar.', 'Böylece mevsim dışında da ürün alınabilir.', 'İçerideki nem düzenli olarak denetlenmelidir.', 'Cam silmek için gazete kâğıdı kullananlar vardır.'],
  ['Deniz fenerleri gemilere yol gösterir.', 'Her fenerin ışık ritmi farklıdır.', 'Kaptan bu ritimden nerede olduğunu anlar.', 'Sisli havalarda sesli uyarılar da kullanılır.', 'Fener alayları bayramlarda düzenlenir.'],
  ['Günlük tutmak duyguları adlandırmaya yardım eder.', 'Yazılanlar sonradan okununca değişim fark edilir.', 'Bunun için uzun yazmak gerekmez.', 'Birkaç dürüst cümle yeterlidir.', 'Defter kapakları deriden de yapılabilir.'],
  ['Halı dokumak büyük sabır ister.', 'İlmekler tek tek atılır.', 'Desen önceden kâğıtta planlanır.', 'Büyük bir halı aylarca sürebilir.', 'Elektrikli süpürgeler farklı güçlerde üretilir.'],
  ['Kompozisyona plan yaparak başlamak yararlıdır.', 'Ana düşünce önceden belirlenir.', 'Her paragrafa bir yardımcı fikir verilir.', 'Böylece yazı dağılmadan ilerler.', 'Dolma kalem mürekkebi leke bırakabilir.'],
  ['Su aygırı gündüzleri çoğunlukla suda kalır.', 'Su, derisini güneşten korur.', 'Geceleri otlamak için karaya çıkar.', 'İri bedenine karşın karada hızlı hareket edebilir.', 'Oyuncakçılarda peluş hayvanlar satılır.'],
  ['Ekmek mayası canlı bir organizmadır.', 'Ilık ortamda şekeri parçalar.', 'Bu sırada çıkan gaz hamuru kabartır.', 'Fazla sıcak su mayaya zarar verir.', 'Fırın eldivenleri kalın kumaştan dikilir.'],
  ['Yürüyen merdivenler kalabalık yerlerde akışı hızlandırır.', 'Basamaklar kesintisiz döner.', 'Sağda durup solu boş bırakmak yaygın bir nezakettir.', 'Acil durumda durdurma düğmesi kullanılır.', 'Ahşap merdiven cilası zamanla matlaşır.'],
  ['Resim yaparken ışığın yönü önemlidir.', 'Gölgeler nesneye hacim kazandırır.', 'Açık ve koyu tonlar derinlik duygusu verir.', 'Bu yüzden ressam önce ışık kaynağını belirler.', 'Müze girişlerinde vestiyer bulunur.'],
  ['Dağcılar yola çıkmadan hava durumunu inceler.', 'Fırtına beklentisinde tırmanış ertelenir.', 'Ekip dönüş saatini yakınlarına bildirir.', 'Yedek giysi ve ışık çantada bulunur.', 'Dağ manzaralı takvimler yılbaşında satılır.'],
];
const STRUCTURE: [passage: string, answer: string][] = [
  ['Kış bahçesi bembeyazdı; çıplak dallarda ince buz saçakları, çit kenarında yarısı kara gömülü paslı bir kova görünüyordu.', 'Betimleme'],
  ['Hakan düdüğü duyunca fırladı, ilk virajda arkadaşını geçti, son metrelerde nefesi kesilse de çizgiye uzandı.', 'Öyküleme'],
  ['Yoğunluk, bir maddenin birim hacmindeki kütle miktarıdır ve maddeleri ayırt etmekte kullanılır.', 'Açıklama'],
  ['Kentlerde yeşil alanın lüks olduğunu düşünenler yanılıyor; park, en az yol kadar temel bir ihtiyaçtır.', 'Tartışma'],
  ['Çarşının girişindeki bakırcı dükkânında irili ufaklı kazanlar parlıyor, tavandan işlemeli cezveler sarkıyordu.', 'Betimleme'],
  ['Annem telefonu kapatınca bir süre sustu. Sonra dolabı açtı, bavulu indirdi ve eşyalarını toplamaya başladı.', 'Öyküleme'],
  ['Enflasyon, mal ve hizmet fiyatlarının genel düzeyinde süregelen artıştır.', 'Açıklama'],
  ['Çeviri eserin aslının yerini tutmayacağı söylenir. Ama iyi çeviri olmasa dünya edebiyatının çoğu bize kapalı kalırdı.', 'Tartışma'],
  ['Kuyunun taş bileziği ip izleriyle oyulmuştu; yanında yosunlu bir yalak ve gölgesini üstüne salan yaşlı bir dut vardı.', 'Betimleme'],
  ['Ders zili çaldığında Irmak hâlâ koşuyordu. Koridoru geçti, kapıyı araladı ve usulca sırasına oturdu.', 'Öyküleme'],
];
const ORDER_SETS: [string, string, string, string][] = [
  ['Çiftçi sonbaharda tarlasını sürdü.', 'Sürülen toprağa buğday tohumlarını ekti.', 'Ekilen tohumlar ilkbaharda yeşerip boy verdi.', 'Boy veren başaklar yazın biçilip toplandı.'],
  ['Genç mühendis ilk olarak sorunu yerinde inceledi.', 'İncelemeden sonra birkaç çözüm önerisi hazırladı.', 'Hazırladığı önerileri ekibiyle tartıştı.', 'Tartışmada seçilen öneri hemen uygulandı.'],
  ['Evde bir anda elektrikler kesildi.', 'Bunun üzerine babam çekmeceden bir mum çıkardı.', 'Çıkardığı mumu yakıp masaya koydu.', 'O ışığın çevresinde herkes sohbet etmeye başladı.'],
  ['Önce eski sandalyenin boyası zımparayla temizlendi.', 'Temizlenen yüzeye astar sürüldü.', 'Astar kuruyunca istenen renge boyandı.', 'Boya da kurduktan sonra sandalye balkona kondu.'],
  ['Kütüphaneye bağışlanan kitaplar önce ayıklandı.', 'Ayıklananlar konularına göre gruplandı.', 'Gruplanan kitaplara etiket yapıştırıldı.', 'Etiketlenen kitaplar raflardaki yerlerini aldı.'],
  ['Arkadaşlar hafta sonu için bir piknik planladı.', 'Plana göre herkes bir yiyecek hazırladı.', 'Hazırlananlarla birlikte göl kenarına gidildi.', 'Dönüşten önce bütün çöpler toplandı.'],
  ['Bebek önce başını dik tutmayı öğrendi.', 'Birkaç ay sonra desteksiz oturmaya başladı.', 'Oturmayı emeklemek izledi.', 'En sonunda ayağa kalkıp ilk adımını attı.'],
  ['Gazeteci olayla ilgili bir ihbar aldı.', 'İhbarın doğruluğunu iki ayrı kaynaktan araştırdı.', 'Doğrulanan bilgilerle haberini yazdı.', 'Yazılan haber ertesi gün yayımlandı.'],
  ['Terzi ilk olarak müşterinin ölçülerini aldı.', 'Aldığı ölçülere göre kumaşı kesti.', 'Kesilen parçaları geçici olarak teyelledi.', 'Provadan sonra da kalıcı dikişi attı.'],
  ['Okul bahçesine bir fidan dikileceği duyuruldu.', 'Duyuruyu duyan öğrenciler çukur kazdı.', 'Kazılan çukura fidan yerleştirilip toprakla örtüldü.', 'Dikim, fidana verilen can suyuyla tamamlandı.'],
];

export const BANK_4 = buildBatch(
  { main: MAIN, topic: TOPIC, detail: DETAIL, inference: INFERENCE, completion: COMPLETION, flow: FLOW, structure: STRUCTURE, order: ORDER_SETS },
  22,
);
