import type { RawText } from './types';

/** İş belgeleri (rapor, e-posta, yönerge). Kurum ve kişiler kurgudur; metinler özgündür. */
export const WORK: RawText[] = [
  ['work-purpose', 'E-posta: Depo Sayımı Tarihi', 'Konu: Depo sayımı cuma gününe alındı. Merhaba, yıl ortası depo sayımını perşembe yerine cuma günü yapacağız. Değişikliğin nedeni, perşembe sabahı beklenen büyük teslimattır. Sayım saat dokuzda başlayacak ve öğleden sonra üçe kadar sürecek. Bu süre içinde depodan ürün çıkışı yapılmayacak. Satış ekibinden acil siparişleri en geç perşembe saat on altıya kadar bildirmesini rica ediyorum. Sayıma her bölümden bir kişi katılacak; isimleri çarşamba günü bana iletin. Teşekkürler.', 'Bir e-postada tarih, istek ve son süreyi ayırırsın.', 'Konu satırını oku, sonra senden ne istendiğini ara.', [
    ['Sayım neden cumaya alındı?', 'Perşembe sabahı büyük teslimat beklendiği için', 'Cuma tatil olduğu için', 'Depo boya yapılacağı için', 'Satış ekibi izinli olduğu için'],
    ['Acil siparişler ne zamana kadar bildirilmeli?', 'Perşembe saat on altıya kadar', 'Cuma saat dokuza kadar', 'Çarşamba öğlene kadar', 'Cuma saat on beşe kadar'],
    ['İsimler hangi gün iletilecek?', 'Çarşamba', 'Perşembe', 'Cuma', 'Pazartesi'],
  ]],
  ['work-summary', 'Rapor Özeti: Müşteri Destek Süreleri', 'Yönetici özeti. Bu çeyrekte destek taleplerine ilk yanıt süresi ortalama altı saatten dört saate indi. İyileşmenin ana kaynağı, sık sorulan sorular için hazırlanan yanıt şablonlarıdır. Buna karşın çözüm süresi değişmedi ve iki gün olarak kaldı. İncelemede, teknik ekibe aktarılan taleplerin uzun süre sırada beklediği görüldü. Önerimiz, teknik ekipte her gün bir kişinin yalnızca aktarılan taleplere bakmasıdır. Uygulama önce bir ay denenecek, sonuçlar ay sonunda yeniden değerlendirilecektir.', 'Yönetici özetinde sonuç, neden ve öneriyi yakalarsın.', 'Önce sayıları ve "önerimiz" sözünü bul.', [
    ['İlk yanıt süresi nasıl değişti?', 'Altı saatten dört saate indi', 'Dört saatten altı saate çıktı', 'İki gün oldu', 'Hiç değişmedi'],
    ['Çözüm süresinin değişmemesinin nedeni olarak ne görüldü?', 'Aktarılan taleplerin sırada beklemesi', 'Şablonların hatalı olması', 'Müşteri sayısının azalması', 'Destek ekibinin izinde olması'],
    ['Öneri ne kadar süre denenecek?', 'Bir ay', 'Bir hafta', 'Bir çeyrek', 'Bir yıl'],
  ]],
  ['work-minutes', 'Toplantı Tutanağı: Ofis Taşınması', 'Toplantıda yeni ofise taşınma planı görüşüldü. Taşınmanın ayın son hafta sonunda yapılmasına karar verildi. Bilgi işlem birimi bilgisayarların paketlenmesinden sorumlu olacak. İdari birim nakliye firmasıyla sözleşmeyi gelecek salıya kadar imzalayacak. Arşiv dosyalarının hangilerinin dijital ortama aktarılacağı konusunda karar verilemedi; konu bir sonraki toplantıya bırakıldı. Her çalışan kendi masasındaki kişisel eşyaları cuma akşamı kutulayacak. Bir sonraki toplantı iki hafta sonra yapılacak.', 'Tutanakta karar, sorumlu ve açık kalan konuyu ayırırsın.', '"Karar verildi" ile "bırakıldı" ifadelerini karşılaştır.', [
    ['Bilgisayarların paketlenmesinden kim sorumlu?', 'Bilgi işlem birimi', 'İdari birim', 'Her çalışan', 'Nakliye firması'],
    ['Hangi konuda karar verilemedi?', 'Dijitale aktarılacak arşiv dosyaları', 'Taşınma tarihi', 'Nakliye sorumlusu', 'Kişisel eşyalar'],
    ['Sözleşme ne zamana kadar imzalanacak?', 'Gelecek salıya kadar', 'Cuma akşamına kadar', 'İki hafta sonra', 'Ay sonunda'],
  ]],
  ['work-policy', 'Yönerge: Uzaktan Çalışma Kuralları', 'Çalışanlar, yöneticisinin onayıyla haftada en çok iki gün uzaktan çalışabilir. Deneme süresindeki çalışanlar bu uygulamadan yararlanamaz. Uzaktan çalışılan günlerde saat on ile on altı arasında ulaşılabilir olmak zorunludur. Müşteri verileri yalnızca şirketin verdiği bilgisayarda işlenir; kişisel cihaza kopyalanamaz. Talep en geç bir gün önceden sisteme girilir. Ekip toplantısının olduğu gün ofiste bulunmak esastır, ancak yönetici istisna tanıyabilir.', 'Kural metninde koşul, yasak ve istisnayı ayırırsın.', '"Ancak, yalnızca, zorunlu" sözcüklerinde yavaşla.', [
    ['Kimler uzaktan çalışamaz?', 'Deneme süresindekiler', 'Müşteriyle çalışanlar', 'İki yıldan eskiler', 'Yöneticiler'],
    ['Hangi saatlerde ulaşılabilir olunmalı?', 'On ile on altı arasında', 'Dokuz ile on yedi arasında', 'Yalnızca sabah', 'Gün boyunca gerekmez'],
    ['Toplantı günü kuralının istisnasını kim tanıyabilir?', 'Yönetici', 'Çalışanın kendisi', 'Bilgi işlem', 'Müşteri'],
  ]],
  ['work-proposal', 'Teklif: Yemekhanede Atık Azaltma', 'Yemekhanede her gün yaklaşık otuz porsiyon yemek artıyor. Artışın başlıca nedeni, kaç kişinin yiyeceğinin önceden bilinmemesidir. Çalışanların bir gün önceden telefondan katılım bildirmesini öneriyoruz. Benzer bir uygulama küçük bir ekipte iki hafta denendi ve artan porsiyon sayısı yarıya indi. Uygulamanın yazılım maliyeti düşüktür, çünkü mevcut duyuru sistemi kullanılabilir. Risk, bazı çalışanların bildirim yapmayı unutmasıdır; bunun için akşam hatırlatma mesajı gönderilebilir.', 'Teklifte sorun, çözüm, kanıt ve riski sırayla bulursun.', 'Dört soruyla tara: Sorun? Öneri? Kanıt? Risk?', [
    ['Artışın başlıca nedeni nedir?', 'Kaç kişinin yiyeceğinin bilinmemesi', 'Yemeklerin pahalı olması', 'Mutfağın küçük olması', 'Menünün hiç değişmemesi'],
    ['Deneme sonucunda ne oldu?', 'Artan porsiyon yarıya indi', 'Maliyet iki katına çıktı', 'Katılım azaldı', 'Hiç fark olmadı'],
    ['Belirtilen risk için ne öneriliyor?', 'Akşam hatırlatma mesajı', 'Ceza uygulaması', 'Yemekhanenin kapatılması', 'Daha fazla yemek pişirilmesi'],
  ]],
  ['work-numbers', 'Satış Raporu: Üç Aylık Görünüm', 'Üç aylık toplam satış geçen döneme göre yüzde sekiz arttı. Artışın büyük bölümü internet satışlarından geldi; bu kanal yüzde yirmi büyüdü. Mağaza satışları ise yüzde iki geriledi. En çok satan ürün grubu ev gereçleri oldu. İade oranı yüzde beşten yüzde yediye yükseldi ve bunun çoğu kargoda hasar gören cam ürünlerden kaynaklandı. Gelecek dönemde cam ürünlerde daha dayanıklı paket kullanılacak.', 'Sayılı bir raporda yönü ve nedeni birlikte okursun.', 'Her yüzdenin neye ait olduğunu kontrol et.', [
    ['Hangi kanal geriledi?', 'Mağaza satışları', 'İnternet satışları', 'Toplam satış', 'Ev gereçleri'],
    ['İade oranı hangi düzeye çıktı?', 'Yüzde yedi', 'Yüzde beş', 'Yüzde sekiz', 'Yüzde yirmi'],
    ['İadelerin çoğunun nedeni neydi?', 'Kargoda hasar gören cam ürünler', 'Yanlış fiyat etiketi', 'Geç teslimat', 'Eksik fatura'],
  ]],
  ['work-actions', 'E-posta Zinciri: Fuar Hazırlığı', 'Selin Hanım’ın notu: Fuar standımız onaylandı, açılış on iki mayısta. Broşür metnini pazarlama ekibi nisanın sonuna kadar hazırlayacak. Mert Bey’in yanıtı: Metni hazırlayabiliriz, ancak ürün fotoğrafları henüz elimizde yok. Fotoğraflar gelmezse baskı bir hafta gecikir. Selin Hanım’ın yanıtı: Fotoğrafları tasarım ekibinden yirmi nisana kadar istiyorum. Ayrıca stantta görevli olacak üç kişinin adını cuma günü paylaşın.', 'Yazışmada kimin neyi ne zamana yapacağını çıkarırsın.', 'Her isteğin yanına sorumlu ve tarih koy.', [
    ['Baskının gecikmesine ne yol açabilir?', 'Ürün fotoğraflarının gelmemesi', 'Standın onaylanmaması', 'Broşür metninin uzun olması', 'Fuarın ertelenmesi'],
    ['Fotoğraflar kimden istendi?', 'Tasarım ekibinden', 'Pazarlama ekibinden', 'Matbaadan', 'Fuar yönetiminden'],
    ['Fuar ne zaman açılacak?', 'On iki mayısta', 'Yirmi nisanda', 'Nisan sonunda', 'Cuma günü'],
  ]],
  ['work-contract', 'Hizmet Koşulları: Bakım Anlaşması', 'Bakım hizmeti, asansörlerin ayda bir kez kontrol edilmesini kapsar. Arıza bildirimi yapıldığında ekip en geç dört saat içinde yerinde olur. Parça değişimi aylık ücrete dahil değildir ve ayrıca faturalandırılır. Taraflar, bitiş tarihinden otuz gün önce yazılı bildirimde bulunmazsa sözleşme bir yıl daha uzar. Kullanım hatasından doğan arızalarda işçilik ücreti de alınır.', 'Sözleşme dilinde yükümlülük, istisna ve süreyi ayırırsın.', '"Dahil değildir" ve "bulunmazsa" ifadelerini kaçırma.', [
    ['Aylık ücrete ne dahil değildir?', 'Parça değişimi', 'Aylık kontrol', 'Arıza için gelinmesi', 'Yazılı bildirim'],
    ['Sözleşme hangi durumda uzar?', 'Otuz gün önce yazılı bildirim yapılmazsa', 'Her arızadan sonra', 'Parça değiştirilince', 'Ücret ödenmezse'],
    ['Ekip arızaya en geç ne zaman gelir?', 'Dört saat içinde', 'Bir gün içinde', 'Otuz gün içinde', 'Ay sonunda'],
  ]],
  ['work-incident', 'Olay Raporu: Sunucu Kesintisi', 'Salı günü saat on dörtte sipariş sistemi kırk dakika boyunca çalışmadı. İlk uyarı izleme aracından geldi, ancak bildirim yanlış kişiye gittiği için müdahale on beş dakika gecikti. Kesintinin nedeni, dolan bir disk alanıydı. Eski kayıt dosyaları silinince sistem yeniden çalıştı. Bu sürede veri kaybı yaşanmadı. Tekrarını önlemek için disk doluluğu yüzde seksene ulaştığında uyarı verilecek ve nöbet listesi her hafta güncellenecek.', 'Olay raporunda zaman çizelgesi, neden ve önlemi izlersin.', 'Ne oldu, neden oldu, ne yapılacak sırasıyla oku.', [
    ['Kesintinin nedeni neydi?', 'Disk alanının dolması', 'Elektrik kesilmesi', 'Yazılım güncellemesi', 'Veri kaybı'],
    ['Müdahale neden gecikti?', 'Bildirim yanlış kişiye gittiği için', 'İzleme aracı çalışmadığı için', 'Mesai bittiği için', 'Dosyalar silinemediği için'],
    ['Uyarı hangi doluluk oranında verilecek?', 'Yüzde seksen', 'Yüzde kırk', 'Yüzde on beş', 'Yüzde yüz'],
  ]],
  ['work-survey', 'Anket Sonuçları: Çalışan Görüşleri', 'Ankete çalışanların yüzde altmışı katıldı. Katılanların çoğu ekip arkadaşlarıyla iletişimden memnun olduğunu belirtti. En sık dile getirilen sorun, toplantıların uzun ve gündemsiz olmasıydı. Eğitim olanaklarını yeterli bulanların oranı ise yarının altında kaldı. Katılım oranı sınırlı olduğu için sonuçlar tüm çalışanları temsil etmeyebilir. İlk adım olarak toplantılara yazılı gündem zorunluluğu getirilecek.', 'Anket yorumunda bulgu ile sınırlılığı birlikte okursun.', 'Katılım oranını ve "temsil etmeyebilir" uyarısını not et.', [
    ['En sık dile getirilen sorun neydi?', 'Uzun ve gündemsiz toplantılar', 'İletişim eksikliği', 'Düşük ücret', 'Ofisin küçüklüğü'],
    ['Sonuçlar neden dikkatle yorumlanmalı?', 'Katılım oranı sınırlı olduğu için', 'Anket gizli olmadığı için', 'Sorular yanlış olduğu için', 'Yalnız yöneticiler katıldığı için'],
    ['İlk adım nedir?', 'Toplantılara yazılı gündem zorunluluğu', 'Yeni eğitim merkezi', 'Anketin iptali', 'Toplantıların kaldırılması'],
  ]],
  ['work-manual', 'Kullanım Talimatı: İzin Sistemi', 'İzin talebi için sisteme giriş yapın ve "Yeni talep" düğmesini seçin. Başlangıç ve bitiş tarihini girdikten sonra izin türünü belirtin. Hastalık izninde rapor dosyasını eklemek zorunludur; yıllık izinde ek gerekmez. Talebiniz önce yöneticinize, onaylanırsa insan kaynaklarına gider. Onaylanmamış izin kullanılamaz. Talebi yalnızca yönetici onayından önce geri çekebilirsiniz; sonrasında iptal için insan kaynaklarına yazmanız gerekir.', 'Talimatta işlem sırasını ve koşulları takip edersin.', 'Adımları numaralandırarak oku.', [
    ['Hangi izinde dosya eklemek zorunlu?', 'Hastalık izni', 'Yıllık izin', 'Her izin', 'Hiçbiri'],
    ['Talep ilk olarak kime gider?', 'Yöneticiye', 'İnsan kaynaklarına', 'Muhasebeye', 'Genel müdüre'],
    ['Onaydan sonra iptal için ne yapılır?', 'İnsan kaynaklarına yazılır', 'Talep silinir', 'Yeni talep açılır', 'Yöneticiden rapor istenir'],
  ]],
  ['work-compare', 'Değerlendirme: İki Kargo Seçeneği', 'Birinci firma paket başına daha ucuz fiyat veriyor, ancak teslimat ortalama üç gün sürüyor. İkinci firma yüzde on daha pahalı, buna karşılık bir günde teslim ediyor ve hasarlı paketi ücretsiz yeniliyor. Müşteri şikâyetlerimizin çoğu gecikmeyle ilgili olduğundan ikinci firmayı öneriyoruz. Ek maliyetin, azalan iade ve destek yüküyle kısmen karşılanacağını tahmin ediyoruz. Bu tahmin henüz ölçülmemiştir; üç ay sonra kontrol edilmelidir.', 'Karşılaştırmada ölçütleri ve gerekçeyi tartarsın.', 'Fiyat, süre ve koşulu yan yana koy.', [
    ['İkinci firma neden öneriliyor?', 'Şikâyetlerin çoğu gecikmeyle ilgili olduğu için', 'Daha ucuz olduğu için', 'Tek firma olduğu için', 'Üç günde teslim ettiği için'],
    ['İkinci firmanın ek üstünlüğü nedir?', 'Hasarlı paketi ücretsiz yeniler', 'Ücretsiz depo sağlar', 'Yüzde on indirim yapar', 'Fatura kesmez'],
    ['Ek maliyetle ilgili tahmin için ne söylenir?', 'Henüz ölçülmemiştir', 'Kanıtlanmıştır', 'Yanlış çıkmıştır', 'Önemsizdir'],
  ]],
  ['work-project', 'Durum Raporu: İnternet Sitesi Yenileme', 'Proje takvimin bir hafta gerisinde. Tasarım onayı tamamlandı ve ürün sayfaları hazır. Ödeme adımının testi, banka bağlantısı için beklenen belge gelmediğinden başlayamadı. Belge bu hafta gelirse yayın tarihi korunabilir; gelmezse yayın on gün ertelenecek. Bütçede sapma yok. Yönetimden isteğimiz, belge süreci için bankayla doğrudan görüşülmesidir.', 'Durum raporunda ilerleme, engel ve isteği bulursun.', '"Engel" ve "isteğimiz" cümlelerine odaklan.', [
    ['Projeyi geciktiren engel nedir?', 'Banka bağlantısı belgesinin gelmemesi', 'Tasarımın onaylanmaması', 'Bütçenin aşılması', 'Ürün sayfalarının eksikliği'],
    ['Belge gelmezse ne olacak?', 'Yayın on gün ertelenecek', 'Proje iptal edilecek', 'Bütçe artacak', 'Tasarım yenilenecek'],
    ['Yönetimden ne isteniyor?', 'Bankayla doğrudan görüşülmesi', 'Ek bütçe verilmesi', 'Yeni tasarımcı alınması', 'Yayının öne çekilmesi'],
  ]],
  ['work-announcement', 'Duyuru: Güvenlik Eğitimi', 'Tüm çalışanlar için bilgi güvenliği eğitimi ayın on beşinde yapılacaktır. Eğitim çevrim içidir ve kırk beş dakika sürer. Daha önce katılmış olsalar bile müşteri verisiyle çalışanların yeniden katılması zorunludur. Diğer çalışanlar için katılım önerilir. Eğitim sonunda kısa bir sınav vardır; yetmiş puanın altında kalanlar bir hafta içinde tekrar sınava girer. Bağlantı, eğitimden bir gün önce e-postayla gönderilecektir.', 'Duyuruda kimi, neyi ve ne zamanı hızla bulursun.', 'Önce "zorunlu mu, bana mı" sorusunu yanıtla.', [
    ['Kimlerin katılması zorunlu?', 'Müşteri verisiyle çalışanların', 'Yalnız yeni başlayanların', 'Hiç kimsenin', 'Yalnız yöneticilerin'],
    ['Sınavda hangi puanın altı tekrar gerektirir?', 'Yetmiş', 'Kırk beş', 'On beş', 'Doksan'],
    ['Bağlantı ne zaman gönderilecek?', 'Eğitimden bir gün önce', 'Eğitimden sonra', 'Bir hafta içinde', 'Ayın on beşinde akşam'],
  ]],
];
