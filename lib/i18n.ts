import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import { I18n } from "i18n-js";

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
  },
  // Profile
  profile: {
    title: "Profile",
    account: "Account",
    preferences: "Preferences",
    notifications: "Notifications",
    privacy: "Privacy",
    support: "Support & Feedback",
    logout: "Log Out",
    goalsMetrics: "Goals & Metrics",
    allergiesDiet: "Allergies & Diet",
    tastePreferences: "Taste Preferences",
    cookingSkill: "Cooking Skill",
    mealTimes: "Meal Times",
    unitsNutrition: "Units & Nutrition",
    integrations: "Integrations",
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
    weeklyRecap: "Weekly recap",
    testNotification: "Send test notification",
    systemSettings: "System settings",
  },
  // Privacy
  privacy: {
    title: "Privacy",
    personalizedInsights: "Personalized insights",
    personalizedDesc: "Allow AI to analyze your data for better recommendations",
  },
  // Goals
  goals: {
    title: "Goals & Metrics",
    loseWeight: "Lose Weight",
    maintainWeight: "Maintain Weight",
    gainMuscle: "Gain Muscle",
    eatHealthier: "Eat Healthier",
  },
  // Meal times
  mealTimes: {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
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
  },
  // Profile
  profile: {
    title: "Profil",
    account: "Hesap",
    preferences: "Tercihler",
    notifications: "Bildirimler",
    privacy: "Gizlilik",
    support: "Destek & Geri Bildirim",
    logout: "Çıkış Yap",
    goalsMetrics: "Hedefler & Metrikler",
    allergiesDiet: "Alerjiler & Diyet",
    tastePreferences: "Tat Tercihleri",
    cookingSkill: "Yemek Yapma Becerisi",
    mealTimes: "Öğün Saatleri",
    unitsNutrition: "Birimler & Beslenme",
    integrations: "Entegrasyonlar",
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
    weeklyRecap: "Haftalık özet",
    testNotification: "Test bildirimi gönder",
    systemSettings: "Sistem ayarları",
  },
  // Privacy
  privacy: {
    title: "Gizlilik",
    personalizedInsights: "Kişiselleştirilmiş öneriler",
    personalizedDesc: "Daha iyi öneriler için AI'ın verilerinizi analiz etmesine izin verin",
  },
  // Goals
  goals: {
    title: "Hedefler & Metrikler",
    loseWeight: "Kilo Ver",
    maintainWeight: "Kiloyu Koru",
    gainMuscle: "Kas Kazan",
    eatHealthier: "Sağlıklı Beslen",
  },
  // Meal times
  mealTimes: {
    breakfast: "Kahvaltı",
    lunch: "Öğle Yemeği",
    dinner: "Akşam Yemeği",
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
};

const i18n = new I18n({
  en,
  tr,
});

// Set default locale from device
i18n.locale = Localization.getLocales()[0]?.languageCode || "en";
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
