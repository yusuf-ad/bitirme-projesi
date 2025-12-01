# Allergies & Diet Screen - Image Display Implementation Plan

## Current State
The [`allergies-diet.tsx`](app/(app)/(profile)/allergies-diet.tsx) screen currently displays:
- **Diet Preferences**: Shows diet IDs as text tags (e.g., "balanced", "keto")
- **Allergies**: Shows allergy IDs as text tags (e.g., "1", "2", "name-apple")

## Desired State
Display images from Spoonacular API instead of IDs:
- **Diet Preferences**: Show diet option images with labels
- **Allergies**: Show ingredient images with names

## Implementation Steps

### 1. Create Helper Functions
**File**: [`lib/allergies-diet-helpers.ts`](lib/allergies-diet-helpers.ts)

Create helper functions to resolve IDs to display data:

```typescript
import { DIET_OPTIONS } from "@/features/onboarding/sections/taste/diet-options";
import { POPULAR_INGREDIENTS } from "@/lib/constants";
import { Ingredient } from "@/lib/spoonacular";

const INGREDIENT_IMAGE_BASE_URL = "https://spoonacular.com/cdn/ingredients_100x100";

export interface DisplayDietPreference {
  id: string;
  label: string;
  image: any; // ImageSourcePropType
}

export interface DisplayAllergy {
  id: string;
  name: string;
  image?: string;
}

/**
 * Resolves diet preference IDs to display data
 */
export function resolveDietPreferences(dietIds: string[]): DisplayDietPreference[] {
  return dietIds
    .map(id => {
      const dietOption = DIET_OPTIONS.find(d => d.id === id);
      if (!dietOption) return null;
      
      return {
        id: dietOption.id,
        label: dietOption.label,
        image: dietOption.image,
      };
    })
    .filter(Boolean) as DisplayDietPreference[];
}

/**
 * Resolves allergy IDs to display data
 */
export function resolveAllergies(allergyIds: string[]): DisplayAllergy[] {
  return allergyIds
    .map(id => {
      // Try to parse as numeric ID first
      const numericId = parseInt(id, 10);
      if (!isNaN(numericId)) {
        // Find in popular ingredients by spoonacularId
        const popularIngredient = POPULAR_INGREDIENTS.find(
          ing => ing.spoonacularId === numericId
        );
        if (popularIngredient) {
          return {
            id,
            name: popularIngredient.name,
            image: popularIngredient.image,
          };
        }
        
        // If not found, create fallback
        return {
          id,
          name: `Ingredient ${numericId}`,
        };
      }
      
      // Handle name-prefixed IDs (e.g., "name-apple")
      if (id.startsWith("name-")) {
        const name = id
          .replace("name-", "")
          .split("-")
          .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
          .join(" ");
        
        // Try to find matching popular ingredient
        const popularIngredient = POPULAR_INGREDIENTS.find(
          ing => ing.name.toLowerCase() === name.toLowerCase()
        );
        
        return {
          id,
          name,
          image: popularIngredient?.image,
        };
      }
      
      // Fallback for unknown IDs
      return {
        id,
        name: id,
      };
    })
    .filter(Boolean) as DisplayAllergy[];
}

/**
 * Gets the full image URL for an allergy item
 */
export function getAllergyImageUrl(imagePath?: string): string | undefined {
  if (!imagePath) return undefined;
  return `${INGREDIENT_IMAGE_BASE_URL}/${imagePath}`;
}
```

### 2. Modify [`allergies-diet.tsx`](app/(app)/(profile)/allergies-diet.tsx)

Update the component to:
- Import helper functions
- Resolve IDs to display data
- Use FlatList for grid layout
- Display images with Image component
- Show names below images

Key changes:
```typescript
import { resolveDietPreferences, resolveAllergies, getAllergyImageUrl } from "@/lib/allergies-diet-helpers";
import { FlatList, Image } from "react-native";

// In the component:
const dietItems = resolveDietPreferences(onboarding.selectedDietPreferences);
const allergyItems = resolveAllergies(onboarding.selectedAllergies);

// Replace tagsContainer with FlatList grids
<FlatList
  data={dietItems}
  renderItem={({ item }) => (
    <View style={styles.gridItem}>
      <Image source={item.image} style={styles.dietImage} />
      <Text style={styles.gridItemText}>{item.label}</Text>
    </View>
  )}
  numColumns={3}
  keyExtractor={(item) => item.id}
/>
```

### 3. Update Styles

Add new styles for grid layout:
```typescript
gridItem: {
  flex: 1,
  alignItems: "center",
  margin: 8,
  padding: 12,
  backgroundColor: "#FFFFFF",
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#E5E5E5",
},
dietImage: {
  width: 60,
  height: 60,
  borderRadius: 30,
  marginBottom: 8,
},
gridItemText: {
  fontSize: 14,
  color: Colors.text.primary,
  textAlign: "center",
},
allergyImage: {
  width: 50,
  height: 50,
  borderRadius: 25,
  marginBottom: 6,
},
```

### 4. Handle Loading States

Add loading states for images:
- Use placeholder views while images load
- Handle missing images gracefully
- Show error states if needed

## UI Layout

**Diet Preferences Section:**
- 3-column grid layout
- Each item: Diet image (circular) + Label below
- Background: White cards with subtle border
- Selected state: Green border (if needed)

**Allergies Section:**
- 3-column grid layout  
- Each item: Ingredient image (circular) + Name below
- Background: Light red cards (to indicate restrictions)
- Use Spoonacular ingredient images

## Data Flow

1. Component loads onboarding data (IDs)
2. Helper functions resolve IDs to display data
3. FlatList renders grid with images and names
4. Images loaded from:
   - Diet: Local assets (from diet-options.ts)
   - Allergies: Spoonacular CDN URLs

## Testing Checklist

- [ ] Diet preferences show correct images and labels
- [ ] Allergies show correct ingredient images and names
- [ ] Grid layout works on different screen sizes
- [ ] Images load properly from Spoonacular CDN
- [ ] Fallback handling for missing/invalid IDs
- [ ] Empty state still works when no data
- [ ] Performance is acceptable with many items

## Files to Modify

1. **New**: [`lib/allergies-diet-helpers.ts`](lib/allergies-diet-helpers.ts) - Helper functions
2. **Modify**: [`app/(app)/(profile)/allergies-diet.tsx`](app/(app)/(profile)/allergies-diet.tsx) - Main screen
3. **Check**: [`lib/constants.ts`](lib/constants.ts) - Verify POPULAR_INGREDIENTS structure

## Next Steps

1. Switch to Code mode
2. Create helper functions file
3. Update allergies-diet.tsx component
4. Test the implementation
5. Refine based on results