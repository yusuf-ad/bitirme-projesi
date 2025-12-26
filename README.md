# 🍽️ Planned Eat - AI-Powered Meal Planner

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-Expo-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Backend-Supabase-green?logo=supabase)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey)

**An intelligent, AI-powered meal planning assistant**

_Simplify home cooking, reduce food waste, and achieve your health goals_

</div>

---

## 🎬 Demo

<div align="center">

https://github.com/user-attachments/assets/ae759ae2-f9a8-4dba-a424-1a7e727ed869

</div>

---

## 📱 About

**Planned Eat** is a smart meal planning application that helps users meet their health goals by providing personalized recipe recommendations based on available ingredients and dietary profiles.

> 🎓 This is a **Graduation Project** demonstrating comprehensive mobile application development with modern technologies, AI integration, and database management.

### 🎯 Target Audience

- **Busy professionals** seeking convenient meal planning solutions
- **Health-conscious individuals** tracking nutrition and dietary goals
- **Budget-conscious users** wanting to minimize food waste
- **Families** looking to organize weekly meals efficiently

---

## ✨ Features

### 🤖 Smart Recipe Recommendations

- **AI-powered recipe suggestions** based on available ingredients
- Advanced filtering (meal type, cuisine, cook time, dietary restrictions)
- Ingredient substitution suggestions

### 🗓️ Weekly Meal Planner

- 7-day planning view
- 3 meal slots per day (Breakfast, Lunch, Dinner)
- Drag-and-drop recipe assignment
- Weekly nutrition summary

### 🥗 Digital Pantry Management

- Ingredient inventory system
- Automatic categorization
- Expiration date tracking
- Low stock alerts

### 🛒 Smart Shopping List

- **Auto-generate list** from meal plan
- Compare with pantry inventory
- Items organized by category

### 📊 Nutrition Tracking

- Daily calorie and macro summary
- Weekly/monthly nutrition analytics
- Progress tracking toward health goals

### 👤 Personalization

- Dietary preferences (vegan, vegetarian, keto, paleo, etc.)
- Allergen management
- Health goal setting
- Daily calorie targets

---

## 🛠️ Tech Stack

### Frontend

| Technology              | Description                       |
| ----------------------- | --------------------------------- |
| **React Native (Expo)** | Cross-platform mobile development |
| **TypeScript**          | Type safety                       |
| **Expo Router**         | File-based routing                |
| **Zustand**             | Global state management           |

### Backend

| Technology           | Description                  |
| -------------------- | ---------------------------- |
| **Supabase**         | Backend-as-a-Service         |
| **PostgreSQL**       | Database                     |
| **Supabase Auth**    | Authentication (Email/OAuth) |
| **Supabase Storage** | Image storage                |

### AI & API Services

| Service                       | Usage                                    |
| ----------------------------- | ---------------------------------------- |
| **Spoonacular API**           | Recipe search and recommendations        |
| **Spoonacular Nutrition API** | Nutritional calculations                 |
| **OpenAI GPT-4**              | Ingredient recognition, meal suggestions |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional)
- Expo Go app (for mobile testing)

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   Create a `.env` file and add the required API keys:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_SPOONACULAR_API_KEY=your_spoonacular_key
   EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key
   ```

3. **Start the app:**

   ```bash
   npx expo start
   ```

4. **Run options:**
   - Scan with **Expo Go** (mobile device)
   - Press `i` for **iOS Simulator**
   - Press `a` for **Android Emulator**

---

## 📁 Project Structure

```
planned-eat/
├── app/                    # Screens (Expo Router)
│   ├── (auth)/            # Authentication screens
│   ├── (app)/             # Main app screens
│   ├── (plan)/            # Meal planning screens
│   └── (add)/             # Add item screens
├── features/              # Feature modules
│   ├── auth/              # Authentication
│   ├── recipes/           # Recipe management
│   ├── pantry/            # Pantry management
│   ├── meal-plan/         # Meal planning
│   └── shopping-list/     # Shopping list
├── shared/                # Shared components and utilities
│   ├── components/        # UI components
│   ├── hooks/             # Custom hooks
│   └── utils/             # Utility functions
├── constants/             # Constants and theme
├── lib/                   # API clients
└── types/                 # TypeScript types
```

---

## 📱 Supported Platforms

| Platform | Minimum Version |
| -------- | --------------- |
| iOS      | 13.0+           |
| Android  | 6.0+ (API 23)   |

---

## 🔒 Security

- Encrypted data transmission with **HTTPS/TLS 1.3**
- **JWT token** based authentication
- Database security with **Row Level Security (RLS)**
- **GDPR & KVKK** compliance

---

## 📄 License

This project is developed for educational purposes.

---

<div align="center">


https://github.com/user-attachments/assets/ae759ae2-f9a8-4dba-a424-1a7e727ed869


Join our community of developers creating universal apps.

</div>
