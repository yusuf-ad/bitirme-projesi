import { SplashScreenController } from "@/features/splash-screen/splash-screen-controller";
import { useAuthContext } from "@/hooks/use-auth-context";
import { initHaptics } from "@/hooks/useHaptics";
import { loadSavedLanguage } from "@/lib/i18n";
import AuthProvider from "@/providers/auth-provider";
import { LanguageProvider } from "@/providers/language-provider";
import { OnboardingProvider } from "@/providers/onboarding-provider";
import { ThemeProvider, useTheme } from "@/providers/theme-provider";
import {
  AttachMenuOverlay,
  AttachMenuProvider,
} from "@/shared/components/attach-menu";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Initialize app preferences
const initializeApp = async () => {
  await Promise.all([initHaptics(), loadSavedLanguage()]);
};

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 30, // 30 minutes
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Separate RootNavigator so we can access the AuthContext
function RootNavigator() {
  const { isLoggedIn, isLoading } = useAuthContext();
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack>
        {/* Show loading screen while auth state is being determined */}
        <Stack.Protected guard={isLoading}>
          <Stack.Screen name="loading" options={{ headerShown: false }} />
        </Stack.Protected>

        {/* Show app screens when logged in and not loading */}
        <Stack.Protected guard={!isLoading && isLoggedIn}>
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
          <Stack.Screen name="(plan)" options={{ headerShown: false }} />
          <Stack.Screen name="(add)" options={{ headerShown: false }} />
          <Stack.Screen name="shopping-list" options={{ headerShown: false }} />
          <Stack.Screen name="ai-recipe" options={{ headerShown: false }} />
          <Stack.Screen name="ai-chat" options={{ headerShown: false }} />
          <Stack.Screen name="pantry-items" options={{ headerShown: false }} />
        </Stack.Protected>

        {/* Show onboarding screens when logged out and not loading */}
        <Stack.Protected guard={!isLoading && !isLoggedIn}>
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    initializeApp();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <OnboardingProvider>
              <AttachMenuProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <BottomSheetModalProvider>
                    <SplashScreenController />
                    <RootNavigator />
                    <AttachMenuOverlay />
                  </BottomSheetModalProvider>
                </GestureHandlerRootView>
              </AttachMenuProvider>
            </OnboardingProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
