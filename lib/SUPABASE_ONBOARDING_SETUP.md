# Supabase Onboarding Setup Guide

## Overview

This guide explains the Supabase database schema for storing user onboarding data. The implementation includes 4 interconnected tables, Row Level Security (RLS) policies, and TypeScript service functions for seamless data management.

## Database Tables

### 1. `user_goals`

Stores user fitness and lifestyle goals.

**Schema:**

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → auth.users)
- `goal_ids` (TEXT array) - e.g., ["healthy-eating", "lose-weight", "build-muscle"]
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Constraints:** UNIQUE on user_id

### 2. `user_body_metrics`

Stores physical body measurements and demographic information.

**Schema:**

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → auth.users)
- `gender` (TEXT) - "male", "female", or "prefer-not-to-say"
- `age` (INTEGER) - Age in years
- `height_cm` (FLOAT) - Height in centimeters
- `weight_kg` (FLOAT) - Weight in kilograms
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Constraints:** UNIQUE on user_id, CHECK constraints for valid ranges

### 3. `user_meal_times`

Stores meal time preferences.

**Schema:**

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → auth.users)
- `breakfast_time` (TIME) - Format: "HH:MM" (24-hour)
- `lunch_time` (TIME)
- `dinner_time` (TIME)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Constraints:** UNIQUE on user_id

### 4. `user_taste_preferences`

Stores taste, dietary, and cooking preference data.

**Schema:**

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → auth.users)
- `meal_types` (TEXT array) - e.g., ["breakfast", "lunch", "dinner"]
- `cuisines` (TEXT array) - e.g., ["italian", "asian", "mediterranean"]
- `allergies_dislikes` (TEXT array) - e.g., ["nuts", "fish", "dairy"]
- `diet_preferences` (TEXT array) - e.g., ["vegetarian", "keto"]
- `cooking_skill_level` (TEXT) - "beginner", "intermediate", or "advanced"
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Constraints:** UNIQUE on user_id, CHECK constraint for cooking_skill_level

## Setting Up the Schema

### Step 1: Execute SQL Migrations

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Create a new query and copy the entire contents of `lib/supabase-migrations.sql`
4. Execute the migration script

The script will:

- Create all 4 tables with appropriate columns and constraints
- Set up indexes for faster queries
- Enable Row Level Security (RLS) on all tables
- Create RLS policies for data isolation
- Set up triggers for automatic `updated_at` timestamp updates

### Step 2: Verify RLS is Enabled

1. In Supabase Dashboard, go to Authentication → Policies
2. Confirm all tables have RLS enabled (indicated by a lock icon)
3. Verify 4 policies per table (SELECT, INSERT, UPDATE, DELETE)

## TypeScript Integration

### Service Layer (`lib/supabase-onboarding.ts`)

The service layer provides type-safe functions for all database operations:

#### Goals

```typescript
updateUserGoals(userId, goalIds); // Update user goals
getUserGoals(userId); // Fetch user goals
```

#### Body Metrics

```typescript
updateUserBodyMetrics(userId, metrics); // Update body info
getUserBodyMetrics(userId); // Fetch body info
```

#### Meal Times

```typescript
updateUserMealTimes(userId, mealTimes); // Update meal times
getUserMealTimes(userId); // Fetch meal times
```

#### Taste Preferences

```typescript
updateUserTastePreferences(userId, preferences); // Update preferences
getUserTastePreferences(userId); // Fetch preferences
```

#### Complete Profile

```typescript
getUserOnboardingProfile(userId); // Fetch all onboarding data
createUserOnboardingProfile(userId, profileData); // Create full profile
convertMealTimesFromDB(mealTimes); // Convert TIME format to object
```

### Onboarding Provider (`providers/onboarding-provider.tsx`)

The provider adds async save functions and data loading:

**Available Methods:**

- `saveGoals(goals)` - Save goals to Supabase
- `saveBodyMetrics()` - Save body metrics to Supabase
- `saveMealTimes()` - Save meal times to Supabase
- `saveTastePreferences()` - Save taste preferences to Supabase
- `loadOnboardingData()` - Load all onboarding data from Supabase
- `isLoading` - Boolean flag for loading state

## Usage Examples

### Saving Data After Section Completion

```typescript
import { useOnboarding } from "@/providers/onboarding-provider";

function GoalsSection() {
  const { selectedGoals, saveGoals } = useOnboarding();

  const handleNext = async () => {
    try {
      await saveGoals(selectedGoals);
      // Navigate to next section
    } catch (error) {
      console.error("Failed to save goals", error);
      // Show error to user
    }
  };

  return (
    // JSX...
  );
}
```

### Loading Existing Data

```typescript
import { useOnboarding } from "@/providers/onboarding-provider";
import { useEffect } from "react";

function OnboardingFlow() {
  const { loadOnboardingData, isLoading } = useOnboarding();

  useEffect(() => {
    loadOnboardingData();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    // JSX...
  );
}
```

### Accessing Saved Data

```typescript
const { age, height, weight, selectedCuisines } = useOnboarding();
// Data is automatically populated from database when component mounts
```

## Time Format Conversion

Meal times are stored in PostgreSQL TIME format (HH:MM, 24-hour) in the database but managed as objects in the app:

**App Format:**

```typescript
{ hour: 10, minute: 30, period: "AM" }
```

**Database Format:**

```
"10:30" // 24-hour time
```

**Conversion Functions:**

- `timeToString()` - Converts app format → DB format
- `stringToTime()` - Converts DB format → app format
- `convertMealTimesFromDB()` - Bulk conversion for all meal times

## Row Level Security (RLS) Overview

All tables have RLS enabled with 4 policies each:

1. **SELECT** - Users can only view their own data
2. **INSERT** - Users can only insert data for themselves
3. **UPDATE** - Users can only update their own data
4. **DELETE** - Users can only delete their own data

All policies use `auth.uid() = user_id` to ensure data isolation.

## Error Handling

The service functions return `null` on error and log to console. The provider functions throw errors for you to handle:

```typescript
try {
  await saveGoals(goals);
} catch (error) {
  // Handle error
}
```

## Data Migration (If Needed)

If you have existing onboarding data stored locally, you can migrate it:

```typescript
import { createUserOnboardingProfile } from "@/lib/supabase-onboarding";

// When user completes onboarding
await createUserOnboardingProfile(userId, {
  goals: selectedGoals,
  gender: selectedGender,
  age: age,
  height: height,
  weight: weight,
  breakfast: breakfastTime,
  lunch: lunchTime,
  dinner: dinnerTime,
  meals: selectedMeals,
  cuisines: selectedCuisines,
  allergies: selectedAllergies,
  diets: selectedDietPreferences,
  cookingSkill: selectedCookingSkill,
});
```

## Best Practices

1. **Load on App Start** - Call `loadOnboardingData()` when user enters app after authentication
2. **Save After Each Section** - Save data as user completes each section for data safety
3. **Show Loading States** - Use the `isLoading` flag to show spinners during operations
4. **Handle Errors Gracefully** - Always wrap save operations in try-catch
5. **Validate Input** - Check data validity before saving (covered by SQL constraints)
6. **Respect RLS** - Never try to bypass RLS policies

## Troubleshooting

### "PGRST116" Error

This is not an error - it means no rows were found. The service functions handle this gracefully.

### "User not found" Error

Ensure user is authenticated before calling save functions.

### Data Not Persisting

1. Check that RLS policies are correctly enabled
2. Verify user ID matches between auth.users and onboarding tables
3. Check Supabase logs for detailed error messages

### Time Format Issues

Use the provided `convertMealTimesFromDB()` function to handle all conversions automatically.
