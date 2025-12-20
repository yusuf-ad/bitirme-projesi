# Project Name: Planned Eat - AI-Powered Meal Planner

## Project Overview

### Description

An intelligent, AI-powered meal planning assistant designed to simplify home cooking, reduce food waste,### User Flows

#### Primary User Flow

1. **Onboarding:**

   - User downloads and opens the app
   - Views welcome screens explaining key features
   - Chooses to sign up or log in

2. **Registration & Profile Setup:**

   - User creates account (email/password or OAuth)
   - Completes profile setup wizard:
     - Dietary preferences
     - Allergens and restrictions
     - Health goals and targets
     - Cooking preferences
   - Receives welcome message

3. **Pantry Setup:**

   - User navigates to pantry/inventory
   - Adds ingredients they currently have
   - Sets quantities and expiration dates
   - System categorizes items automatically

4. **Recipe Discovery:**

   - User views personalized recipe recommendations
   - Filters by meal type, cuisine, cook time
   - Views detailed recipe information
   - Saves favorite recipes

5. **Meal Planning:**

   - User opens weekly meal planner
   - Drags recipes to specific days/meal slots
   - Reviews weekly nutrition summary
   - Adjusts plan as needed

6. **Shopping List:**

   - User generates shopping list from meal plan
   - System identifies missing ingredients
   - User reviews and edits list
   - Checks off items while shopping
   - Adds purchased items to pantry

7. **Meal Tracking:**
   - User logs consumed meals daily
   - Views nutrition analytics
   - Tracks progress toward health goals
   - Adjusts future meal plans based on progress

#### Alternative Flows

**Quick Meal Search:**

- User searches for specific recipe
- Applies filters
- Views and saves recipe

**Manual Meal Planning:**

- User directly searches recipes
- Adds to specific meal slot
- Manually creates shopping list

**Recipe Exploration:**

- User browses by category/cuisine
- Discovers new recipes
- Saves to favorites for later

### Business Rules

#### Authentication & Authorization

- **BR-1:** Users must be authenticated to access all features except onboarding screens
- **BR-2:** User sessions expire after 30 days of inactivity
- **BR-3:** Each user can only access their own data (enforced by RLS)

#### Recipe & Allergen Management

- **BR-4:** All recipe recommendations must exclude user-specified allergens
- **BR-5:** Allergen warnings must be prominently displayed on recipe details
- **BR-6:** Users cannot proceed with meal planning if recipes contain allergens

#### Pantry & Inventory

- **BR-7:** Ingredient quantities must be positive numbers
- **BR-8:** Expiration dates must be in the future or today
- **BR-9:** Duplicate ingredients are merged with updated quantities

#### Shopping Lists

- **BR-10:** Shopping lists only include items not currently in user's pantry
- **BR-11:** Quantities are calculated based on recipe requirements minus available inventory
- **BR-12:** Users can manually override auto-generated quantities

#### Meal Planning

- **BR-13:** Users can plan meals up to 4 weeks in advance
- **BR-14:** Past meal plans are archived and cannot be edited
- **BR-15:** Each meal slot can contain only one recipe
- **BR-16:** Deleting a recipe from favorites does not remove it from existing meal plans

#### Nutrition & Tracking

- **BR-17:** Nutrition calculations are based on Edamam API data
- **BR-18:** Daily calorie targets cannot exceed 5000 or be below 1000
- **BR-19:** Meal logs can be edited within 7 days of logging

#### API Usage & Rate Limits

- **BR-20:** Recipe searches are cached for 24 hours to minimize API calls
- **BR-21:** Users are limited to 50 recipe searches per day
- **BR-22:** Ingredient autocomplete queries are debounced by 300msrs meet their health goals by providing personalized recipe recommendations based on available ingredients and dietary profiles.

### Project Scope

This is a graduation project (Bitirme Projesi) demonstrating a comprehensive mobile application development with modern technologies, AI integration, and database management.

### Target Audience

- Busy professionals seeking convenient meal planning solutions
- Health-conscious individuals tracking nutrition and dietary goals
- Budget-conscious users wanting to minimize food waste
- Families looking to organize weekly meals efficiently

## Primary Goals

- Simplify the process of meal planning and preparation for users.
- Reduce food waste by utilizing ingredients users already possess.
- Assist users in achieving their health goals through personalized nutrition.
- Demonstrate proficiency in mobile development, backend integration, and AI/API services.
- Showcase modern software engineering practices and architecture.

---

## Tech Stack & Environment

### Frontend

- **Framework:** React Native (Expo)
- **Language:** TypeScript
- **Styling:** Stylesheet
- **Navigation:** Expo Router (file-based routing)
- **State Management:** Zustand
- **UI Components:** Custom components with reusable design system

### Backend

- **BaaS Platform:** Supabase
- **Database:** PostgreSQL
- **Authentication:** Supabase Auth (Email/Password, OAuth)
- **Storage:** Supabase Storage (for images)
- **Real-time:** Supabase Realtime subscriptions

### AI & External Services

- **Recipe API:** Spoonacular Search API (recipe recommendations)
- **Nutrition API:** Spoonacular Analysis API (nutritional calculations)
- **AI Features:** OpenAI GPT-4 API (ingredient recognition, meal suggestions)
- **Image Recognition:** OpenAI API (post-MVP feature)

### Development Tools

- **Version Control:** Git/GitHub
- **Package Manager:** npm
- **Code Quality:** ESLint, Prettier
- **Build:** EAS Build (Expo Application Services)

### Target Platform

- Cross-platform mobile app (iOS & Android)
- Minimum iOS version: 13.0
- Minimum Android version: 6.0 (API Level 23)

---

## Requirements & Features

### Functional Requirements

#### 1. User Management & Authentication (FR-1)

- **FR-1.1:** User registration with email and password validation
- **FR-1.2:** Secure login with email/password
- **FR-1.3:** OAuth integration (Google Sign-In, Apple Sign-In)
- **FR-1.4:** Password recovery and reset functionality
- **FR-1.5:** Email verification for new accounts
- **FR-1.6:** Session management and token refresh
- **FR-1.7:** User profile creation and editing
- **FR-1.8:** Profile deletion and account deactivation

#### 2. User Profile & Preferences (FR-2)

- **FR-2.1:** Dietary preference selection (vegan, vegetarian, pescatarian, keto, paleo, etc.)
- **FR-2.2:** Allergen management (add, edit, remove allergens)
- **FR-2.3:** Health goal setting (weight loss, muscle gain, maintenance, general health)
- **FR-2.4:** Daily calorie target input
- **FR-2.5:** Macronutrient ratio preferences (protein, carbs, fats)
- **FR-2.6:** Cuisine preferences (Italian, Asian, Mediterranean, etc.)
- **FR-2.7:** Cooking skill level selection
- **FR-2.8:** Household size input (number of servings)

#### 3. Ingredient Management (FR-3)

- **FR-3.1:** Digital pantry/inventory system
- **FR-3.2:** Add ingredients via text input with autocomplete
- **FR-3.3:** Ingredient categorization (produce, dairy, meat, grains, etc.)
- **FR-3.4:** Quantity and unit management
- **FR-3.5:** Expiration date tracking
- **FR-3.6:** Low stock alerts
- **FR-3.7:** Edit and delete ingredients
- **FR-3.8:** Bulk ingredient import
- **FR-3.9:** Search and filter pantry items
- **FR-3.10:** (Post-MVP) Add ingredients via camera/photo recognition

#### 4. Recipe Discovery & Recommendations (FR-4)

- **FR-4.1:** AI-powered recipe recommendations based on available ingredients
- **FR-4.2:** Recipe search by name, ingredient, or cuisine
- **FR-4.3:** Advanced filtering (meal type, cook time, difficulty, dietary restrictions)
- **FR-4.4:** Recipe detail view (ingredients, instructions, nutrition info, cook time)
- **FR-4.5:** Recipe images and step-by-step instructions
- **FR-4.6:** Allergen exclusion based on user profile
- **FR-4.7:** Ingredient substitution suggestions
- **FR-4.8:** Recipe rating and reviews
- **FR-4.9:** Save favorite recipes
- **FR-4.10:** Recipe scaling (adjust serving sizes)

#### 5. Meal Planning (FR-5)

- **FR-5.1:** Weekly meal planner view (7 days)
- **FR-5.2:** Three meal slots per day (Breakfast, Lunch, Dinner)
- **FR-5.3:** Optional snack planning
- **FR-5.4:** Drag-and-drop recipe assignment
- **FR-5.5:** Quick add from recommendations or favorites
- **FR-5.6:** Copy meals to other days
- **FR-5.7:** Clear and reschedule meals
- **FR-5.8:** Week-to-week navigation
- **FR-5.9:** Weekly nutrition summary
- **FR-5.10:** Meal plan templates (preset weekly plans)
- **FR-5.11:** Save and reload meal plans

#### 6. Shopping List Management (FR-6)

- **FR-6.1:** Auto-generate shopping list from meal plan
- **FR-6.2:** Compare required ingredients with pantry inventory
- **FR-6.3:** Smart list showing only missing items
- **FR-6.4:** Manual addition of items to shopping list
- **FR-6.5:** Check off items as purchased
- **FR-6.6:** Edit item quantities and notes
- **FR-6.7:** Organize items by store category
- **FR-6.8:** Share shopping list via text/email
- **FR-6.9:** Multiple shopping lists support
- **FR-6.10:** Add purchased items directly to pantry

#### 7. Meal Tracking & History (FR-7)

- **FR-7.1:** Log consumed meals by date
- **FR-7.2:** Meal consumption timestamp
- **FR-7.3:** Daily nutrition summary (calories, protein, carbs, fats)
- **FR-7.4:** Weekly and monthly nutrition analytics
- **FR-7.5:** Progress tracking against health goals
- **FR-7.6:** Visual charts and graphs for nutrition data
- **FR-7.7:** Meal history calendar view
- **FR-7.8:** Export meal history data
- **FR-7.9:** Water intake tracking (post-MVP)
- **FR-7.10:** Weight tracking integration (post-MVP)

#### 8. Notifications & Reminders (FR-8)

- **FR-8.1:** Meal preparation reminders
- **FR-8.2:** Shopping day reminders
- **FR-8.3:** Ingredient expiration alerts
- **FR-8.4:** Weekly meal planning reminders
- **FR-8.5:** Goal milestone notifications
- **FR-8.6:** Customizable notification preferences

### Non-Functional Requirements

#### Performance (NFR-1)

- **NFR-1.1:** App launch time < 3 seconds
- **NFR-1.2:** API response time < 2 seconds
- **NFR-1.3:** Smooth scrolling and animations (60 FPS)
- **NFR-1.4:** Offline data caching for core features
- **NFR-1.5:** Image lazy loading and optimization

#### Security (NFR-2)

- **NFR-2.1:** Encrypted data transmission (HTTPS)
- **NFR-2.2:** Secure password storage (hashing + salting)
- **NFR-2.3:** JWT token-based authentication
- **NFR-2.4:** Row-level security in database
- **NFR-2.5:** Input validation and sanitization
- **NFR-2.6:** Protection against common vulnerabilities (SQL injection, XSS)

#### Usability (NFR-3)

- **NFR-3.1:** Intuitive navigation and user interface
- **NFR-3.2:** Consistent design language
- **NFR-3.3:** Accessibility support (screen readers, font scaling)
- **NFR-3.4:** Multi-language support (Turkish, English)
- **NFR-3.5:** Error messages and user feedback
- **NFR-3.6:** Onboarding tutorial for new users

#### Scalability (NFR-4)

- **NFR-4.1:** Support for 10,000+ concurrent users
- **NFR-4.2:** Database optimization and indexing
- **NFR-4.3:** Efficient API call management
- **NFR-4.4:** Caching strategy for frequently accessed data

#### Maintainability (NFR-5)

- **NFR-5.1:** Clean code architecture (separation of concerns)
- **NFR-5.2:** Comprehensive code documentation
- **NFR-5.3:** TypeScript for type safety
- **NFR-5.4:** Modular component structure
- **NFR-5.5:** Version control best practices

### User Flows

1. User registers and sets up dietary profile.
2. User adds ingredients to digital pantry.
3. System generates personalized meal recommendations.
4. User plans weekly meals and generates a shopping list.
5. User logs meals and tracks nutritional intake.

### Business Rules

- Users must authenticate to access personalized services.
- Recipes must exclude user-specified allergens.
- Shopping lists only include items not in the user’s pantry.

---

## UI/UX Design

### Design Principles

- **Simplicity First:** Clean, uncluttered interface focusing on core tasks
- **Intuitive Navigation:** Clear information architecture with minimal learning curve
- **Visual Hierarchy:** Important actions and information prominently displayed
- **Consistency:** Unified design language across all screens
- **Accessibility:** WCAG 2.1 AA compliance, inclusive design
- **Performance:** Fast load times, smooth animations, responsive interactions

### Layout & Navigation

#### Navigation Structure

- **Tab Bar Navigation (Bottom):**

  - Home/Discover (Recipe recommendations)
  - Pantry (Ingredient inventory)
  - Meal Planner (Weekly calendar)
  - Profile (Settings and preferences)

- **Secondary Navigation:**
  - Shopping list (Accessible from meal planner)
  - Favorites (Accessible from home)
  - Meal history/tracking (Accessible from profile)
  - Search (Global search bar)

#### Screen Layouts

- **Mobile-First Design:** Optimized for smartphone screens (375x667 to 414x896)
- **Safe Area Handling:** Proper spacing for notches and home indicators
- **Scrollable Content:** Vertical scrolling with sticky headers where appropriate
- **Modal Sheets:** Bottom sheets for quick actions and forms

### Pages & Screens

#### 1. Onboarding Flow

- **Welcome Screen:** App introduction with hero image
- **Feature Highlights:** 3-4 screens showcasing key features
- **Sign Up/Login:** Authentication options
- **Profile Setup Wizard:** Multi-step form for preferences

#### 2. Home/Discover Screen

- **Header:** Personalized greeting, search icon, notification bell
- **Quick Stats Card:** Meals planned this week, pantry items
- **Recommended Recipes:** Horizontal scroll, based on available ingredients
- **Categories:** Breakfast, Lunch, Dinner, Snacks
- **Trending Recipes:** Popular and seasonal suggestions

#### 3. Recipe Detail Screen

- **Hero Image:** Full-width recipe photo
- **Title & Rating:** Recipe name, star rating, reviews
- **Quick Info:** Cook time, servings, difficulty, calories
- **Tabs:**
  - Ingredients (with availability indicators)
  - Instructions (step-by-step)
  - Nutrition (detailed breakdown)
- **Actions:** Save to favorites, add to meal plan, share

#### 4. Pantry/Inventory Screen

- **Search Bar:** Filter ingredients
- **Category Tabs:** All, Produce, Dairy, Meat, Grains, etc.
- **Ingredient Cards:** Name, quantity, expiration date (color-coded)
- **FAB (Floating Action Button):** Add ingredient
- **Bulk Actions:** Multi-select mode for deletion

#### 5. Add Ingredient Modal

- **Text Input:** Autocomplete suggestions
- **Category Selector:** Dropdown or picker
- **Quantity Input:** Number input with unit selector
- **Expiration Date:** Date picker (optional)
- **Add Button:** Save to pantry

#### 6. Weekly Meal Planner

- **Week Navigation:** Left/right arrows, current week highlighted
- **Calendar Grid:** 7 columns (days) x 3 rows (meals)
- **Meal Slots:** Empty state or recipe thumbnail
- **Drag-and-Drop Zone:** Visual feedback during drag
- **Bottom Actions:** Generate shopping list, view nutrition summary
- **Quick Add:** Floating button to search and add recipes

#### 7. Shopping List Screen

- **List Header:** Number of items, clear all
- **Grouped Items:** By category or store section
- **Checkboxes:** Mark items as purchased
- **Item Cards:** Name, quantity, notes
- **Actions:** Edit, delete, add manually
- **Share Button:** Export list to message/email

#### 8. Meal Tracking/History

- **Calendar View:** Monthly calendar with logged meals
- **Daily Summary Cards:** Meals consumed, total calories
- **Nutrition Charts:** Bar/line charts for weekly/monthly trends
- **Goal Progress:** Visual indicators (progress bars, rings)
- **Log Meal:** Quick add from recent or planned meals

#### 9. Profile & Settings

- **Profile Header:** Avatar, name, email
- **Profile Sections:**
  - Dietary Preferences
  - Allergens
  - Health Goals
  - Notification Settings
  - Account Settings
  - Help & Support
  - About & Legal
- **Logout Button:** Clear and accessible

#### 10. Search Screen

- **Search Bar:** Auto-focus with clear button
- **Recent Searches:** Quick access to previous queries
- **Filters:** Expandable filter panel
  - Meal type, cuisine, cook time, dietary restrictions
- **Results Grid:** Recipe cards with images
- **Sort Options:** Relevance, rating, cook time

### Interactions & Animations

- **Page Transitions:** Smooth slide/fade animations (200-300ms)
- **Button Feedback:** Scale down slightly on press
- **List Animations:** Staggered fade-in for items
- **Drag-and-Drop:** Visual feedback, haptic feedback on drop
- **Pull-to-Refresh:** Standard iOS/Android pattern
- **Swipe Gestures:** Reveal actions on list items
- **Modal Appearance:** Slide up from bottom with backdrop fade
- **Loading Shimmer:** Subtle shimmer effect on skeleton screens

### Accessibility Considerations

- **Screen Reader Support:** Semantic labels, proper heading hierarchy
- **Touch Targets:** Minimum 44x44 points
- **Color Contrast:** WCAG AA compliance (4.5:1 for text)
- **Font Scaling:** Support for system font size preferences
- **Focus Indicators:** Clear visual focus for keyboard navigation
- **Alternative Text:** Descriptive labels for all images and icons
- **Haptic Feedback:** Subtle vibrations for key interactions

---

## API Integration

### Edamam Recipe Search API

**Purpose:** Fetch recipe recommendations based on ingredients and dietary preferences

**Endpoints Used:**

- `GET /api/recipes/v2` - Recipe search
- Query parameters: q (ingredients), diet, health, cuisineType, mealType, time

**Authentication:** Application ID + Application Key

**Rate Limits:**

- Free tier: 5,000 calls/month
- Developer tier: 10,000 calls/month (recommended)

**Response Caching:** 24 hours to minimize API calls

**Error Handling:**

- Retry logic with exponential backoff
- Fallback to cached results
- User-friendly error messages

### Edamam Nutrition Analysis API

**Purpose:** Calculate detailed nutrition information for custom meals

**Endpoints Used:**

- `POST /api/nutrition-details` - Analyze nutrition for ingredients

**Authentication:** Application ID + Application Key

**Usage:**

- Calculate nutrition for user-created meals
- Validate ingredient quantities
- Macro/micronutrient breakdown

### OpenAI API Integration

**Purpose:** AI-powered features for enhanced user experience

**Use Cases:**

- Ingredient name normalization and suggestions
- Recipe substitution recommendations
- Meal plan generation based on preferences
- Natural language recipe search

**Model:** GPT-4 Turbo (gpt-4-turbo-preview)

**Safety & Moderation:**

- Content filtering for appropriate suggestions
- Rate limiting per user
- Cost monitoring and caps

**Prompt Engineering:**

- Structured prompts with dietary restrictions
- JSON response format for parsing
- Context-aware suggestions

### (Post-MVP) OpenAI Vision API

**Purpose:** Image recognition for ingredient identification

**Use Cases:**

- Scan grocery receipts
- Identify ingredients from photos
- Automatic pantry updates

**Model:** GPT-4 Vision (gpt-4-vision-preview)

---

## Application Architecture

### Frontend Architecture

#### Project Structure

```
app/
├── (auth)/                    # Auth screens (login, signup)
├── (tabs)/                    # Main tab navigation
│   ├── index.tsx             # Home/Discover
│   ├── pantry.tsx            # Ingredient inventory
│   ├── planner.tsx           # Meal planner
│   └── profile.tsx           # User profile
├── (modals)/                 # Modal screens
│   ├── recipe-detail.tsx
│   ├── add-ingredient.tsx
│   └── shopping-list.tsx
├── _layout.tsx               # Root layout
└── +not-found.tsx            # 404 screen

components/
├── ui/                       # Reusable UI components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── modal.tsx
├── recipe/                   # Recipe-related components
│   ├── recipe-card.tsx
│   ├── recipe-list.tsx
│   └── ingredient-list.tsx
├── planner/                  # Meal planner components
│   ├── meal-slot.tsx
│   ├── week-calendar.tsx
│   └── nutrition-summary.tsx
└── pantry/                   # Pantry components
    ├── ingredient-item.tsx
    └── category-filter.tsx

features/
├── auth/                     # Authentication logic
│   ├── hooks/
│   ├── services/
│   └── types/
├── recipes/                  # Recipe management
│   ├── hooks/
│   ├── services/
│   └── types/
├── pantry/                   # Ingredient management
│   ├── hooks/
│   ├── services/
│   └── types/
├── planner/                  # Meal planning
│   ├── hooks/
│   ├── services/
│   └── types/
└── tracking/                 # Meal logging & analytics
    ├── hooks/
    ├── services/
    └── types/

lib/
├── supabase.ts              # Supabase client setup
├── api/                     # External API clients
│   ├── edamam.ts
│   └── openai.ts
├── utils/                   # Utility functions
│   ├── date.ts
│   ├── nutrition.ts
│   └── validation.ts
└── constants/               # App constants
    ├── colors.ts
    ├── dietary-options.ts
    └── allergens.ts

hooks/
├── use-auth.ts              # Authentication state
├── use-recipes.ts           # Recipe data
├── use-pantry.ts            # Pantry state
└── use-theme.ts             # Theme management

types/
├── database.ts              # Supabase generated types
├── recipe.ts                # Recipe types
├── user.ts                  # User types
└── nutrition.ts             # Nutrition types

constants/
└── theme.ts                 # Theme configuration
```

#### State Management Strategy

**Local State:** React useState for component-level state

**Global State:** React Context API / Zustand for:

- User authentication state
- User profile data
- Current pantry items
- Active meal plan
- Shopping list items

**Server State:** React Query / SWR for:

- Recipe data
- API responses
- Cached search results

**Persistent State:** AsyncStorage for:

- User preferences
- Offline data
- Recent searches

#### Data Flow

1. User action triggers event
2. Component calls service function
3. Service interacts with Supabase/API
4. Response updates global state
5. UI re-renders with new data

### Backend Architecture (Supabase)

#### Edge Functions

- **generate-shopping-list:** Calculate missing ingredients
- **send-notifications:** Scheduled notifications via cron
- **process-meal-plan:** Batch process weekly meal plans
- **calculate-nutrition:** Aggregate nutrition data

#### Database Triggers

- **update_updated_at:** Auto-update timestamp on record changes
- **sync_user_profile:** Create profile on user registration
- **check_ingredient_expiration:** Flag expiring ingredients

#### Webhooks

- **payment-webhook:** Handle subscription payments (post-MVP)
- **auth-webhook:** Log authentication events

---

## Security & Privacy

### Data Security

- **Encryption in Transit:** All API calls over HTTPS/TLS 1.3
- **Encryption at Rest:** Supabase database encryption
- **Password Security:** Bcrypt hashing with salt (handled by Supabase)
- **Token Security:** JWT with short expiration (1 hour), refresh tokens (30 days)
- **API Key Protection:** Environment variables, never in source code

### Privacy Compliance

- **GDPR Compliance:** User data export and deletion rights
- **KVKK Compliance:** Turkish data protection regulations
- **Data Minimization:** Collect only necessary information
- **User Consent:** Clear privacy policy and terms of service
- **Anonymous Analytics:** No PII in analytics data

### Security Best Practices

- **Input Sanitization:** Validate and sanitize all user inputs
- **SQL Injection Prevention:** Parameterized queries, RLS policies
- **XSS Prevention:** Content Security Policy, sanitized outputs
- **Rate Limiting:** Prevent abuse of API endpoints
- **Error Handling:** Generic error messages (no sensitive data exposure)
- **Dependency Scanning:** Regular security audits with npm audit

---

## Deployment & DevOps

### Version Control

- **Platform:** GitHub
- **Branching Strategy:** GitFlow (main, develop, feature/, bugfix/)
- **Commit Convention:** Conventional Commits
- **Pull Requests:** Required reviews before merge

### CI/CD Pipeline

- **Platform:** GitHub Actions
- **Automated Tasks:**
  - Lint and format check
  - Type checking (TypeScript)
  - Unit test execution
  - Build validation
  - Automated deployment to Expo

### Build & Distribution

- **Build Service:** EAS Build (Expo Application Services)
- **Beta Testing:** TestFlight (iOS), Google Play Internal Testing (Android)
- **Production Release:** App Store, Google Play Store

### Monitoring & Analytics

- **Crash Reporting:** Sentry
- **Analytics:** Mixpanel / PostHog (privacy-focused)
- **Performance Monitoring:** Expo Performance Monitoring
- **User Feedback:** In-app feedback form

### Environment Configuration

- **Development:** Local Supabase, test API keys
- **Staging:** Staging Supabase project, test API keys
- **Production:** Production Supabase, production API keys

---

## Project Timeline & Milestones

### Phase 1: Foundation (Weeks 1-2)

- [x] Project setup (Expo, TypeScript, ESLint)
- [x] Supabase project configuration
- [x] Database schema implementation
- [x] Authentication system (Email/Password)
- [x] User profile setup flow

### Phase 2: Core Features (Weeks 3-5)

- [x] Recipe detail view - osman
- [x] Save favorite recipes - osman

- [x] Spoonacular API integration - yusuf
- [x] Recipe search and display - yusuf

- [x] Ingredient management (CRUD operations) - yusuf
- [x] Recipe detail scroll header (sticky header) - osman
- [x] Onboarding veri hatası - yunus
- [x] spoonaculardaki diet tipleri kullanılacak ve sadece 1 diet tipi seçilme özelliği eklencek. - yunus

- [x] Basic meal planner UI - yusuf

### Phase 3: Meal Planning (Weeks 6-7)

- [x] Weekly meal planner functionality - yusuf
- [x] Drag-and-drop recipe assignment - osman

- [x] Nutrition summary calculations

- [x] Shopping list generation - yusuf
- [x] Shopping list management - yusuf
- [x] Yemek eklenince shopping listeye otomatik ekleme - yusuf
- [x] Multiple conflicting goals? If user selects both lose-weight and gain-weight, how should we prioritize? / Recommend prioritizing the first selected goal or showing a warning.

- [x] hep aynı mealler üretilyor düzelt
- [x] ai recipe yapınca mealplandeki yemek değişiyor
- [x] hangi gün için yapıldıysa o güne atsın
- [x] favoriler eklenirken calori bilgisi gözükmüyor

## onboarding - yunus

- [x] goals sayfasına description eklet
- [x] height/weight kısmına keyboard aware scrollview lazım
- [x] allergies syafasında search ettiğimiz malzeme ismi gözükmüyor item #id gibi gözüküyor - yusuf - commit - 5c0248d7672bacc912f5e572fccda5d1d845f86f
- [x]goalsda logolara ayar çek
- motivaayon işi - yusuf
- [x] something went wrong hatası hala devam ediyor!!!! - yusuf - commit 96924d25ee19508ee39d43ada9e40538dd49f06a
- [x] quantity seçmeyi daha mantıklı yap - yusuf - a49c11e8e0a5e2d7d876bfa06b42b2b4d1f25257

- [x] diet preferences da resimlerin sağında gölge var
- [x] debouncing lazım her harf gönderdiğimizde istek atıyor saniye 2 istek hakkımız var onu belirt
- [x] frozen
- [x] statusü de kaldır
- [x] mealplane yeni yüz lazım
- [x] anasayfa default statei düzelt
- [x] geçmiş tarihlerde yemek eklemeyi kaldır sadece gösterme silme olsun - 3479654c18f2671f3e765d3fe2082fd1dad883aa
- [x] height/weight kısmı scrollable yapma(Düzelt) androidde yarısı gözükmüyor

### global

- [] Fix error states - yunus
- [] tanıtım tutorialı tarzı bir şey eklensin bu en son yapılacak!!!

### onboarding

- [] dive in butonu androidde geri butonunun gerisinde kalıyor
- [] çok abartı bir animasyon var age, height,weight adult olarak yazılmış ne onu açıkla
- [] günde kaç öğün yiyorsa onun saati alınsın yoksa default olan kullanılsın hep aynı soruyu soruyuor hoca
- [] cuisines de mutfak resimleri gitmiş düzeltilsin.
- [] dark mode olurken uygulamanın tasarımı kötü duruyor. allergies sayfasında!!
- [] adjust targetsta yüzdelik olarak verilsin.
- [] cooking skills seçildiğinde otomatik aşağı kaydırılsın kullanıcı görsün. -yusuf
- [] diet-optionsda calori bilgileri hepsinde aynı defualtmacros da aynı
- [] /flow?section=meal-time&step=3 sayfasında gölgeye basınca scroll yapılamıyor androidde
- console logları sil!

### ana sayfa

- [] anasayfa animasyonu
- [] ana sayfada sınır ekle max 7 gün ??? yunusa sor bunu
- [] yunusun nota bakılacak ai generatedla ilgili
- [] hangi tarif replacedeyse o lunchsa lunch olsun
- [] onboardingte kaç öğün seçildiyse o öğünler gözüksün

### meal plan

- [x] var olan mealplan de üstüne yazsın
- [x] tasarımı düzelthangi meal seçildiyse o gözüksün şimdi hepsi gözüküyor.
- [] mealplande recipes sayfasındaki gibi ingredient ekleme olayı olsun debouncing kullan osman hataları düzeltince ekle - yusuf
- [] sentry gibi hata raporlama sistemi ekle
- [] servings ayarlama !!!!! ÇOK ÖNEMLİ yusuf
- [] servings için mi calori ingredient kalori felan 1 kişi için mi

### recipes

- [] select ingredients altta kalıyor
- [] alerji scrollable degil
- [x] search recipes inputuna hepsini sil butonu eklenbilir

- [x] snacks seçeneğini kaldır generate with ai da
- [x] çok saçma sapan yemekler gözüküyor ilk loadda sort parametresini değiştir
- [x] scroll ederken yüklenme skeletonu gözükmüyor

### recipes - osman

- [x] recipes sayfasındaki ingredient filtresi doğru çalışmıyor scrollable değil.
- [] aşağı kaydırınca loading gözükmüyro skleeton recipes gözükmüyor!
- [] select ingredients altta kalıyor - yusuf
- [] alerji scrollable degil - yusuf
- [] search recipes inputuna hepsini sil butonu eklenebilir 
- [] snacks seçeneğini kaldır generate with ai da - yusuf
- [] çok saçma sapan yemekler gözüküyor ilk loadda sort parametresini değiştir
- [] scroll ederken yüklenme skeletonu gözükmüyor - yusuf

### recipes - osman

- [] recipes sayfasındaki ingredient filtresi doğru çalışmıyor scrollable değil.- yusuf
- [] aşağı kaydırınca loading gözükmüyro skleeton recipes gözükmüyor! - yusuf
- [x] healthy ,easy badgeleri gözükmüyor burası spoonaculardaki şeylerden miçekiliyor oraya bak!
- [x] spoonaculardeki filter tagleri kullanılsın healthy veg vs. diye

### pantry - yusuf

- [] prefill deki olayın kg litresini felan düzelt
- [] update butonu kaldır onun yerine eğer resim yoksa update butonu çıksın
- [] scanresults sayfasının tasarımını düzelt

### profile

- [] statusbarın rengiyle farklı header kötü duruyor orası.
- [] yunusun hologram sayfası
- [] dark mode animasyonu düzeltilsin ya da kaldırılsın donuyor
- dark mode tam uyumlu değil!!

### Phase 4: Tracking & Analytics (Weeks 8-9)

- [x] Meal logging system
- [x] Nutrition tracking - yunus
- [x] Goal progress indicators - yunus
- [x] History view - yunus

### Phase 5: Enhancements (Weeks 10-11)

### Phase 6: Testing & Refinement (Weeks 12-13)

- [ ] OAuth integration (Google)
- [x] Notifications system
- [ ] Advanced filtering
- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] Bug fixes
- [ ] UI/UX polish
- [ ] Accessibility improvements
- [ ] Documentation

### Phase 7: Deployment (Week 14)

- [ ] Final documentation
- [ ] Project presentation preparation

---

## Risk Assessment & Mitigation

### Technical Risks

**Risk:** API rate limits exceeded

- **Impact:** High
- **Mitigation:** Implement aggressive caching, upgrade API tier, fallback strategies

**Risk:** Third-party API downtime (Edamam, OpenAI)

- **Impact:** Medium
- **Mitigation:** Cached data fallback, error handling, status monitoring

**Risk:** Database performance degradation

- **Impact:** High
- **Mitigation:** Proper indexing, query optimization, connection pooling

**Risk:** Mobile platform compatibility issues

- **Impact:** Medium
- **Mitigation:** Thorough device testing, use stable library versions

### Business Risks

**Risk:** Low user adoption

- **Impact:** High
- **Mitigation:** User feedback loops, marketing strategy, referral program

**Risk:** Competition from established apps

- **Impact:** Medium
- **Mitigation:** Unique AI features, superior UX, focus on Turkish market

**Risk:** High API costs

- **Impact:** Medium
- **Mitigation:** Cost monitoring, efficient API usage, caching strategy

### Security Risks

**Risk:** Data breach or unauthorized access

- **Impact:** Critical
- **Mitigation:** Strong RLS policies, encryption, regular security audits

**Risk:** Account takeover or fraud

- **Impact:** High
- **Mitigation:** MFA support, suspicious activity monitoring, rate limiting

---

## Documentation Requirements

### Technical Documentation

- **README.md:** Project setup, installation, running instructions
- **API Documentation:** Endpoint descriptions, request/response formats
- **Database Schema:** ER diagrams, table relationships
- **Architecture Docs:** System design, data flow diagrams
- **Deployment Guide:** CI/CD pipeline, environment setup

### User Documentation

- **User Guide:** How to use app features
- **FAQ:** Common questions and answers
- **Privacy Policy:** Data collection and usage
- **Terms of Service:** User agreements
- **Help Center:** In-app support articles

### Code Documentation

- **Inline Comments:** Complex logic explanation
- **JSDoc Comments:** Function and component documentation
- **Component README:** Component usage examples
- **Type Definitions:** Well-documented TypeScript interfaces

---

## Graduation Project Specific Requirements

### Academic Deliverables

1. **Project Report:** Comprehensive documentation of development process
2. **System Design Document:** Architecture diagrams and technical specifications
3. **User Manual:** End-user documentation with screenshots
4. **Source Code:** Clean, well-commented codebase with README
5. **Demo Video:** 5-10 minute app demonstration
6. **Presentation:** PowerPoint/PDF for defense

### Demonstration Requirements

- **Live Demo:** Working application on physical devices
- **Key Features Showcase:** All core functionalities demonstrated
- **Technical Explanation:** Architecture and technology choices
- **Challenges & Solutions:** Problems encountered and how they were solved
- **Future Work:** Planned enhancements and scalability

### Evaluation Criteria

- **Functionality:** Does the app work as intended? (30%)
- **Code Quality:** Clean, maintainable, well-structured code (25%)
- **UI/UX Design:** User-friendly, intuitive interface (20%)
- **Innovation:** Unique features, AI integration (15%)
- **Documentation:** Complete and clear documentation (10%)

---

### References

- Edamam API Documentation: https://developer.edamam.com/
- Spoonacular API Documentation: https://spoonacular.com/food-api
- Supabase Documentation: https://supabase.com/docs
- React Native Documentation: https://reactnative.dev/
- Expo Documentation: https://docs.expo.dev/
- OpenAI API Reference: https://platform.openai.com/docs
