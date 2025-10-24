# Infinite Scrolling Recipe Feature

## Özet

Bu özellik Spoonacular API'yi kullanarak infinite scrolling ile tarifler gösterir. Başta 10 tarif yüklenir ve kullanıcı aşağıya kaydırdıkça daha 10'ar tarif eklenir.

## Kullanılan Bileşenler

### 1. **API Service** (`lib/spoonacular.ts`)

- `getRandomRecipes()` - Rastgele tarifler çeker
- `searchRecipes()` - Arama ile tarifler çeker (pagination desteklı)
- `getRecipeDetails()` - Tarif detaylarını çeker

### 2. **Infinite Scroll Hook** (`hooks/use-infinite-scroll.ts`)

- `useInfiniteScroll()` - Infinite scrolling mantığını yönetir
- Otomatik yükleme, hata yönetimi, yenileme özelliği

### 3. **Recipe Card Component** (`features/home/components/recipe-card.tsx`)

- Tarif kartı UI bileşeni
- Resim, başlık, hazırlama süresi, porsiyon bilgisi gösterir

### 4. **Home Page** (`app/(app)/index.tsx`)

- Discover ve Favorites tabları
- Grid layout ile tarifler gösterilir
- Pull-to-refresh desteği
- Loading ve error states

## Kurulum

### 1. API Key Alma

1. https://spoonacular.com/food-api adresine git
2. Hesap oluştur ve API key al
3. `.env` dosyasında `EXPO_PUBLIC_SPOONACULAR_API_KEY` kısmını güncelle:

```env
EXPO_PUBLIC_SPOONACULAR_API_KEY=your_api_key_here
```

### 2. Kullanım

Home sayfasının Discover tabında otomatik olarak başlayacak:

- **İlk Yükleme**: 10 tarif görüntülenir
- **Infinite Scroll**: Sayfa sonuna yaklaşınca otomatik 10 tarif daha yüklenir
- **Pull to Refresh**: Yukarıdan aşağıya çekerek yenile
- **Loading State**: Yükleme sırasında spinner gösterilir
- **Error State**: Hata durumunda retry butonuyla tekrar dene
- **End State**: Daha tarif yoksa "No more recipes" mesajı gösterilir

## Özellikler

✅ Infinite scrolling - otomatik sayfalandırma
✅ Pull to refresh - yenileme işlemi
✅ Loading states - yükleme göstergesi
✅ Error handling - hata yönetimi
✅ Responsive design - duyarlı tasarım
✅ 2-column grid layout - 2 sütunlu ızgara

## API Limitleri

Spoonacular API'nin ücretsiz planı:

- Aylık 600 istekleri
- Günlük sınırlamalar olabilir

Ücretli planlar daha yüksek limitler sağlar.

## Gelecek İyileştirmeler

- [ ] Favori tarifler saklanması (Favorites tab)
- [ ] Tarif arama ve filtreleme
- [ ] Tarif detay sayfası
- [ ] Materialler ve adımlar gösterimi
- [ ] Oğrenci ürünler yönetimi
