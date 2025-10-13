<!-- e22bd275-942f-4ee7-9d50-67ec433e688e b1ca6452-cd40-465a-b9d0-c0104f25e2e2 -->
# Onboarding Architecture Plan

## Architecture Overview

Create a feature-based onboarding system with:

- **Centralized state management** using Zustand for progress tracking and data persistence
- **Shared components** for ImageBackground wrapper, navigation buttons, progress indicators
- **Feature-based structure** in `/features/onboarding/` instead of nested app routes
- **Dynamic page routing** using query parameters to handle multiple pages per section
- **AsyncStorage** for saving/resuming onboarding progress

## Directory Structure

```
features/onboarding/
├── components/
│   ├── onboarding-layout.tsx          # Shared ImageBackground wrapper
│   ├── onboarding-navigation.tsx      # Back/Next buttons component
│   ├── progress-bar.tsx               # Progress indicator
│   └── page-content.tsx               # Reusable page content wrapper
├── sections/
│   ├── goals/
│   │   ├── goals-cover.tsx            # Cover page
│   │   ├── goals-extra.tsx            # Extra page
│   │   ├── goals-content.tsx          # Main selection page
│   │   └── goals-related-[step].tsx   # 5 related pages
│   ├── body/
│   │   └── [similar structure]
│   └── meal-time/
│       └── [similar structure]
├── hooks/
│   ├── use-onboarding-state.ts        # Zustand store for state
│   └── use-onboarding-navigation.ts   # Navigation logic
├── services/
│   └── onboarding-storage.ts          # AsyncStorage persistence
├── types/
│   └── onboarding.types.ts            # TypeScript interfaces
└── index.ts                           # Feature exports
```

## Route Structure

Instead of nested folders, use a single dynamic route:

```
app/(onboarding)/
├── _layout.tsx                        # Stack layout
├── welcome.tsx                        # Initial welcome screen
└── flow.tsx                           # Single dynamic page handler
```

The `flow.tsx` will use query params: `/flow?section=goals&step=0`

## State Management (Zustand)

Create `/features/onboarding/hooks/use-onboarding-state.ts`:

```typescript
interface OnboardingState {
  currentSection: 'goals' | 'body' | 'meal-time';
  currentStep: number;
  data: {
    goals: string[];
    body: { weight: number; height: number; /* etc */ };
    mealTime: { breakfast: string; lunch: string; dinner: string };
  };
  progress: number; // 0-100
  isCompleted: boolean;
  
  // Actions
  setCurrentPage: (section, step) => void;
  updateData: (section, data) => void;
  nextPage: () => void;
  previousPage: () => void;
  saveProgress: () => Promise<void>;
  loadProgress: () => Promise<void>;
  resetOnboarding: () => void;
}
```

## Shared Components

### 1. OnboardingLayout Component

Wraps all pages with consistent ImageBackground, overlay, and structure:

- Uses `require("@/assets/images/onboarding-bg.png")` with blur
- Dark overlay for text readability
- Safe area handling
- Content area with proper padding

### 2. OnboardingNavigation Component

Reusable back/next button group:

- Back button (icon only, semi-transparent)
- Next/Continue button (full width, primary color)
- Handles navigation logic via hook
- Disabled states for validation

### 3. ProgressBar Component

Visual indicator of onboarding progress:

- Shows current position in total flow
- Section-based grouping
- Smooth transitions

## Page Configuration

Create a configuration file `/features/onboarding/config/pages-config.ts`:

```typescript
export const ONBOARDING_PAGES = [
  { section: 'goals', step: 0, component: 'goals-cover' },
  { section: 'goals', step: 1, component: 'goals-extra' },
  { section: 'goals', step: 2, component: 'goals-content' },
  { section: 'goals', step: 3, component: 'goals-related-1' },
  // ... continue for all 21 pages
];
```

## Navigation Logic

The `use-onboarding-navigation.ts` hook will:

1. Calculate total pages (21)
2. Track current position
3. Handle next/previous with validation
4. Auto-save on each page change
5. Calculate progress percentage
6. Determine when onboarding is complete

## Data Persistence

Use AsyncStorage to:

- Save after each page completion
- Store user selections
- Save current position
- Allow resume from last position
- Clear data after completion

## Migration from Current Structure

1. Keep existing welcome screen at `app/(onboarding)/index.tsx`
2. Move profile/index.tsx content to feature-based structure
3. Refactor goals/index.tsx to use shared components
4. Update navigation to use new flow route
5. Remove nested folder structure

## Benefits of This Architecture

✅ Scalable to 21+ pages without route bloat

✅ Easy to add/remove pages via configuration

✅ Shared components ensure consistency

✅ Centralized state makes debugging easier

✅ Progress persistence works seamlessly

✅ Linear navigation is enforced by design

✅ Feature-based structure follows project conventions

### To-dos

- [ ] Create TypeScript interfaces for onboarding state and page configuration
- [ ] Set up Zustand store for onboarding state management with persistence
- [ ] Create AsyncStorage service for saving/loading onboarding progress
- [ ] Build OnboardingLayout shared component with ImageBackground and overlay
- [ ] Build OnboardingNavigation shared component with back/next buttons
- [ ] Build ProgressBar component for visual progress indication
- [ ] Create pages configuration file defining all 21 pages structure
- [ ] Create navigation hook with next/previous logic and validation
- [ ] Set up new route structure with dynamic flow.tsx page
- [ ] Build Goals section pages (cover, extra, content, 5 related)
- [ ] Build Body section pages following same pattern
- [ ] Build Meal-time section pages following same pattern
- [ ] Migrate existing welcome and goals pages to new structure
- [ ] Remove old profile/goals folder structure and update layout