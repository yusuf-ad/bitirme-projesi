# Meal Plan Generation System - Implementation Plan

## Overview

Create a complete meal plan generation system with step-by-step animations that automatically generates meal plans based on user preferences and pantry items, then navigates to a preview screen.

## Architecture

### 1. Step-by-Step Progress Animation Component

**File:** `features/meal-plan/components/generation-progress.tsx`

**Purpose:** Display animated progress steps during meal plan generation

**Features:**

- Animated step indicators with checkmarks
- Progress text updates for each step
- Smooth transitions between steps
- Loading spinners for active steps
- Error state handling

**Steps to Display:**

1. **Loading pantry** - "Loading pantry items... (X items found)"
2. **Fetching preferences** - "Loading your preferences..."
3. **Generating ideas** - "Generating meal ideas with AI..."
4. **Searching recipes** - "Searching breakfast recipes..."
5. **Searching recipes** - "Searching lunch recipes..."
6. **Searching recipes** - "Searching dinner recipes..."
7. **Finalizing** - "Preparing your meal plan..."

**Animation Details:**

- Use React Native Animated API for smooth transitions
- Checkmark animation when step completes
- Progress bar at top showing overall completion
- Fade-in/fade-out text changes

### 2. Comprehensive Meal Plan Generation API

**File:** `app/api/generate-meal-plan+api.ts`

**Purpose:** Handle complete meal plan generation process

**Process Flow:**

1. Receive user ID and date parameters
2. Fetch user onboarding preferences
3. Fetch pantry items
4. Call existing `generate-meal-ideas+api.ts` for AI-generated queries
5. Fetch recipes from Spoonacular for each meal type
6. Return structured meal plan data

**API Endpoint:**

```typescript
POST /api/generate-meal-plan
Body: { userId: string, date: string, mealTypes?: MealType[] }
Response: { success: boolean, data?: MealPlan, error?: string, progress?: ProgressStep[] }
```

**Error Handling:**

- Network errors for each external API call
- Fallback to default queries if AI generation fails
- Partial results if some meal types fail
- Detailed error messages for UI display

### 3. Modified Select Meals Screen

**File:** `app/(plan)/select-meals.tsx`

**Changes Required:**

- Replace manual "Test Fetch Recipes" button with automatic generation
- Integrate GenerationProgress component
- Handle API call to `generate-meal-plan+api.ts`
- Show loading state during generation
- Navigate to preview on success
- Show error state with retry option

**New Flow:**

1. Screen loads with user preferences
2. Automatically starts meal plan generation
3. Shows progress animation
4. On success: navigate to preview with meal plan data
5. On error: show error message with retry button

### 4. Updated Preview Screen

**File:** `app/(plan)/preview.tsx`

**Changes Required:**

- Handle navigation from generation flow
- Accept meal plan data via params or state
- Maintain existing replace functionality
- Ensure proper back navigation behavior

**Navigation Flow:**

```
create.tsx → select-meals.tsx (with generation) → preview.tsx
```

### 5. Loading States and Error Handling

**Loading States:**

- Full-screen loading overlay during generation
- Disable UI interactions during loading
- Show progress animation at all times
- Skeleton loading for preview screen

**Error Handling:**

- Network error handling for each API call
- User-friendly error messages
- Retry functionality for failed generation
- Fallback to default behavior if AI fails

**Success Handling:**

- Smooth transition to preview
- Clear loading states
- Proper data passing between screens

## Data Flow

### MealPlan Data Structure

```typescript
interface MealPlan {
  breakfast?: {
    results: Meal[];
    totalResults: number;
  };
  lunch?: {
    results: Meal[];
    totalResults: number;
  };
  dinner?: {
    results: Meal[];
    totalResults: number;
  };
}

interface Meal {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  cuisines: string[];
  type: string[];
}
```

### Progress Step Structure

```typescript
interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "error";
  details?: string;
}
```

## Implementation Order

1. **Create GenerationProgress component** - Independent UI component
2. **Create API endpoint** - Backend logic for meal plan generation
3. **Modify select-meals.tsx** - Integrate progress and API calls
4. **Update preview.tsx** - Handle new navigation flow
5. **Test complete flow** - End-to-end testing

## Technical Considerations

### Performance

- Parallel API calls where possible (pantry + preferences)
- Sequential recipe fetching to update progress
- Optimistic UI updates for better perceived performance

### User Experience

- Clear progress indication at all times
- Smooth animations for professional feel
- Helpful error messages with actionable steps
- Automatic retry for transient failures

### Code Reuse

- Leverage existing `generate-meal-ideas+api.ts`
- Use existing Spoonacular API utilities
- Maintain consistent error handling patterns
- Follow existing styling and component patterns

## Testing Strategy

3. **Error Scenarios:** Network failures, API errors
4. **Edge Cases:** Empty pantry, missing preferences
5. **User Flow:** Complete journey from create to preview

## Future Enhancements

- Multi-day meal plan generation
- Advanced filtering and sorting options
- Meal plan templates
- Batch generation for multiple days
- Export functionality
- Meal plan sharing
