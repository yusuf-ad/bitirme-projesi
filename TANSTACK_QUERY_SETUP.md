# TanStack Query Migration - Complete ✅

## What Was Done

### 1. **Installed TanStack Query**

```bash
npm install @tanstack/react-query
```

### 2. **Created New Hook: `use-recipes-query.ts`**

- Uses `useInfiniteQuery` from TanStack Query
- Automatic caching with configurable stale time and garbage collection
- Deduplicates recipes by ID
- Handles both search and random recipe modes
- Smart pagination detection

**Cache Configuration:**

- `gcTime`: 30 minutes (keeps cache in memory)
- `staleTime`: 5 minutes (data is fresh for 5 mins, no refetch)
- `retry`: 1 (retries failed requests once)

### 3. **Updated Root Layout (`app/_layout.tsx`)**

- Added `QueryClientProvider` wrapper
- Configured global default options for all queries
- Exponential backoff retry strategy for failed requests

### 4. **Updated `recipes.tsx`**

- Replaced `useInfiniteScroll` with `useRecipesQuery`
- Uses `fetchNextPage()` for infinite scroll
- Uses `refetch()` for pull-to-refresh

## Key Benefits

✅ **Automatic Caching** - Same query won't hit the API again within stale time
✅ **Deduplication** - Prevents duplicate API calls for same filters
✅ **Query Key Management** - Based on search, ingredients, and cuisines
✅ **Background Refetch** - Data updates automatically when stale
✅ **Network Error Handling** - Automatic retries with exponential backoff
✅ **Saves API Calls** - Critical for expensive Spoonacular API

## How It Works

### First Load

```
User opens app
→ Query key: ['recipes', '', '', '']
→ TanStack Query checks cache (empty)
→ Fetches from Spoonacular
→ Caches for 30 minutes
```

### User searches "pasta"

```
Search query debounced (400ms)
→ Query key changes: ['recipes', 'pasta', '', '']
→ New cache entry (or hits cache if searched before)
→ Data displayed
```

### User scrolls to bottom

```
handleScroll triggered
→ fetchNextPage() called
→ Appends next page to cached data
→ No duplicate API calls
```

### User opens same search later (within 5 mins)

```
Query key matches previous search
→ Data is "fresh" (within staleTime)
→ Uses cached data instantly
→ No API call made ✅
```

### Pull-to-refresh

```
User drags down
→ refetch() called
→ Forces fresh API call
→ Updates cache
```

## Files Modified

1. `/app/_layout.tsx` - Added QueryClientProvider
2. `/app/(app)/recipes.tsx` - Migrated to useRecipesQuery
3. `/hooks/use-recipes-query.ts` - NEW hook using TanStack Query

## Files No Longer Needed

- `/hooks/use-infinite-scroll.ts` - Can be kept as backup or deleted

## Testing the Setup

Try these scenarios:

1. ✅ Search for "pasta" - should cache
2. ✅ Scroll to load more - should load next page
3. ✅ Clear search - should show random recipes
4. ✅ Search for "pasta" again - should load from cache instantly
5. ✅ Pull to refresh - should update data
6. ✅ Change ingredient filter - should make new API call

## API Savings Example

**Before (no caching):**

- User searches "pasta" → API call #1
- Scrolls → API call #2
- Closes app, reopens, searches "pasta" → API call #3 (wasteful!)

**After (with TanStack Query):**

- User searches "pasta" → API call #1 (cached for 30 mins)
- Scrolls → API call #2 (for next page)
- Closes app, reopens, searches "pasta" within 5 mins → No API call! (uses cache)

## Next Steps (Optional)

1. **Adjust cache times** in `_layout.tsx` based on your needs:

   - Increase `staleTime` if data doesn't need frequent updates
   - Decrease `gcTime` if you want to save memory

2. **Add DevTools** (helpful for debugging):

```bash
npm install @tanstack/react-query-devtools
```

3. **Monitor API usage** - You should see fewer API calls now!
