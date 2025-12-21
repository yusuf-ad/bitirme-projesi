import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18n } from "i18n-js";

// Safe locale detection without native module dependency
const getDeviceLocale = (): string => {
  try {
    // Dynamic import to avoid native module crash
    const Localization = require("expo-localization");
    return Localization.getLocales?.()?.[0]?.languageCode || "en";
  } catch {
    return "en";
  }
};

// English translations
const en = {
  // Common
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    done: "Done",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    back: "Back",
    next: "Next",
    skip: "Skip",
    confirm: "Confirm",
    yes: "Yes",
    no: "No",
    all: "All",
    search: "Search",
    clearAll: "Clear All",
    reset: "Reset",
    enabled: "Enabled",
    disabled: "Disabled",
    notSet: "Not Set",
    unknown: "Unknown",
    saving: "Saving...",
    liked: "Liked",
    disliked: "Disliked",
  },
  // Home
  home: {
    hello: "Hello",
    letsplan: "Let's plan your meals!",
    todaysMeals: "Today's Meals",
    noMeals: "No meals planned",
    createMealPlan: "Create Meal Plan",
  },
  // Profile
  profile: {
    title: "Profile",
    settings: "SETTINGS",
    account: "Account",
    preferences: "Preferences",
    notifications: "Notifications",
    privacy: "Privacy",
    support: "Support & Feedback",
    logout: "Log Out",
    signOut: "Sign out",
    signOutConfirm:
      "Are you sure you want to sign out? Your saved preferences will stay on this device.",
    goalsMetrics: "Goals & Metrics",
    allergiesDiet: "Allergies & Diet",
    tastePreferences: "Taste Preferences",
    cookingSkill: "Cooking Skill",
    mealTimes: "Meal Times",
    unitsNutrition: "Units & Nutrition",
    memberSince: "Member since",
    personalSettings: "Personal Settings",
    appSettings: "App Settings",
    more: "More",
    editProfile: "Edit Profile",
    editProfileDesc: "Avatar, name, contact details",
    unitsNutritionDesc: "Macro targets, measurement system",
    goalsMetricsDesc: "Weight, activity & progress",
    privacyDesc: "Manage insights & sharing",
    notificationsDesc: "Meal reminders & summaries",
    preferencesDesc: "Language, units & app settings",
    mealTimesDesc: "Breakfast, lunch and dinner windows",
    appleWatch: "Apple Watch",
    appleWatchDesc: "Sync rings & activity calories",
    partnerAccounts: "Partner Accounts",
    partnerAccountsDesc: "Strava, Fitbit & more",
    socialSharing: "Social Sharing",
    socialSharingDesc: "Invite friends & share wins",
    tastePreferencesDesc: "Favorite Cuisines",
    allergiesDietDesc: "Medical restrictions & macros",
    cookingSkillDesc: "Your cooking experience level",
    supportDesc: "Chat with us or send an email",
    goals: "Goals",
    activeGoals: "active",
    setYourGoals: "Set your goals",
    tapToPersonalize: "Tap to personalize your plan",
    mealSchedule: "Meal schedule",
    pickMealTimes: "Pick meal times",
    keepRemindersAligned: "Keep reminders aligned with your day",
    tasteProfile: "Taste profile",
    addCuisinesDiets: "Add cuisines & diets",
    allergiesTracked: "allergies tracked",
    tapToCustomize: "Tap to customize",
    cuisinesLabel: "cuisines",
    dietsLabel: "diets",
    myMetrics: "My Metrics",
    addMetrics: "Add your metrics",
    yearsOld: "years old",
    trackYourProgress: "Track your progress",
    bmiUnderweight: "Underweight",
    bmiNormal: "Normal",
    bmiOverweight: "Overweight",
    bmiObese: "Obese",
  },
  // Preferences
  preferences: {
    title: "Preferences",
    appSettings: "App Settings",
    language: "Language",
    languageDesc: "App display language",
    hapticFeedback: "Haptic Feedback",
    hapticDesc: "Vibration on interactions",
    footerText: "These preferences are saved locally on your device.",
    languageChangeNote: "Language changes will be applied immediately.",
  },
  // Notifications
  notifications: {
    title: "Notifications",
    enabled: "Notifications are enabled",
    enable: "Enable notifications",
    enabledDesc: "You'll receive reminders and updates.",
    enableDesc: "Tap to allow notifications on your device.",
    mealReminders: "Meal reminders",
    mealRemindersDesc: "Get notified at your scheduled meal times",
    shoppingReminders: "Shopping reminders",
    shoppingRemindersDesc: "Remind me to check my shopping list",
    shoppingRemindersEnabled: "Every Saturday at 10:00 AM",
    weeklyRecap: "Weekly recap",
    weeklyRecapDesc: "Sunday digest with your cooking stats",
    weeklyRecapEnabled: "Every Sunday at 6:00 PM",
    testNotification: "Send test notification",
    testNotificationDesc: "Check if notifications are working.",
    systemSettings: "System settings",
    systemSettingsDesc: "Manage notifications in device settings.",
    notificationTypes: "Notification Types",
    actions: "Actions",
    editMealTimes: "Edit meal times",
    footerText:
      "Notifications help you stay on track with your meal plans.\nYou can change these settings anytime.",
    permissionRequired: "Permission Required",
    permissionRequiredDesc:
      "Please enable notifications in your device settings to receive meal reminders.",
    openSettings: "Open Settings",
    physicalDeviceRequired: "Physical Device Required",
    physicalDeviceRequiredDesc:
      "Push notifications only work on physical devices.",
    notificationScheduled: "Notification Scheduled",
    notificationScheduledDesc:
      "You'll receive a test notification in 2 seconds.",
    notificationsLimited: "Notifications Limited",
    notificationsLimitedDesc:
      "Notifications may not work in Expo Go. Use a development build for full functionality.",
  },
  // Privacy
  privacy: {
    title: "Privacy & Data",
    personalizedInsights: "Personalized insights",
    personalizedDesc:
      "Enable AI-powered meal suggestions and tips based on your preferences and goals.",
    dataEncrypted: "Your data is encrypted and never sold to third parties.",
    privacyControls: "Privacy Controls",
    dataManagement: "Data Management",
    exportData: "Export my data",
    exportDataDesc: "Download a copy of all your data.",
    deleteAccount: "Delete my account",
    deleteAccountDesc: "Permanently remove all your data.",
    deleteAccountConfirm:
      "This will permanently delete all your data including meal plans, preferences, and history. This action cannot be undone.",
    resetToDefaults: "Reset to defaults",
    resetConfirm: "Reset privacy settings?",
    resetConfirmDesc:
      "We'll restore default privacy choices. You can undo this anytime.",
    requestSent: "Request sent",
    requestSentDesc:
      "We'll compile your data export and email it to you within 48 hours.",
    lastUpdated: "Last updated: December 2025",
    contactPrivacy: "Questions? Contact privacy@plannedeat.app",
  },
  // Goals
  goals: {
    title: "Goals & Metrics",
    yourGoals: "Your Goals",
    bodyMetrics: "Body Metrics",
    loseWeight: "Lose Weight",
    maintainWeight: "Maintain Weight",
    gainMuscle: "Gain Muscle",
    eatHealthier: "Eat Healthier",
    noGoalsSelected: "No goals selected.",
    height: "HEIGHT",
    weight: "WEIGHT",
    bodyFat: "BODY FAT",
    age: "AGE",
    gender: "GENDER",
    ideal: "IDEAL",
    bmi: "BMI",
  },
  // Meal times
  mealTimes: {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    dailySchedule: "Daily Schedule",
    reminders: "Reminders",
    mealReminders: "Meal Reminders",
    mealRemindersDesc: "Get notified when it's time to eat",
    selectTime: "Select your preferred time",
    footerText:
      "Your meal times are used to schedule reminders and personalize your meal plan recommendations.",
  },
  // Days
  days: {
    sunday: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
  },
  // Pantry
  pantry: {
    title: "Pantry",
    myIngredients: "My Ingredients",
    recipeIdeas: "Recipe Ideas",
    emptyTitle: "Your pantry is empty",
    emptyDesc: "Add ingredients to get recipe suggestions",
    prefill: "Pre-fill with common items",
    clearPantry: "Clear Pantry",
    clearPantryConfirm:
      "Are you sure you want to remove all items from your pantry? This action cannot be undone.",
  },
  // Recipes
  recipes: {
    title: "Recipes",
    favorites: "Favorites",
    discover: "Discover",
    noFavorites: "No favorite recipes yet",
    noFavoritesDesc:
      "All recipes you like in the Discover section will be collected here. Start searching to choose your daily inspiration.",
    returnToDiscover: "Return to Discover",
    yourFavorites: "Your Favorites",
    savedRecipes: "saved recipes",
    savedRecipe: "saved recipe",
    noRecipesFound: "No recipes found",
    tryDifferentSearch: "Try a different search or filter",
    retry: "Retry",
    endOfResults: "You've seen all recipes",
    loading: "Loading recipes...",
    inspirationBoard: "Your Inspiration Board",
    recipesAtHand: "recipes always at hand",
    saveRecipesYouLove: "Save recipes you love",
    heroSubtitle:
      "Recipes are collected here when you tap the heart icon. Adding favorites to your plans is now easier.",
  },
  // Cooking Skills
  cookingSkills: {
    novice: "Novice",
    basic: "Basic",
    intermediate: "Intermediate",
    advanced: "Advanced",
    notSet: "Not set",
  },
  // Meal Plan
  mealPlan: {
    createMealPlan: "+ Create meal plan",
    feature1: "Meals for breakfast, lunch, and dinner",
    feature2: "Tailored to your goals and preferences",
    feature3: "Balanced proteins, fats, carbs and fiber",
    // New empty state
    emptyTitle: "Time to plan your",
    emptyTitleHighlight: "delicious",
    emptyTitleEnd: "day!",
    emptySubtitle: "You have no meals planned for today.",
    quickAddMeal: "Create Meal Plan",
    discoverRecipes: "Discover Recipes",
    generateWithAI: "Generate recipes with AI",
    suggestedForYou: "Suggested for You",
    viewAll: "View All",
    minutes: "min",
    kcal: "kcal",
  },
  // Account
  account: {
    title: "Edit Profile",
    personalInfo: "Personal Information",
    fullName: "Full Name",
    emailAddress: "Email Address",
    notSet: "Not set",
    editInfo: "Edit Information",
    saveChanges: "Save Changes",
    saving: "Saving...",
    cancel: "Cancel",
    chooseAvatar: "Choose an Avatar",
    accountSettings: "Account Settings",
    privacySecurity: "Privacy & Security",
    privacySecurityDesc: "Manage your data and permissions",
    notificationsDesc: "Meal reminders and updates",
    helpSupport: "Help & Support",
    helpSupportDesc: "FAQs and contact us",
    session: "Session",
    signOutDesc: "You can sign back in anytime",
    version: "PlannedEat v1.0.0",
    success: "Success",
    profileUpdated: "Your profile has been updated!",
    error: "Error",
    updateFailed: "Failed to update profile. Please try again.",
    avatarFailed: "Failed to update avatar. Please try again.",
  },
  // Allergies & Diet
  allergiesDiet: {
    title: "Allergies & Diet",
    dietPreferences: "Diet Preferences",
    preferencesSelected: "preference",
    preferencesSelectedPlural: "preferences",
    selected: "selected",
    allergiesTitle: "Allergies & Dislikes",
    itemsAvoided: "item",
    itemsAvoidedPlural: "items",
    avoided: "avoided",
    noRestrictions: "No restrictions set",
    noRestrictionsDesc:
      "You haven't set any dietary preferences or allergies yet.",
    setPreferences: "Set Preferences",
    addAllergies: "Add Allergies & Dislikes",
    editAllergies: "Edit Allergies & Dislikes",
    addDiets: "Add Diet Preferences",
    editDiets: "Edit Diet Preferences",
    saveChanges: "Save Changes",
    heroTitle: "Your Diet Profile",
    heroSubtitle: "Manage your dietary preferences and restrictions",
    diets: "Diets",
    allergies: "Allergies",
    infoTitle: "Why this matters",
    infoText:
      "Your dietary preferences help us filter recipes and create personalized meal plans that work for you.",
  },
  // Cooking Skill
  cookingSkillPage: {
    title: "Cooking Skill",
    description: "Your current cooking skill level",
    noviceDesc: "Just starting out in the kitchen",
    basicDesc: "Can make simple meals",
    intermediateDesc: "Comfortable with various techniques",
    advancedDesc: "Experienced home chef",
  },
  // Taste Preferences
  tastePreferencesPage: {
    title: "Taste Preferences",
    favoriteCuisines: "Favorite Cuisines",
    favoriteCuisinesDesc:
      "Select the cuisines you enjoy the most. We'll prioritize recipes from these categories.",
    dislikesExclusions: "Dislikes & Exclusions",
    dislikesExclusionsDesc:
      "Ingredients you want to avoid. We'll do our best to exclude recipes containing these.",
    heroTitle: "Your Taste Profile",
    heroSubtitle: "Help us personalize your meal recommendations",
    progress: "Progress",
    remaining: "Remaining",
    swipeHint: "Swipe to explore",
    tipTitle: "Pro Tip",
    tipText:
      "The more cuisines you rate, the better we can personalize your meal suggestions!",
  },
  // Units & Nutrition
  unitsNutrition: {
    title: "Units & Nutrition",
    bodyMeasurements: "Body Measurements",
    weight: "Weight",
    height: "Height",
    dailyTargets: "Daily Targets",
    calorieGoal: "Calorie Goal",
    macroDistribution: "Macro Distribution",
    protein: "Protein",
    carbs: "Carbs",
    fat: "Fat",
    personalDetails: "Personal Details",
    age: "Age",
    editWeight: "Edit Weight",
    editHeight: "Edit Height",
    editAge: "Edit Age",
  },
  // Support & Feedback
  support: {
    title: "Support & Feedback",
    needHelp: "Need a hand?",
    responseTime:
      "Our meal planning specialists respond in under 2 hours during the day.",
    contactUs: "Contact us",
    liveChat: "Live chat",
    liveChatDesc: "Weekdays 09:00 - 18:00 GMT+3",
    emailSupport: "Email support",
    productFeedback: "Product feedback",
    productFeedbackDesc: "Share an idea or request a feature.",
    resources: "Resources",
    helpCenter: "Help center",
    helpCenterDesc: "Troubleshooting, billing and feature guides.",
    serviceStatus: "Service status",
    serviceStatusDesc: "Live uptime for recipes, auth and AI meal plans.",
  },
  // Cuisines
  cuisines: {
    italian: "Italian",
    mexican: "Mexican",
    chinese: "Chinese",
    japanese: "Japanese",
    indian: "Indian",
    thai: "Thai",
    french: "French",
    greek: "Greek",
    spanish: "Spanish",
    mediterranean: "Mediterranean",
    american: "American",
    korean: "Korean",
  },
  // Dislikes
  dislikes: {
    mushrooms: "Mushrooms",
    olives: "Olives",
    cilantro: "Cilantro",
    onions: "Onions",
    garlic: "Garlic",
    spicyFood: "Spicy Food",
    seafood: "Seafood",
    dairy: "Dairy",
    gluten: "Gluten",
    nuts: "Nuts",
  },
};

// Turkish translations
const tr = {
  // Common
  common: {
    save: "Kaydet",
    cancel: "İptal",
    delete: "Sil",
    edit: "Düzenle",
    done: "Tamam",
    loading: "Yükleniyor...",
    error: "Hata",
    success: "Başarılı",
    back: "Geri",
    next: "İleri",
    skip: "Atla",
    confirm: "Onayla",
    yes: "Evet",
    no: "Hayır",
    all: "Tümü",
    search: "Ara",
    clearAll: "Tümünü Temizle",
    reset: "Sıfırla",
    enabled: "Etkin",
    disabled: "Devre Dışı",
    notSet: "Ayarlanmadı",
    unknown: "Bilinmiyor",
    saving: "Kaydediliyor...",
    liked: "Beğenilen",
    disliked: "Beğenilmeyen",
  },
  // Home
  home: {
    hello: "Merhaba",
    letsplan: "Öğünlerini planlayalım!",
    todaysMeals: "Bugünün Öğünleri",
    noMeals: "Planlanmış öğün yok",
    createMealPlan: "Öğün Planı Oluştur",
  },
  // Profile
  profile: {
    title: "Profil",
    settings: "AYARLAR",
    account: "Hesap",
    preferences: "Tercihler",
    notifications: "Bildirimler",
    privacy: "Gizlilik",
    support: "Destek & Geri Bildirim",
    logout: "Çıkış Yap",
    signOut: "Çıkış yap",
    signOutConfirm:
      "Çıkış yapmak istediğinizden emin misiniz? Kayıtlı tercihleriniz bu cihazda kalacaktır.",
    goalsMetrics: "Hedefler & Metrikler",
    allergiesDiet: "Alerjiler & Diyet",
    tastePreferences: "Tat Tercihleri",
    cookingSkill: "Yemek Yapma Becerisi",
    mealTimes: "Öğün Saatleri",
    unitsNutrition: "Birimler & Beslenme",
    memberSince: "Üyelik tarihi",
    personalSettings: "Kişisel Ayarlar",
    appSettings: "Uygulama Ayarları",
    more: "Daha Fazla",
    editProfile: "Profili Düzenle",
    editProfileDesc: "Avatar, isim, iletişim bilgileri",
    unitsNutritionDesc: "Makro hedefleri, ölçü sistemi",
    goalsMetricsDesc: "Kilo, aktivite & ilerleme",
    privacyDesc: "Önerileri & paylaşımı yönet",
    notificationsDesc: "Öğün hatırlatıcıları & özetler",
    preferencesDesc: "Dil, birimler & uygulama ayarları",
    mealTimesDesc: "Kahvaltı, öğle ve akşam yemeği saatleri",
    appleWatch: "Apple Watch",
    appleWatchDesc: "Halkaları & aktivite kalorilerini senkronize et",
    partnerAccounts: "Partner Hesapları",
    partnerAccountsDesc: "Strava, Fitbit & daha fazlası",
    socialSharing: "Sosyal Paylaşım",
    socialSharingDesc: "Arkadaşlarını davet et & başarılarını paylaş",
    tastePreferencesDesc: "Favori Mutfaklar",
    allergiesDietDesc: "Tıbbi kısıtlamalar & makrolar",
    cookingSkillDesc: "Yemek yapma deneyim seviyeniz",
    supportDesc: "Bizimle sohbet et veya e-posta gönder",
    goals: "Hedefler",
    activeGoals: "aktif",
    setYourGoals: "Hedeflerini belirle",
    tapToPersonalize: "Planını kişiselleştirmek için dokun",
    mealSchedule: "Öğün programı",
    pickMealTimes: "Öğün saatlerini seç",
    keepRemindersAligned: "Hatırlatıcıları gününle uyumlu tut",
    tasteProfile: "Tat profili",
    addCuisinesDiets: "Mutfaklar & diyetler ekle",
    allergiesTracked: "alerji takip ediliyor",
    tapToCustomize: "Özelleştirmek için dokun",
    cuisinesLabel: "mutfak",
    dietsLabel: "diyet",
    myMetrics: "Ölçülerim",
    addMetrics: "Ölçülerini ekle",
    yearsOld: "yaşında",
    trackYourProgress: "İlerlemenizi takip edin",
    bmiUnderweight: "Zayıf",
    bmiNormal: "Normal",
    bmiOverweight: "Fazla Kilolu",
    bmiObese: "Obez",
  },
  // Preferences
  preferences: {
    title: "Tercihler",
    appSettings: "Uygulama Ayarları",
    language: "Dil",
    languageDesc: "Uygulama görüntüleme dili",
    hapticFeedback: "Dokunsal Geri Bildirim",
    hapticDesc: "Etkileşimlerde titreşim",
    footerText: "Bu tercihler cihazınızda yerel olarak kaydedilir.",
    languageChangeNote: "Dil değişiklikleri hemen uygulanacaktır.",
  },
  // Notifications
  notifications: {
    title: "Bildirimler",
    enabled: "Bildirimler etkin",
    enable: "Bildirimleri etkinleştir",
    enabledDesc: "Hatırlatıcılar ve güncellemeler alacaksınız.",
    enableDesc: "Cihazınızda bildirimlere izin vermek için dokunun.",
    mealReminders: "Öğün hatırlatıcıları",
    mealRemindersDesc: "Planlanan öğün saatlerinde bildirim al",
    shoppingReminders: "Alışveriş hatırlatıcıları",
    shoppingRemindersDesc: "Alışveriş listemi kontrol etmemi hatırlat",
    shoppingRemindersEnabled: "Her Cumartesi saat 10:00",
    weeklyRecap: "Haftalık özet",
    weeklyRecapDesc: "Yemek istatistiklerinle Pazar özeti",
    weeklyRecapEnabled: "Her Pazar saat 18:00",
    testNotification: "Test bildirimi gönder",
    testNotificationDesc: "Bildirimlerin çalışıp çalışmadığını kontrol et.",
    systemSettings: "Sistem ayarları",
    systemSettingsDesc: "Cihaz ayarlarında bildirimleri yönet.",
    notificationTypes: "Bildirim Türleri",
    actions: "İşlemler",
    editMealTimes: "Öğün saatlerini düzenle",
    footerText:
      "Bildirimler öğün planlarınızı takip etmenize yardımcı olur.\nBu ayarları istediğiniz zaman değiştirebilirsiniz.",
    permissionRequired: "İzin Gerekli",
    permissionRequiredDesc:
      "Öğün hatırlatıcıları almak için lütfen cihaz ayarlarınızda bildirimleri etkinleştirin.",
    openSettings: "Ayarları Aç",
    physicalDeviceRequired: "Fiziksel Cihaz Gerekli",
    physicalDeviceRequiredDesc:
      "Push bildirimleri yalnızca fiziksel cihazlarda çalışır.",
    notificationScheduled: "Bildirim Planlandı",
    notificationScheduledDesc:
      "2 saniye içinde bir test bildirimi alacaksınız.",
    notificationsLimited: "Bildirimler Sınırlı",
    notificationsLimitedDesc:
      "Bildirimler Expo Go'da çalışmayabilir. Tam işlevsellik için geliştirme derlemesi kullanın.",
  },
  // Privacy
  privacy: {
    title: "Gizlilik & Veri",
    personalizedInsights: "Kişiselleştirilmiş öneriler",
    personalizedDesc:
      "Tercihlerinize ve hedeflerinize göre AI destekli öğün önerileri ve ipuçlarını etkinleştirin.",
    dataEncrypted: "Verileriniz şifrelenir ve asla üçüncü taraflara satılmaz.",
    privacyControls: "Gizlilik Kontrolleri",
    dataManagement: "Veri Yönetimi",
    exportData: "Verilerimi dışa aktar",
    exportDataDesc: "Tüm verilerinizin bir kopyasını indirin.",
    deleteAccount: "Hesabımı sil",
    deleteAccountDesc: "Tüm verilerinizi kalıcı olarak kaldırın.",
    deleteAccountConfirm:
      "Bu işlem öğün planları, tercihler ve geçmiş dahil tüm verilerinizi kalıcı olarak silecektir. Bu işlem geri alınamaz.",
    resetToDefaults: "Varsayılanlara sıfırla",
    resetConfirm: "Gizlilik ayarları sıfırlansın mı?",
    resetConfirmDesc:
      "Varsayılan gizlilik tercihlerini geri yükleyeceğiz. Bunu istediğiniz zaman geri alabilirsiniz.",
    requestSent: "İstek gönderildi",
    requestSentDesc:
      "Veri dışa aktarımınızı derleyip 48 saat içinde e-posta ile göndereceğiz.",
    lastUpdated: "Son güncelleme: Aralık 2025",
    contactPrivacy: "Sorularınız mı var? privacy@plannedeat.app adresine yazın",
  },
  // Goals
  goals: {
    title: "Hedefler & Metrikler",
    yourGoals: "Hedeflerin",
    bodyMetrics: "Vücut Metrikleri",
    loseWeight: "Kilo Ver",
    maintainWeight: "Kiloyu Koru",
    gainMuscle: "Kas Kazan",
    eatHealthier: "Sağlıklı Beslen",
    noGoalsSelected: "Hedef seçilmedi.",
    height: "BOY",
    weight: "KİLO",
    bodyFat: "VÜCUT YAĞI",
    age: "YAŞ",
    gender: "CİNSİYET",
    ideal: "İDEAL",
    bmi: "VKİ",
  },
  // Meal times
  mealTimes: {
    breakfast: "Kahvaltı",
    lunch: "Öğle Yemeği",
    dinner: "Akşam Yemeği",
    dailySchedule: "Günlük Program",
    reminders: "Hatırlatıcılar",
    mealReminders: "Öğün Hatırlatıcıları",
    mealRemindersDesc: "Yemek zamanı geldiğinde bildirim al",
    selectTime: "Tercih ettiğiniz saati seçin",
    footerText:
      "Öğün saatleriniz hatırlatıcıları planlamak ve öğün planı önerilerinizi kişiselleştirmek için kullanılır.",
  },
  // Days
  days: {
    sunday: "Pazar",
    monday: "Pazartesi",
    tuesday: "Salı",
    wednesday: "Çarşamba",
    thursday: "Perşembe",
    friday: "Cuma",
    saturday: "Cumartesi",
  },
  // Pantry
  pantry: {
    title: "Kiler",
    myIngredients: "Malzemelerim",
    recipeIdeas: "Tarif Fikirleri",
    emptyTitle: "Kileriniz boş",
    emptyDesc: "Tarif önerileri almak için malzeme ekleyin",
    prefill: "Yaygın malzemelerle doldur",
    clearPantry: "Kileri Temizle",
    clearPantryConfirm:
      "Kilerdeki tüm malzemeleri kaldırmak istediğinizden emin misiniz? Bu işlem geri alınamaz.",
  },
  // Recipes
  recipes: {
    title: "Tarifler",
    favorites: "Favoriler",
    discover: "Keşfet",
    noFavorites: "Henüz favori tarif yok",
    noFavoritesDesc:
      "Keşfet bölümünde beğendiğiniz tüm tarifler burada toplanacak. Günlük ilhamınızı seçmek için aramaya başlayın.",
    returnToDiscover: "Keşfet'e Dön",
    yourFavorites: "Favorileriniz",
    savedRecipes: "kayıtlı tarif",
    savedRecipe: "kayıtlı tarif",
    noRecipesFound: "Tarif bulunamadı",
    tryDifferentSearch: "Farklı bir arama veya filtre deneyin",
    retry: "Tekrar Dene",
    endOfResults: "Tüm tarifleri gördünüz",
    loading: "Tarifler yükleniyor...",
    inspirationBoard: "İlham Panonuz",
    recipesAtHand: "tarif her zaman elinizin altında",
    saveRecipesYouLove: "Sevdiğiniz tarifleri kaydedin",
    heroSubtitle:
      "Kalp simgesine dokunduğunuzda tarifler burada toplanır. Favorileri planlarınıza eklemek artık daha kolay.",
  },
  // Cooking Skills
  cookingSkills: {
    novice: "Acemi",
    basic: "Temel",
    intermediate: "Orta",
    advanced: "İleri",
    notSet: "Ayarlanmadı",
  },
  // Meal Plan
  mealPlan: {
    createMealPlan: "+ Öğün planı oluştur",
    feature1: "Kahvaltı, öğle ve akşam yemekleri",
    feature2: "Hedeflerinize ve tercihlerinize göre özelleştirilmiş",
    feature3: "Dengeli protein, yağ, karbonhidrat ve lif",
    // New empty state
    emptyTitle: "Lezzetli",
    emptyTitleHighlight: "lezzetli",
    emptyTitleEnd: "gününü planla!",
    emptySubtitle: "Bugün için planlanmış öğün yok.",
    quickAddMeal: "Yemek Planı Oluştur",
    discoverRecipes: "Tarifleri Keşfet",
    generateWithAI: "AI ile öneri oluştur",
    suggestedForYou: "Senin İçin Öneriler",
    viewAll: "Tümünü Gör",
    minutes: "dk",
    kcal: "kcal",
  },
  // Account
  account: {
    title: "Profili Düzenle",
    personalInfo: "Kişisel Bilgiler",
    fullName: "Ad Soyad",
    emailAddress: "E-posta Adresi",
    notSet: "Ayarlanmadı",
    editInfo: "Bilgileri Düzenle",
    saveChanges: "Değişiklikleri Kaydet",
    saving: "Kaydediliyor...",
    cancel: "İptal",
    chooseAvatar: "Avatar Seç",
    accountSettings: "Hesap Ayarları",
    privacySecurity: "Gizlilik & Güvenlik",
    privacySecurityDesc: "Verilerinizi ve izinlerinizi yönetin",
    notificationsDesc: "Öğün hatırlatıcıları ve güncellemeler",
    helpSupport: "Yardım & Destek",
    helpSupportDesc: "SSS ve bize ulaşın",
    session: "Oturum",
    signOutDesc: "İstediğiniz zaman tekrar giriş yapabilirsiniz",
    version: "PlannedEat v1.0.0",
    success: "Başarılı",
    profileUpdated: "Profiliniz güncellendi!",
    error: "Hata",
    updateFailed: "Profil güncellenemedi. Lütfen tekrar deneyin.",
    avatarFailed: "Avatar güncellenemedi. Lütfen tekrar deneyin.",
  },
  // Allergies & Diet
  allergiesDiet: {
    title: "Alerjiler & Diyet",
    dietPreferences: "Diyet Tercihleri",
    preferencesSelected: "tercih",
    preferencesSelectedPlural: "tercih",
    selected: "seçildi",
    allergiesTitle: "Alerjiler & Beğenmediklerim",
    itemsAvoided: "öğe",
    itemsAvoidedPlural: "öğe",
    avoided: "kaçınılıyor",
    noRestrictions: "Kısıtlama ayarlanmadı",
    noRestrictionsDesc: "Henüz diyet tercihi veya alerji belirlemediniz.",
    setPreferences: "Tercihleri Ayarla",
    addAllergies: "Alerji & Beğenmediklerimi Ekle",
    editAllergies: "Alerji & Beğenmediklerimi Düzenle",
    addDiets: "Diyet Tercihi Ekle",
    editDiets: "Diyet Tercihlerini Düzenle",
    saveChanges: "Değişiklikleri Kaydet",
    heroTitle: "Diyet Profiliniz",
    heroSubtitle: "Diyet tercihlerinizi ve kısıtlamalarınızı yönetin",
    diets: "Diyetler",
    allergies: "Alerjiler",
    infoTitle: "Neden önemli",
    infoText:
      "Diyet tercihleriniz tarifleri filtrelememize ve size uygun kişiselleştirilmiş yemek planları oluşturmamıza yardımcı olur.",
  },
  // Cooking Skill
  cookingSkillPage: {
    title: "Yemek Yapma Becerisi",
    description: "Mevcut yemek yapma beceri seviyeniz",
    noviceDesc: "Mutfakta yeni başlıyor",
    basicDesc: "Basit yemekler yapabilir",
    intermediateDesc: "Çeşitli tekniklerle rahat",
    advancedDesc: "Deneyimli ev şefi",
  },
  // Taste Preferences
  tastePreferencesPage: {
    title: "Tat Tercihleri",
    favoriteCuisines: "Favori Mutfaklar",
    favoriteCuisinesDesc:
      "En çok sevdiğiniz mutfakları seçin. Bu kategorilerden tariflere öncelik vereceğiz.",
    dislikesExclusions: "Beğenmediklerim & Hariç Tutulanlar",
    dislikesExclusionsDesc:
      "Kaçınmak istediğiniz malzemeler. Bunları içeren tarifleri hariç tutmak için elimizden geleni yapacağız.",
    heroTitle: "Tat Profiliniz",
    heroSubtitle: "Yemek önerilerinizi kişiselleştirmemize yardımcı olun",
    progress: "İlerleme",
    remaining: "Kalan",
    swipeHint: "Keşfetmek için kaydırın",
    tipTitle: "İpucu",
    tipText:
      "Ne kadar çok mutfak değerlendirirseniz, yemek önerilerinizi o kadar iyi kişiselleştirebiliriz!",
  },
  // Units & Nutrition
  unitsNutrition: {
    title: "Birimler & Beslenme",
    bodyMeasurements: "Vücut Ölçüleri",
    weight: "Kilo",
    height: "Boy",
    dailyTargets: "Günlük Hedefler",
    calorieGoal: "Kalori Hedefi",
    macroDistribution: "Makro Dağılımı",
    protein: "Protein",
    carbs: "Karbonhidrat",
    fat: "Yağ",
    personalDetails: "Kişisel Bilgiler",
    age: "Yaş",
    editWeight: "Kiloyu Düzenle",
    editHeight: "Boyu Düzenle",
    editAge: "Yaşı Düzenle",
  },
  // Support & Feedback
  support: {
    title: "Destek & Geri Bildirim",
    needHelp: "Yardıma mı ihtiyacınız var?",
    responseTime:
      "Öğün planlama uzmanlarımız gün içinde 2 saat içinde yanıt verir.",
    contactUs: "Bize ulaşın",
    liveChat: "Canlı sohbet",
    liveChatDesc: "Hafta içi 09:00 - 18:00 GMT+3",
    emailSupport: "E-posta desteği",
    productFeedback: "Ürün geri bildirimi",
    productFeedbackDesc: "Bir fikir paylaşın veya özellik isteyin.",
    resources: "Kaynaklar",
    helpCenter: "Yardım merkezi",
    helpCenterDesc: "Sorun giderme, faturalandırma ve özellik kılavuzları.",
    serviceStatus: "Servis durumu",
    serviceStatusDesc:
      "Tarifler, kimlik doğrulama ve AI öğün planları için canlı çalışma süresi.",
  },
  // Cuisines
  cuisines: {
    italian: "İtalyan",
    mexican: "Meksika",
    chinese: "Çin",
    japanese: "Japon",
    indian: "Hint",
    thai: "Tayland",
    french: "Fransız",
    greek: "Yunan",
    spanish: "İspanyol",
    mediterranean: "Akdeniz",
    american: "Amerikan",
    korean: "Kore",
  },
  // Dislikes
  dislikes: {
    mushrooms: "Mantar",
    olives: "Zeytin",
    cilantro: "Kişniş",
    onions: "Soğan",
    garlic: "Sarımsak",
    spicyFood: "Baharatlı Yemek",
    seafood: "Deniz Ürünleri",
    dairy: "Süt Ürünleri",
    gluten: "Gluten",
    nuts: "Kuruyemiş",
  },
};

const i18n = new I18n({
  en,
  tr,
});

// Set default locale from device
i18n.locale = getDeviceLocale();
i18n.enableFallback = true;
i18n.defaultLocale = "en";

// Storage key
const LANGUAGE_KEY = "app_language";

// Load saved language
export const loadSavedLanguage = async () => {
  try {
    const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (saved) {
      i18n.locale = saved;
    }
  } catch (error) {
    console.error("Failed to load language:", error);
  }
};

// Save and set language
export const setLanguage = async (lang: "en" | "tr") => {
  try {
    i18n.locale = lang;
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  } catch (error) {
    console.error("Failed to save language:", error);
  }
};

// Get current language
export const getCurrentLanguage = (): "en" | "tr" => {
  return i18n.locale as "en" | "tr";
};

export default i18n;
